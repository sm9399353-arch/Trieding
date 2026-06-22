import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { generateCandleData } from '../hooks/useMarketData';
import { Zap, AlertTriangle, TrendingUp, TrendingDown, X, ChevronDown, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

export default function FuturesPage() {
  const { marketData, balance, futuresPositions, openFuturesPosition, closeFuturesPosition, theme, selectedCoin, setSelectedCoin } = useStore();
  const isDark = theme === 'dark';

  const coin = selectedCoin || marketData[0];
  const currentPrice = coin?.current_price || 0;

  const [side, setSide] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [showCoinSearch, setShowCoinSearch] = useState(false);
  const [coinSearch, setCoinSearch] = useState('');

  const marginNum = parseFloat(margin) || 0;
  const positionSize = marginNum * leverage;
  const liquidationPrice = side === 'long'
    ? currentPrice * (1 - 1 / leverage * 0.9)
    : currentPrice * (1 + 1 / leverage * 0.9);

  const openPositions = futuresPositions.filter(p => p.status === 'open');
  const closedPositions = futuresPositions.filter(p => p.status === 'closed' || p.status === 'liquidated');

  const chartData = useMemo(() => {
    if (!coin) return [];
    return generateCandleData(coin.current_price, 100, 0.02);
  }, [coin?.id]);

  const handleOpen = () => {
    if (!coin || marginNum <= 0 || marginNum > balance) return;
    openFuturesPosition({
      coinId: coin.id,
      coinSymbol: coin.symbol,
      coinName: coin.name,
      side,
      leverage,
      entryPrice: currentPrice,
      amount: positionSize / currentPrice,
      margin: marginNum,
      liquidationPrice,
      takeProfitPrice: takeProfitPrice ? parseFloat(takeProfitPrice) : undefined,
      stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : undefined,
    });
    setMargin('');
  };

  const LEVERAGES = [1, 2, 3, 5, 10, 20, 25, 50, 75, 100, 125];

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';

  const filteredCoins = useMemo(() =>
    marketData.filter(c => !coinSearch || c.name.toLowerCase().includes(coinSearch.toLowerCase()) || c.symbol.toLowerCase().includes(coinSearch.toLowerCase())).slice(0, 15),
    [marketData, coinSearch]
  );

  const fmtPrice = (p: number) => {
    if (!p) return '—';
    if (p < 0.01) return `$${p.toFixed(6)}`;
    if (p < 1) return `$${p.toFixed(4)}`;
    return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={`flex h-full ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Left: Chart + Positions */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Coin Header */}
        <div className={`flex items-center gap-4 px-4 py-3 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="relative">
            <button
              onClick={() => setShowCoinSearch(!showCoinSearch)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
            >
              {coin && <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/24/6366f1/white?text=${coin?.symbol[0] || 'C'}`; }} />}
              <span className={`font-bold ${textPrimary}`}>{coin ? `${coin.symbol.toUpperCase()}/USDT` : 'انتخاب ارز'}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold">PERP</span>
              <ChevronDown size={14} className={textMuted} />
            </button>
            {showCoinSearch && (
              <div className={`absolute top-full left-0 mt-2 w-64 rounded-xl border shadow-xl z-50 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="p-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <Search size={14} className={textMuted} />
                    <input type="text" placeholder="جستجو..." value={coinSearch} onChange={e => setCoinSearch(e.target.value)} className="bg-transparent outline-none text-sm flex-1" autoFocus />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-48">
                  {filteredCoins.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCoin(c); setShowCoinSearch(false); setCoinSearch(''); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                      <img src={c.image} alt={c.name} className="w-6 h-6 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/24/6366f1/white?text=${c.symbol[0]}`; }} />
                      <span className={`font-medium ${textPrimary}`}>{c.symbol.toUpperCase()}</span>
                      <span className={`text-xs ${textMuted}`}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {coin && (
            <>
              <div>
                <div className={`text-2xl font-bold font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmtPrice(currentPrice)}
                </div>
                <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                </div>
              </div>
              <div className={`hidden md:flex gap-6 text-xs ${textMuted}`}>
                {[
                  { label: 'Funding Rate', value: '0.01%' },
                  { label: 'Open Interest', value: `${(coin.total_volume / 1e9).toFixed(2)}B` },
                  { label: 'Mark Price', value: fmtPrice(currentPrice * 1.0001) },
                  { label: 'Index Price', value: fmtPrice(currentPrice) },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="mb-0.5">{s.label}</div>
                    <div className={`font-mono font-medium ${textPrimary}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Chart */}
        <div className={`flex-1 p-4 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} />
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v.toFixed(2)}`} width={65} />
              <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '10px', fontSize: '12px' }} formatter={(v: any) => [`$${Number(v).toFixed(4)}`, 'قیمت']} />
              <ReferenceLine y={currentPrice} stroke="rgba(99,102,241,0.6)" strokeDasharray="4 4" />
              {openPositions.map(pos => (
                <ReferenceLine key={pos.id} y={pos.entryPrice} stroke={pos.side === 'long' ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'} strokeDasharray="3 3" label={{ value: `${pos.side.toUpperCase()} ${pos.leverage}x`, fill: pos.side === 'long' ? '#10b981' : '#ef4444', fontSize: 10 }} />
              ))}
              <Line type="monotone" dataKey="close" stroke={coin?.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444'} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Positions Table */}
        <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`} style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <div className={`px-4 py-2 text-xs font-semibold ${textMuted} border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
            پوزیشن‌های باز ({openPositions.length})
          </div>
          {openPositions.length === 0 ? (
            <div className={`text-center py-6 text-sm ${textMuted}`}>هیچ پوزیشنی باز نیست</div>
          ) : (
            <table className="w-full text-xs">
              <thead className={`${textMuted} border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <tr>
                  <th className="text-left px-4 py-2">ارز</th>
                  <th className="text-center py-2">نوع</th>
                  <th className="text-center py-2">اهرم</th>
                  <th className="text-right py-2">قیمت ورود</th>
                  <th className="text-right py-2">قیمت فعلی</th>
                  <th className="text-right py-2">سود/زیان</th>
                  <th className="text-right py-2">لیکویید</th>
                  <th className="text-center py-2">بستن</th>
                </tr>
              </thead>
              <tbody>
                {openPositions.map(pos => (
                  <tr key={pos.id} className={`border-b ${isDark ? 'border-gray-800/50' : 'border-gray-50'}`}>
                    <td className="px-4 py-2">
                      <span className={`font-semibold ${textPrimary}`}>{pos.coinSymbol.toUpperCase()}/USDT</span>
                    </td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.side === 'long' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {pos.side === 'long' ? 'لانگ' : 'شورت'}
                      </span>
                    </td>
                    <td className="py-2 text-center">
                      <span className="text-yellow-400 font-bold">{pos.leverage}x</span>
                    </td>
                    <td className={`py-2 text-right font-mono ${textMuted}`}>{fmtPrice(pos.entryPrice)}</td>
                    <td className={`py-2 text-right font-mono ${textPrimary}`}>{fmtPrice(pos.currentPrice)}</td>
                    <td className={`py-2 text-right font-bold font-mono ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} ({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                    </td>
                    <td className="py-2 text-right font-mono text-red-400">{fmtPrice(pos.liquidationPrice)}</td>
                    <td className="py-2 text-center">
                      <button
                        onClick={() => closeFuturesPosition(pos.id, pos.currentPrice || currentPrice)}
                        className="p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`w-72 flex-shrink-0 flex flex-col border-l overflow-y-auto ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            <span className={`font-semibold text-sm ${textPrimary}`}>معاملات فیوچرز</span>
          </div>
        </div>

        {/* Long/Short */}
        <div className="p-4 space-y-4">
          <div className="flex rounded-xl overflow-hidden">
            <button onClick={() => setSide('long')} className={`flex-1 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2 ${side === 'long' ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              <TrendingUp size={14} /> لانگ
            </button>
            <button onClick={() => setSide('short')} className={`flex-1 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2 ${side === 'short' ? 'bg-red-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              <TrendingDown size={14} /> شورت
            </button>
          </div>

          {/* Leverage */}
          <div>
            <div className="flex justify-between mb-2">
              <span className={`text-xs ${textMuted}`}>اهرم</span>
              <span className="text-sm font-bold text-yellow-400">{leverage}x</span>
            </div>
            <input type="range" min="1" max="125" value={leverage} onChange={e => setLeverage(Number(e.target.value))} className="w-full mb-2" />
            <div className="flex flex-wrap gap-1">
              {LEVERAGES.map(lev => (
                <button key={lev} onClick={() => setLeverage(lev)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${leverage === lev ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : `${textMuted} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}`}>
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          {leverage >= 50 && (
            <div className="flex items-start gap-2 p-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">اهرم بالا ریسک بیشتری دارد. احتمال لیکوییدیشن بالاست.</p>
            </div>
          )}

          {/* Balance */}
          <div className={`flex justify-between text-xs ${textMuted}`}>
            <span>موجودی</span>
            <span className="font-mono text-indigo-400">${balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>

          {/* Margin */}
          <div>
            <label className={`text-xs ${textMuted} block mb-1`}>مارجین (USDT)</label>
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${inputBg}`}>
              <input type="number" value={margin} onChange={e => setMargin(e.target.value)} placeholder="0.00" className="flex-1 bg-transparent outline-none text-sm font-mono" />
              <span className={`text-xs ${textMuted}`}>USDT</span>
            </div>
          </div>

          {/* TP/SL */}
          <div>
            <label className={`text-xs ${textMuted} block mb-1`}>Take Profit</label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${inputBg}`}>
              <input type="number" value={takeProfitPrice} onChange={e => setTakeProfitPrice(e.target.value)} placeholder={side === 'long' ? `${(currentPrice * 1.1).toFixed(2)}` : `${(currentPrice * 0.9).toFixed(2)}`} className="flex-1 bg-transparent outline-none text-sm font-mono" />
            </div>
          </div>
          <div>
            <label className={`text-xs ${textMuted} block mb-1`}>Stop Loss</label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${inputBg}`}>
              <input type="number" value={stopLossPrice} onChange={e => setStopLossPrice(e.target.value)} placeholder={side === 'long' ? `${(currentPrice * 0.95).toFixed(2)}` : `${(currentPrice * 1.05).toFixed(2)}`} className="flex-1 bg-transparent outline-none text-sm font-mono" />
            </div>
          </div>

          {/* Position Info */}
          {marginNum > 0 && (
            <div className={`p-3 rounded-xl space-y-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {[
                { label: 'اندازه پوزیشن', value: `$${positionSize.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
                { label: 'قیمت ورود', value: fmtPrice(currentPrice) },
                { label: 'قیمت لیکویید', value: fmtPrice(liquidationPrice), color: 'text-red-400' },
                { label: 'مارجین', value: `$${marginNum.toFixed(2)}` },
              ].map((info, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className={textMuted}>{info.label}</span>
                  <span className={`font-mono font-bold ${info.color || textPrimary}`}>{info.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleOpen}
            disabled={marginNum <= 0 || marginNum > balance || !coin}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 ${side === 'long' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400'}`}
          >
            {side === 'long' ? '🟢 باز کردن لانگ' : '🔴 باز کردن شورت'} {leverage}x
          </button>

          {marginNum > balance && (
            <p className="text-xs text-red-400 text-center">موجودی کافی نیست</p>
          )}
        </div>

        {/* Closed Positions Summary */}
        {closedPositions.length > 0 && (
          <div className={`border-t px-4 py-3 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`text-xs font-semibold mb-2 ${textMuted}`}>تاریخچه فیوچرز</div>
            <div className="space-y-2">
              {closedPositions.slice(0, 5).map(pos => (
                <div key={pos.id} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div>
                    <span className={`text-xs font-bold ${textPrimary}`}>{pos.coinSymbol.toUpperCase()}</span>
                    <span className={`ml-1 text-[10px] px-1 rounded ${pos.side === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>{pos.side === 'long' ? 'L' : 'S'}</span>
                    {pos.status === 'liquidated' && <span className="ml-1 text-[10px] text-red-500 font-bold">LIQD</span>}
                  </div>
                  <span className={`text-xs font-bold font-mono ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
