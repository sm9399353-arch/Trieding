import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { generateCandleData } from '../hooks/useMarketData';
import {
  TrendingUp, TrendingDown, Search, ChevronDown, Info,
  AlertCircle, BarChart2, BookOpen
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid
} from 'recharts';

type OrderType = 'market' | 'limit' | 'stop_limit';
type OrderSide = 'buy' | 'sell';
type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

const TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

const VOLATILITY_MAP: Record<TimeFrame, number> = {
  '1m': 0.003, '5m': 0.006, '15m': 0.01, '1h': 0.02, '4h': 0.035, '1d': 0.06, '1w': 0.12
};
const COUNT_MAP: Record<TimeFrame, number> = {
  '1m': 200, '5m': 200, '15m': 180, '1h': 168, '4h': 120, '1d': 90, '1w': 52
};

export default function TradePage() {
  const { selectedCoin, marketData, balance, portfolio, placeOrder, theme, setCurrentPage } = useStore();
  const isDark = theme === 'dark';

  const coin = selectedCoin || marketData[0];

  const [tf, setTf] = useState<TimeFrame>('1h');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [side, setSide] = useState<OrderSide>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [useTP, setUseTP] = useState(false);
  const [useSL, setUseSL] = useState(false);
  const [pctSlider, setPctSlider] = useState(0);
  const [showOrderBook, setShowOrderBook] = useState(true);
  const [activeIndicator, setActiveIndicator] = useState<string[]>(['volume']);
  const [coinSearch, setCoinSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { setSelectedCoin } = useStore();

  const chartData = useMemo(() => {
    if (!coin) return [];
    return generateCandleData(coin.current_price, COUNT_MAP[tf], VOLATILITY_MAP[tf]);
  }, [coin?.id, tf]);

  // RSI calculation
  const rsiData = useMemo(() => {
    if (chartData.length < 14) return [];
    const closes = chartData.map(d => d.close);
    const rsi: number[] = [];
    for (let i = 14; i < closes.length; i++) {
      const gains: number[] = [];
      const losses: number[] = [];
      for (let j = i - 14; j < i; j++) {
        const diff = closes[j + 1] - closes[j];
        if (diff > 0) gains.push(diff);
        else losses.push(Math.abs(diff));
      }
      const avgGain = gains.reduce((s, v) => s + v, 0) / 14;
      const avgLoss = losses.reduce((s, v) => s + v, 0) / 14;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(Math.round(100 - 100 / (1 + rs)));
    }
    return chartData.slice(14).map((d, i) => ({ ...d, rsi: rsi[i] }));
  }, [chartData]);

  // MACD
  const macdData = useMemo(() => {
    if (chartData.length < 26) return [];
    const closes = chartData.map(d => d.close);
    const ema = (arr: number[], period: number) => {
      const k = 2 / (period + 1);
      let emaVal = arr.slice(0, period).reduce((s, v) => s + v, 0) / period;
      const result = [emaVal];
      for (let i = period; i < arr.length; i++) {
        emaVal = arr[i] * k + emaVal * (1 - k);
        result.push(emaVal);
      }
      return result;
    };
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macdLine = ema12.slice(14).map((v, i) => v - ema26[i]);
    const signal = ema(macdLine, 9);
    return chartData.slice(26).map((d, i) => ({
      ...d,
      macd: parseFloat(macdLine[i]?.toFixed(4) || '0'),
      signal: parseFloat(signal[i]?.toFixed(4) || '0'),
      histogram: parseFloat(((macdLine[i] || 0) - (signal[i] || 0)).toFixed(4)),
    }));
  }, [chartData]);

  const currentPrice = coin?.current_price || 0;
  const holding = coin ? portfolio[coin.id] : null;
  const effectivePrice = orderType === 'market' ? currentPrice : parseFloat(price) || currentPrice;
  const amountNum = parseFloat(amount) || 0;
  const total = amountNum * effectivePrice;

  const handlePctChange = (pct: number) => {
    setPctSlider(pct);
    if (side === 'buy') {
      const maxAmount = (balance * pct / 100) / effectivePrice;
      setAmount(maxAmount.toFixed(8));
    } else {
      const maxAmount = (holding?.amount || 0) * pct / 100;
      setAmount(maxAmount.toFixed(8));
    }
  };

  const handleSubmit = () => {
    if (!coin || amountNum <= 0) return;
    const orderPrice = orderType === 'market' ? currentPrice : effectivePrice;
    placeOrder({
      type: orderType,
      side,
      coinId: coin.id,
      coinSymbol: coin.symbol,
      coinName: coin.name,
      amount: amountNum,
      price: orderPrice,
      total: amountNum * orderPrice,
      takeProfitPrice: useTP ? parseFloat(takeProfitPrice) : undefined,
      stopLossPrice: useSL ? parseFloat(stopLossPrice) : undefined,
    });
    setAmount('');
    setPrice('');
    setPctSlider(0);
  };

  // Fake order book
  const orderBook = useMemo(() => {
    if (!currentPrice) return { asks: [], bids: [] };
    const spread = currentPrice * 0.001;
    const asks = Array.from({ length: 12 }, (_, i) => ({
      price: currentPrice + spread * (i + 1) * (1 + Math.random() * 0.5),
      amount: parseFloat((Math.random() * 5 + 0.1).toFixed(4)),
    }));
    const bids = Array.from({ length: 12 }, (_, i) => ({
      price: currentPrice - spread * (i + 1) * (1 + Math.random() * 0.5),
      amount: parseFloat((Math.random() * 5 + 0.1).toFixed(4)),
    }));
    return { asks: asks.reverse(), bids };
  }, [currentPrice]);

  const indicators = ['volume', 'rsi', 'macd', 'bb', 'ema'];
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';

  const fmtPrice = (p: number) => {
    if (!p) return '—';
    if (p < 0.01) return `$${p.toFixed(6)}`;
    if (p < 1) return `$${p.toFixed(4)}`;
    return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredCoins = useMemo(() =>
    marketData.filter(c =>
      !coinSearch || c.name.toLowerCase().includes(coinSearch.toLowerCase()) || c.symbol.toLowerCase().includes(coinSearch.toLowerCase())
    ).slice(0, 20),
    [marketData, coinSearch]
  );

  if (!coin) {
    return (
      <div className={`flex items-center justify-center h-full ${textMuted}`}>
        <div className="text-center">
          <BarChart2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>لطفاً ابتدا یک ارز از بازار انتخاب کنید</p>
          <button onClick={() => setCurrentPage('market')} className="mt-4 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm">
            رفتن به بازار
          </button>
        </div>
      </div>
    );
  }

  const isUp = coin.price_change_percentage_24h >= 0;

  return (
    <div className={`flex h-full ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Left: Chart + Order Form */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Coin Header */}
        <div className={`flex items-center gap-4 px-4 py-3 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
            >
              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/24/6366f1/white?text=${coin.symbol[0]}`; }} />
              <span className={`font-bold ${textPrimary}`}>{coin.symbol.toUpperCase()}/USDT</span>
              <ChevronDown size={14} className={textMuted} />
            </button>
            {showSearch && (
              <div className={`absolute top-full left-0 mt-2 w-64 rounded-xl border shadow-xl z-50 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="p-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <Search size={14} className={textMuted} />
                    <input
                      type="text"
                      placeholder="جستجو..."
                      value={coinSearch}
                      onChange={e => setCoinSearch(e.target.value)}
                      className="bg-transparent outline-none text-sm flex-1"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-48">
                  {filteredCoins.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCoin(c); setShowSearch(false); setCoinSearch(''); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                    >
                      <img src={c.image} alt={c.name} className="w-6 h-6 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/24/6366f1/white?text=${c.symbol[0]}`; }} />
                      <span className={`font-medium ${textPrimary}`}>{c.symbol.toUpperCase()}</span>
                      <span className={`text-xs ${textMuted}`}>{c.name}</span>
                      <span className={`ml-auto text-xs font-mono ${c.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {c.price_change_percentage_24h >= 0 ? '+' : ''}{c.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className={`text-2xl font-bold font-mono ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmtPrice(currentPrice)}
            </div>
            <div className={`text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1`}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isUp ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
            </div>
          </div>

          <div className={`hidden md:flex gap-6 text-xs ${textMuted}`}>
            {[
              { label: '۲۴H High', value: fmtPrice(coin.high_24h) },
              { label: '۲۴H Low', value: fmtPrice(coin.low_24h) },
              { label: 'Volume', value: coin.total_volume >= 1e9 ? `${(coin.total_volume/1e9).toFixed(2)}B` : `${(coin.total_volume/1e6).toFixed(2)}M` },
              { label: 'Rank', value: `#${coin.market_cap_rank || '—'}` },
            ].map((item, i) => (
              <div key={i}>
                <div className="mb-0.5">{item.label}</div>
                <div className={`font-mono font-medium ${textPrimary}`}>{item.value}</div>
              </div>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {indicators.map(ind => (
              <button
                key={ind}
                onClick={() => setActiveIndicator(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind])}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeIndicator.includes(ind)
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : `${textMuted} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
                }`}
              >
                {ind.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframes */}
        <div className={`flex items-center gap-1 px-4 py-2 border-b ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
          {TIMEFRAMES.map(t => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                tf === t ? 'bg-indigo-500 text-white' : `${textMuted} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 p-2 overflow-hidden">
          <ResponsiveContainer width="100%" height={activeIndicator.includes('rsi') || activeIndicator.includes('macd') ? '60%' : '100%'}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis
                dataKey="time"
                tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => {
                  const d = new Date(v * 1000);
                  return tf === '1d' || tf === '1w' ? `${d.getMonth()+1}/${d.getDate()}` : `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
                }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 10 }}
                axisLine={false} tickLine={false}
                width={70}
                tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v.toFixed(2)}`}
                orientation="right"
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1f2937' : '#fff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '10px', fontSize: '12px',
                  color: isDark ? '#f3f4f6' : '#111827'
                }}
                formatter={(v: any, name: any) => {
                  if (name === 'volume') return [`${Number(v).toLocaleString()}`, 'حجم'];
                  return [`$${Number(v).toFixed(4)}`, name];
                }}
              />
              {/* Candlestick simulation using bar */}
              <Bar dataKey="volume" fill={isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'} yAxisId="volume" hide={!activeIndicator.includes('volume')} />
              <Line type="monotone" dataKey="close" stroke={isUp ? '#10b981' : '#ef4444'} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="high" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} strokeWidth={1} dot={false} strokeDasharray="2 4" />
              <Line type="monotone" dataKey="low" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} strokeWidth={1} dot={false} strokeDasharray="2 4" />
              <ReferenceLine y={currentPrice} stroke="rgba(99,102,241,0.6)" strokeDasharray="4 4" strokeWidth={1} />
            </ComposedChart>
          </ResponsiveContainer>

          {/* RSI Chart */}
          {activeIndicator.includes('rsi') && rsiData.length > 0 && (
            <div className="mt-1">
              <div className={`text-xs px-2 mb-1 font-medium ${textMuted}`}>RSI (14)</div>
              <ResponsiveContainer width="100%" height={80}>
                <ComposedChart data={rsiData}>
                  <XAxis hide />
                  <YAxis domain={[0, 100]} hide />
                  <ReferenceLine y={70} stroke="rgba(239,68,68,0.5)" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="rgba(16,185,129,0.5)" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="rsi" stroke="#a78bfa" strokeWidth={1.5} dot={false} />
                  <Tooltip
                    contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '11px' }}
                    formatter={(v: any) => [v, 'RSI']}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MACD Chart */}
          {activeIndicator.includes('macd') && macdData.length > 0 && (
            <div className="mt-1">
              <div className={`text-xs px-2 mb-1 font-medium ${textMuted}`}>MACD</div>
              <ResponsiveContainer width="100%" height={80}>
                <ComposedChart data={macdData}>
                  <XAxis hide />
                  <YAxis hide />
                  <ReferenceLine y={0} stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} />
                  <Bar dataKey="histogram" fill="#6366f1" opacity={0.6} />
                  <Line type="monotone" dataKey="macd" stroke="#10b981" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="signal" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                  <Tooltip
                    contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '11px' }}
                    formatter={(v: any, n: any) => [Number(v).toFixed(4), n]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Order Form + Order Book */}
      <div className={`w-72 flex-shrink-0 flex flex-col border-l ${isDark ? 'border-gray-800' : 'border-gray-200'} overflow-y-auto`}>
        {/* Order Form */}
        <div className={`p-4 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          {/* Buy/Sell Toggle */}
          <div className="flex rounded-xl overflow-hidden mb-4">
            <button
              onClick={() => setSide('buy')}
              className={`flex-1 py-2 text-sm font-bold transition-all ${side === 'buy' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
            >
              خرید
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`flex-1 py-2 text-sm font-bold transition-all ${side === 'sell' ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
            >
              فروش
            </button>
          </div>

          {/* Order Type */}
          <div className="flex gap-1 mb-4">
            {(['market', 'limit', 'stop_limit'] as OrderType[]).map(t => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  orderType === t ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : `${textMuted} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
                }`}
              >
                {t === 'market' ? 'مارکت' : t === 'limit' ? 'لیمیت' : 'استاپ'}
              </button>
            ))}
          </div>

          {/* Balance Info */}
          <div className={`flex justify-between text-xs mb-3 ${textMuted}`}>
            <span>موجودی:</span>
            <span className="font-mono text-indigo-400">
              {side === 'buy' ? `$${balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : `${(holding?.amount || 0).toFixed(4)} ${coin.symbol.toUpperCase()}`}
            </span>
          </div>

          {/* Stop Price (for stop limit) */}
          {orderType === 'stop_limit' && (
            <div className="mb-3">
              <label className={`text-xs ${textMuted} block mb-1`}>قیمت استاپ</label>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <span className={`text-xs ${textMuted}`}>$</span>
                <input
                  type="number"
                  value={stopPrice}
                  onChange={e => setStopPrice(e.target.value)}
                  placeholder={currentPrice.toFixed(2)}
                  className="flex-1 bg-transparent outline-none text-sm font-mono"
                />
              </div>
            </div>
          )}

          {/* Limit Price */}
          {orderType !== 'market' && (
            <div className="mb-3">
              <label className={`text-xs ${textMuted} block mb-1`}>قیمت {orderType === 'limit' ? 'لیمیت' : 'ورود'}</label>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <span className={`text-xs ${textMuted}`}>$</span>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder={currentPrice.toFixed(2)}
                  className="flex-1 bg-transparent outline-none text-sm font-mono"
                />
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <label className={`text-xs ${textMuted}`}>مقدار ({coin.symbol.toUpperCase()})</label>
              <button
                onClick={() => {
                  if (side === 'buy') setAmount(((balance * 0.99) / effectivePrice).toFixed(8));
                  else setAmount((holding?.amount || 0).toFixed(8));
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                حداکثر
              </button>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00000000"
                className="flex-1 bg-transparent outline-none text-sm font-mono"
              />
              <span className={`text-xs font-medium text-indigo-400`}>{coin.symbol.toUpperCase()}</span>
            </div>
          </div>

          {/* Percentage Slider */}
          <div className="mb-3">
            <input
              type="range" min="0" max="100" value={pctSlider}
              onChange={e => handlePctChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1">
              {[0, 25, 50, 75, 100].map(p => (
                <button key={p} onClick={() => handlePctChange(p)} className={`text-xs px-1 transition-colors ${pctSlider === p ? 'text-indigo-400' : textMuted}`}>
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* TP/SL */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="tp" checked={useTP} onChange={e => setUseTP(e.target.checked)} className="rounded accent-indigo-500" />
              <label htmlFor="tp" className={`text-xs ${textMuted} cursor-pointer`}>Take Profit</label>
              {useTP && (
                <input
                  type="number"
                  value={takeProfitPrice}
                  onChange={e => setTakeProfitPrice(e.target.value)}
                  placeholder={`${(currentPrice * 1.05).toFixed(2)}`}
                  className={`flex-1 px-2 py-1 rounded-lg text-xs font-mono outline-none border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="sl" checked={useSL} onChange={e => setUseSL(e.target.checked)} className="rounded accent-indigo-500" />
              <label htmlFor="sl" className={`text-xs ${textMuted} cursor-pointer`}>Stop Loss</label>
              {useSL && (
                <input
                  type="number"
                  value={stopLossPrice}
                  onChange={e => setStopLossPrice(e.target.value)}
                  placeholder={`${(currentPrice * 0.95).toFixed(2)}`}
                  className={`flex-1 px-2 py-1 rounded-lg text-xs font-mono outline-none border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                />
              )}
            </div>
          </div>

          {/* Total */}
          <div className={`flex justify-between text-sm mb-4 px-3 py-2 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <span className={textMuted}>مجموع</span>
            <span className={`font-bold font-mono ${textPrimary}`}>${total.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={amountNum <= 0}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              side === 'buy' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400'
            }`}
          >
            {side === 'buy' ? '🟢' : '🔴'} {side === 'buy' ? 'خرید' : 'فروش'} {coin.symbol.toUpperCase()}
          </button>

          {amountNum > 0 && side === 'buy' && total > balance && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle size={12} />
              <span>موجودی کافی نیست</span>
            </div>
          )}
        </div>

        {/* Order Book Toggle */}
        <button
          onClick={() => setShowOrderBook(!showOrderBook)}
          className={`flex items-center justify-between px-4 py-2 text-xs font-medium border-b ${isDark ? 'border-gray-800 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={12} />
            دفتر سفارشات
          </div>
          <Info size={12} />
        </button>

        {showOrderBook && (
          <div className="flex-1 overflow-y-auto">
            {/* Asks (Red - Sell Orders) */}
            <div>
              {orderBook.asks.map((ask, i) => {
                const maxAmt = Math.max(...orderBook.asks.map(a => a.amount));
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-1 relative" style={{ fontSize: '11px' }}>
                    <div className="absolute inset-0 right-0" style={{ width: `${(ask.amount / maxAmt) * 100}%`, background: 'rgba(239,68,68,0.08)', right: 0, left: 'auto' }} />
                    <span className="text-red-400 font-mono flex-1">{ask.price.toFixed(ask.price > 100 ? 2 : 4)}</span>
                    <span className={`font-mono ${textMuted}`}>{ask.amount.toFixed(4)}</span>
                  </div>
                );
              })}
            </div>

            {/* Spread */}
            <div className={`px-3 py-2 border-y ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} text-center`}>
              <span className={`text-sm font-bold font-mono ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmtPrice(currentPrice)}
              </span>
              <span className={`text-xs ml-2 ${textMuted}`}>اسپرد: {(currentPrice * 0.001).toFixed(4)}</span>
            </div>

            {/* Bids (Green - Buy Orders) */}
            <div>
              {orderBook.bids.map((bid, i) => {
                const maxAmt = Math.max(...orderBook.bids.map(b => b.amount));
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-1 relative" style={{ fontSize: '11px' }}>
                    <div className="absolute inset-0" style={{ width: `${(bid.amount / maxAmt) * 100}%`, background: 'rgba(16,185,129,0.08)' }} />
                    <span className="text-emerald-400 font-mono flex-1">{bid.price.toFixed(bid.price > 100 ? 2 : 4)}</span>
                    <span className={`font-mono ${textMuted}`}>{bid.amount.toFixed(4)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
