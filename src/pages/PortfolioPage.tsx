import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Briefcase, DollarSign } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

export default function PortfolioPage() {
  const { portfolio, marketData, balance, orders, initialBalance, theme } = useStore();
  const isDark = theme === 'dark';

  const holdings = useMemo(() => {
    return Object.entries(portfolio).map(([coinId, pos]) => {
      const coin = marketData.find(c => c.id === coinId);
      const price = coin?.current_price ?? pos.avgBuyPrice;
      const value = pos.amount * price;
      const pnl = (price - pos.avgBuyPrice) * pos.amount;
      const pnlPct = ((price - pos.avgBuyPrice) / pos.avgBuyPrice) * 100;
      return { coinId, ...pos, currentPrice: price, value, pnl, pnlPct };
    }).sort((a, b) => b.value - a.value);
  }, [portfolio, marketData]);

  const totalPortfolioValue = holdings.reduce((s, h) => s + h.value, 0);
  const totalAssets = balance + totalPortfolioValue;
  const totalReturn = ((totalAssets - initialBalance) / initialBalance) * 100;
  const totalPnL = holdings.reduce((s, h) => s + h.pnl, 0);

  const pieData = [
    { name: 'USDT', value: balance },
    ...holdings.map(h => ({ name: h.coinData.symbol.toUpperCase(), value: h.value }))
  ].filter(d => d.value > 0);

  const closedOrders = orders.filter(o => o.status === 'filled' && o.side === 'sell');
  const equityCurve = useMemo(() => {
    const points = [{ date: 'شروع', value: initialBalance }];
    let running = initialBalance;
    closedOrders.slice().reverse().forEach(o => {
      running += (o.pnl || 0);
      const d = new Date(o.filledAt || Date.now());
      points.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, value: running });
    });
    points.push({ date: 'اکنون', value: totalAssets });
    return points;
  }, [closedOrders, totalAssets, initialBalance]);

  const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ارزش کل', value: `$${totalAssets.toLocaleString('en-US', { maximumFractionDigits: 2 })}`, icon: <DollarSign size={18} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'موجودی نقد', value: `$${balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}`, icon: <Briefcase size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'سود/زیان کل', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, icon: totalPnL >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />, color: totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400', bg: totalPnL >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
          { label: 'بازده کل', value: `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`, icon: <TrendingUp size={18} />, color: totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400', bg: 'bg-purple-500/10' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}>{s.icon}</div>
            <div className={`text-xl font-bold font-mono mb-1 ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${textMuted}`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <div className={`lg:col-span-2 rounded-2xl border p-5 ${cardBg}`}>
          <h2 className={`font-semibold mb-4 ${textPrimary}`}>منحنی سرمایه</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '12px' }} formatter={(v: any) => [`$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 })}`, 'ارزش']} />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#pGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Pie */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <h2 className={`font-semibold mb-4 ${textPrimary}`}>تخصیص سرمایه</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '12px' }} formatter={(v: any) => [`$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 })}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex items-center justify-center h-44 ${textMuted} text-sm`}>سبد خالی است</div>
          )}
          <div className="space-y-2 mt-2">
            {pieData.slice(0, 5).map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className={textPrimary}>{d.name}</span>
                <span className={`ml-auto font-mono ${textMuted}`}>{((d.value / totalAssets) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className={`px-5 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <h2 className={`font-semibold ${textPrimary}`}>دارایی‌ها</h2>
        </div>
        {holdings.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 ${textMuted}`}>
            <Briefcase size={40} className="mb-3 opacity-30" />
            <p>هیچ دارایی‌ای در پرتفوی شما وجود ندارد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`border-b text-xs ${textMuted} ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                <tr>
                  <th className="text-left px-5 py-3">ارز</th>
                  <th className="text-right py-3">مقدار</th>
                  <th className="text-right py-3">قیمت خرید میانگین</th>
                  <th className="text-right py-3">قیمت فعلی</th>
                  <th className="text-right py-3">ارزش</th>
                  <th className="text-right py-3">سود/زیان</th>
                  <th className="text-right py-3 pr-5">درصد سود</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, idx) => (
                  <tr key={h.coinId} className={`border-b ${isDark ? 'border-gray-800/50' : 'border-gray-50'} ${isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                        <img src={h.coinData.image} alt={h.coinData.name} className="w-8 h-8 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/32/6366f1/white?text=${h.coinData.symbol[0].toUpperCase()}`; }} />
                        <div>
                          <div className={`font-semibold ${textPrimary}`}>{h.coinData.symbol.toUpperCase()}</div>
                          <div className={`text-xs ${textMuted}`}>{h.coinData.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 text-right font-mono ${textPrimary}`}>{h.amount.toFixed(6)}</td>
                    <td className={`py-3 text-right font-mono ${textMuted}`}>${h.avgBuyPrice.toFixed(4)}</td>
                    <td className={`py-3 text-right font-mono ${textPrimary}`}>${h.currentPrice.toFixed(4)}</td>
                    <td className={`py-3 text-right font-mono font-semibold ${textPrimary}`}>${h.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                    <td className={`py-3 text-right font-mono font-semibold ${h.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(2)}
                    </td>
                    <td className="py-3 text-right pr-5">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${h.pnlPct >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade History */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <h2 className={`font-semibold ${textPrimary}`}>تاریخچه معاملات</h2>
          <span className={`text-xs ${textMuted}`}>{orders.length} معامله</span>
        </div>
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          {orders.length === 0 ? (
            <div className={`text-center py-10 ${textMuted} text-sm`}>هیچ معامله‌ای ثبت نشده</div>
          ) : (
            <table className="w-full text-xs">
              <thead className={`border-b ${textMuted} sticky top-0 ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                <tr>
                  <th className="text-left px-5 py-2">ارز</th>
                  <th className="text-center py-2">نوع</th>
                  <th className="text-right py-2">قیمت</th>
                  <th className="text-right py-2">مقدار</th>
                  <th className="text-right py-2">مجموع</th>
                  <th className="text-right py-2">سود/زیان</th>
                  <th className="text-right py-2 pr-5">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 50).map(o => (
                  <tr key={o.id} className={`border-b ${isDark ? 'border-gray-800/50' : 'border-gray-50'}`}>
                    <td className="px-5 py-2">
                      <span className={`font-semibold ${textPrimary}`}>{o.coinSymbol.toUpperCase()}</span>
                    </td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.side === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {o.side === 'buy' ? 'خرید' : 'فروش'}
                      </span>
                    </td>
                    <td className={`py-2 text-right font-mono ${textMuted}`}>${o.price.toFixed(4)}</td>
                    <td className={`py-2 text-right font-mono ${textPrimary}`}>{o.amount.toFixed(6)}</td>
                    <td className={`py-2 text-right font-mono ${textPrimary}`}>${o.total.toFixed(2)}</td>
                    <td className={`py-2 text-right font-mono font-bold ${!o.pnl ? textMuted : o.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {o.pnl !== undefined ? `${o.pnl >= 0 ? '+' : ''}$${o.pnl.toFixed(2)}` : '—'}
                    </td>
                    <td className={`py-2 text-right pr-5 font-mono ${textMuted}`}>
                      {o.timestamp ? new Date(o.timestamp).toLocaleDateString('fa-IR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
