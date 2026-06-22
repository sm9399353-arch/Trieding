import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  TrendingUp, TrendingDown, DollarSign, Activity, Target,
  Award, Zap, BarChart2, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle, Star
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import FearGreedGauge from '../components/FearGreedGauge';

export default function DashboardPage() {
  const {
    balance, initialBalance, totalPnL, dailyPnL, totalTrades,
    winningTrades, losingTrades, orders, futuresPositions, portfolio,
    marketData, theme, userLevel, userXP, achievements, challenges,
    setCurrentPage, setSelectedCoin
  } = useStore();

  const isDark = theme === 'dark';

  const portfolioValue = useMemo(() => {
    return Object.values(portfolio).reduce((sum, pos) => {
      const coin = marketData.find(c => c.id === pos.coinData.id);
      const price = coin?.current_price ?? pos.avgBuyPrice;
      return sum + pos.amount * price;
    }, 0);
  }, [portfolio, marketData]);

  const totalAssets = balance + portfolioValue;
  const openFutures = futuresPositions.filter(p => p.status === 'open');
  const openOrders = orders.filter(o => o.status === 'open');
  const closedOrders = orders.filter(o => o.status === 'filled');
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
  const totalReturn = ((totalAssets - initialBalance) / initialBalance) * 100;

  // Generate equity curve data
  const equityCurve = useMemo(() => {
    const points = [{ date: 'شروع', value: initialBalance }];
    const filledOrders = [...orders].filter(o => o.status === 'filled' && o.filledAt).sort((a, b) => (a.filledAt || 0) - (b.filledAt || 0));
    let runningBalance = initialBalance;
    filledOrders.forEach(order => {
      runningBalance += (order.pnl || 0);
      const d = new Date(order.filledAt || Date.now());
      points.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, value: runningBalance });
    });
    points.push({ date: 'اکنون', value: totalAssets });
    return points.length > 2 ? points : [
      { date: 'شروع', value: initialBalance },
      { date: 'هفته ۱', value: initialBalance * 1.02 },
      { date: 'هفته ۲', value: initialBalance * 0.98 },
      { date: 'هفته ۳', value: initialBalance * 1.05 },
      { date: 'اکنون', value: totalAssets },
    ];
  }, [orders, totalAssets, initialBalance]);

  const topGainers = marketData
    .filter(c => c.price_change_percentage_24h > 0)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5);

  const topLosers = marketData
    .filter(c => c.price_change_percentage_24h < 0)
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5);

  const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';

  const StatCard = ({ icon, label, value, change, changeLabel, color }: any) => (
    <div className={`rounded-2xl border p-5 ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change).toFixed(2)}%
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold font-mono mb-1 ${textPrimary}`}>{value}</div>
      <div className={`text-xs ${textMuted}`}>{label}</div>
      {changeLabel && <div className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{changeLabel}</div>}
    </div>
  );

  const fmt = (n: number) => {
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        <div className="relative z-10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} className="text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">{userLevel}</span>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-400 text-sm">{userXP} XP</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">سلام، معامله‌گر! 👋</h1>
            <p className="text-gray-400 text-sm">امروز چه استراتژی‌ای داری؟ بازار منتظر توست.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage('trade')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              شروع ترید
            </button>
            <button
              onClick={() => setCurrentPage('market')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 bg-white/10 hover:bg-white/20 transition-all"
            >
              بررسی بازار
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign size={20} className="text-indigo-400" />}
          label="ارزش کل دارایی‌ها"
          value={fmt(totalAssets)}
          change={totalReturn}
          changeLabel={`${totalReturn >= 0 ? '+' : ''}${fmt(totalAssets - initialBalance)}`}
          color="bg-indigo-500/15"
        />
        <StatCard
          icon={<Activity size={20} className="text-emerald-400" />}
          label="موجودی نقدی"
          value={fmt(balance)}
          color="bg-emerald-500/15"
        />
        <StatCard
          icon={totalPnL >= 0 ? <TrendingUp size={20} className="text-emerald-400" /> : <TrendingDown size={20} className="text-red-400" />}
          label="سود/زیان کل"
          value={`${totalPnL >= 0 ? '+' : ''}${fmt(totalPnL)}`}
          change={totalReturn}
          color={totalPnL >= 0 ? "bg-emerald-500/15" : "bg-red-500/15"}
        />
        <StatCard
          icon={dailyPnL >= 0 ? <TrendingUp size={20} className="text-blue-400" /> : <TrendingDown size={20} className="text-red-400" />}
          label="سود/زیان امروز"
          value={`${dailyPnL >= 0 ? '+' : ''}${fmt(dailyPnL)}`}
          color="bg-blue-500/15"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <div className={`lg:col-span-2 rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`font-semibold ${textPrimary}`}>منحنی رشد سرمایه</h2>
              <p className={`text-xs ${textMuted} mt-0.5`}>عملکرد کلی پرتفوی</p>
            </div>
            <div className={`text-sm font-bold font-mono ${totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1f2937' : '#fff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px', fontSize: '12px',
                  color: isDark ? '#f3f4f6' : '#111827'
                }}
                formatter={(v: any) => [`${fmt(Number(v))}`, 'ارزش']}
              />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#equityGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trade Stats */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <h2 className={`font-semibold mb-5 ${textPrimary}`}>آمار معاملات</h2>
          <div className="space-y-4">
            {[
              { label: 'کل معاملات', value: totalTrades, icon: <BarChart2 size={14} /> },
              { label: 'معاملات موفق', value: winningTrades, icon: <CheckCircle size={14} className="text-emerald-400" /> },
              { label: 'معاملات ناموفق', value: losingTrades, icon: <TrendingDown size={14} className="text-red-400" /> },
              { label: 'نرخ موفقیت', value: `${winRate}%`, icon: <Target size={14} className="text-indigo-400" /> },
              { label: 'پوزیشن‌های باز', value: openFutures.length + openOrders.length, icon: <Zap size={14} className="text-yellow-400" /> },
              { label: 'معاملات بسته', value: closedOrders.length, icon: <Clock size={14} className="text-blue-400" /> },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={textMuted}>{stat.icon}</span>
                  <span className={`text-sm ${textMuted}`}>{stat.label}</span>
                </div>
                <span className={`text-sm font-bold font-mono ${textPrimary}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Win Rate Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-emerald-400">برد {winRate}%</span>
              <span className="text-red-400">باخت {100 - winRate}%</span>
            </div>
            <div className={`h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${winRate}%`,
                  background: 'linear-gradient(90deg, #10b981, #6366f1)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-400" />
            <h2 className={`font-semibold ${textPrimary}`}>بیشترین رشد ۲۴ ساعته</h2>
          </div>
          <div className="space-y-3">
            {topGainers.map(coin => (
              <button
                key={coin.id}
                onClick={() => { setSelectedCoin(coin); setCurrentPage('trade'); }}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
              >
                <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/28/6366f1/white?text=${coin.symbol[0].toUpperCase()}`; }} />
                <div className="flex-1 text-left">
                  <div className={`text-sm font-medium ${textPrimary}`}>{coin.symbol.toUpperCase()}</div>
                  <div className={`text-xs ${textMuted}`}>${coin.current_price < 0.01 ? coin.current_price.toFixed(6) : coin.current_price.toFixed(2)}</div>
                </div>
                <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  +{coin.price_change_percentage_24h.toFixed(2)}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={16} className="text-red-400" />
            <h2 className={`font-semibold ${textPrimary}`}>بیشترین ریزش ۲۴ ساعته</h2>
          </div>
          <div className="space-y-3">
            {topLosers.map(coin => (
              <button
                key={coin.id}
                onClick={() => { setSelectedCoin(coin); setCurrentPage('trade'); }}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
              >
                <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/28/ef4444/white?text=${coin.symbol[0].toUpperCase()}`; }} />
                <div className="flex-1 text-left">
                  <div className={`text-sm font-medium ${textPrimary}`}>{coin.symbol.toUpperCase()}</div>
                  <div className={`text-xs ${textMuted}`}>${coin.current_price < 0.01 ? coin.current_price.toFixed(6) : coin.current_price.toFixed(2)}</div>
                </div>
                <div className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold">
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-yellow-400" />
            <h2 className={`font-semibold ${textPrimary}`}>دستاوردها</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {achievements.slice(0, 8).map(ach => (
              <div
                key={ach.id}
                className={`p-2 rounded-xl border transition-all text-center ${
                  ach.unlocked
                    ? isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'
                    : isDark ? 'bg-gray-800/50 border-gray-700/50 opacity-50' : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-lg">{ach.icon}</div>
                <div className={`text-[10px] mt-1 font-medium ${ach.unlocked ? 'text-yellow-400' : textMuted}`}>
                  {ach.title}
                </div>
              </div>
            ))}
          </div>

          {/* Challenges Progress */}
          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`text-xs font-medium mb-3 ${textMuted}`}>چالش‌های فعال</div>
            {challenges.slice(0, 2).map(ch => (
              <div key={ch.id} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className={textPrimary}>{ch.title}</span>
                  <span className={textMuted}>{Math.min(Math.round((ch.current / ch.target) * 100), 100)}%</span>
                </div>
                <div className={`h-1.5 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((ch.current / ch.target) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fear & Greed + Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FearGreedGauge />
        {[
          { label: 'مارکت کپ کل', value: `$${(marketData.reduce((s, c) => s + c.market_cap, 0) / 1e12).toFixed(2)}T`, trend: true },
          { label: 'حجم ۲۴ ساعته', value: `$${(marketData.reduce((s, c) => s + c.total_volume, 0) / 1e9).toFixed(0)}B`, trend: true },
          { label: 'بیتکوین دومیننس', value: `${marketData.length > 0 ? ((marketData[0]?.market_cap / marketData.reduce((s, c) => s + c.market_cap, 0)) * 100).toFixed(1) : '—'}%`, trend: false },
        ].map((item, i) => (
          <div key={i} className={`rounded-2xl border p-4 flex flex-col justify-center ${cardBg}`}>
            <div className={`text-xs ${textMuted} mb-2`}>{item.label}</div>
            <div className={`text-xl font-bold font-mono gradient-text`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Open Positions */}
      {(openFutures.length > 0 || Object.keys(portfolio).length > 0) && (
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold ${textPrimary}`}>پوزیشن‌های باز</h2>
            <button onClick={() => setCurrentPage('portfolio')} className="text-xs text-indigo-400 hover:text-indigo-300">
              مشاهده همه
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={textMuted}>
                  <th className="text-left pb-3 font-medium">دارایی</th>
                  <th className="text-right pb-3 font-medium">مقدار</th>
                  <th className="text-right pb-3 font-medium">قیمت فعلی</th>
                  <th className="text-right pb-3 font-medium">ارزش</th>
                  <th className="text-right pb-3 font-medium">سود/زیان</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(portfolio).slice(0, 5).map(([coinId, pos]) => {
                  const coin = marketData.find(c => c.id === coinId);
                  const price = coin?.current_price ?? pos.avgBuyPrice;
                  const value = pos.amount * price;
                  const pnl = (price - pos.avgBuyPrice) * pos.amount;
                  const pnlPct = ((price - pos.avgBuyPrice) / pos.avgBuyPrice) * 100;
                  return (
                    <tr key={coinId} className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <img src={pos.coinData.image} alt={pos.coinData.name} className="w-6 h-6 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/24/6366f1/white?text=${pos.coinData.symbol[0].toUpperCase()}`; }} />
                          <div>
                            <div className={`font-medium ${textPrimary}`}>{pos.coinData.symbol.toUpperCase()}</div>
                            <div className={`text-xs ${textMuted}`}>{pos.coinData.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`text-right font-mono ${textPrimary}`}>{pos.amount.toFixed(4)}</td>
                      <td className={`text-right font-mono ${textPrimary}`}>${price.toFixed(2)}</td>
                      <td className={`text-right font-mono ${textPrimary}`}>${value.toFixed(2)}</td>
                      <td className={`text-right font-bold font-mono ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
