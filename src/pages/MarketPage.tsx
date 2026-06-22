import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Search, Star, TrendingUp, TrendingDown, Filter, ArrowUpDown, Eye } from 'lucide-react';

type SortField = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'total_volume' | 'market_cap';
type SortDir = 'asc' | 'desc';
type Tab = 'all' | 'watchlist' | 'gainers' | 'losers' | 'trending';

export default function MarketPage() {
  const { marketData, watchlist, toggleWatchlist, setSelectedCoin, setCurrentPage, theme } = useStore();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [sortField, setSortField] = useState<SortField>('market_cap_rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const isDark = theme === 'dark';

  const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const rowHover = isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50';

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let coins = [...marketData];
    
    // Tab filter
    if (tab === 'watchlist') coins = coins.filter(c => watchlist.includes(c.id));
    else if (tab === 'gainers') coins = coins.filter(c => c.price_change_percentage_24h > 0).sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    else if (tab === 'losers') coins = coins.filter(c => c.price_change_percentage_24h < 0).sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
    else if (tab === 'trending') coins = coins.slice(0, 20);
    
    // Search
    if (search) {
      const q = search.toLowerCase();
      coins = coins.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    
    // Sort (only for 'all' and 'watchlist')
    if (tab === 'all' || tab === 'watchlist') {
      coins.sort((a, b) => {
        const aVal = a[sortField] ?? 0;
        const bVal = b[sortField] ?? 0;
        return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }
    
    return coins;
  }, [marketData, tab, search, sortField, sortDir, watchlist]);

  const fmtPrice = (p: number) => {
    if (p < 0.000001) return `$${p.toFixed(10)}`;
    if (p < 0.01) return `$${p.toFixed(6)}`;
    if (p < 1) return `$${p.toFixed(4)}`;
    if (p < 1000) return `$${p.toFixed(2)}`;
    return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const fmtLarge = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toFixed(0)}`;
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: 'همه ارزها' },
    { id: 'watchlist', label: 'واچ‌لیست' },
    { id: 'gainers', label: '🚀 پررشد' },
    { id: 'losers', label: '📉 پرریزش' },
    { id: 'trending', label: '🔥 ترند' },
  ];

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 hover:text-indigo-400 transition-colors ${sortField === field ? 'text-indigo-400' : textMuted}`}
    >
      {label}
      <ArrowUpDown size={12} />
    </button>
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${textPrimary}`}>بازار ارزهای دیجیتال</h1>
          <p className={`text-sm ${textMuted}`}>{marketData.length} ارز دیجیتال</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Search size={16} className={textMuted} />
            <input
              type="text"
              placeholder="جستجوی ارز..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`bg-transparent outline-none text-sm w-40 ${textPrimary} placeholder:${textMuted}`}
            />
          </div>
        </div>
      </div>

      {/* Market Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'کل مارکت کپ', value: fmtLarge(marketData.reduce((s, c) => s + c.market_cap, 0)), color: 'text-indigo-400' },
          { label: 'حجم ۲۴ ساعته', value: fmtLarge(marketData.reduce((s, c) => s + c.total_volume, 0)), color: 'text-blue-400' },
          { label: 'پررشد امروز', value: `${marketData.filter(c => c.price_change_percentage_24h > 0).length} ارز`, color: 'text-emerald-400' },
          { label: 'پرریزش امروز', value: `${marketData.filter(c => c.price_change_percentage_24h < 0).length} ارز`, color: 'text-red-400' },
        ].map((item, i) => (
          <div key={i} className={`rounded-xl border p-4 ${cardBg}`}>
            <div className={`text-xs ${textMuted} mb-1`}>{item.label}</div>
            <div className={`text-lg font-bold font-mono ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-100'} w-fit`}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : `${textMuted} hover:text-indigo-400`
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        {/* Table Header */}
        <div className={`grid grid-cols-12 px-4 py-3 text-xs border-b ${isDark ? 'border-gray-800 bg-gray-900/80' : 'border-gray-100 bg-gray-50'}`}>
          <div className="col-span-1 text-center">
            <span className={textMuted}>#</span>
          </div>
          <div className="col-span-3 md:col-span-3">
            <span className={textMuted}>ارز</span>
          </div>
          <div className="col-span-2 text-right hidden md:block">
            <SortButton field="current_price" label="قیمت" />
          </div>
          <div className="col-span-2 text-right">
            <SortButton field="price_change_percentage_24h" label="۲۴ ساعته" />
          </div>
          <div className="col-span-2 text-right hidden lg:block">
            <SortButton field="market_cap" label="مارکت کپ" />
          </div>
          <div className="col-span-2 text-right hidden lg:block">
            <SortButton field="total_volume" label="حجم" />
          </div>
          <div className="col-span-2 md:col-span-2 text-right">
            <span className={textMuted}>عملیات</span>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {filtered.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 ${textMuted}`}>
              <Filter size={32} className="mb-3 opacity-50" />
              <p>ارزی یافت نشد</p>
            </div>
          ) : filtered.map((coin, idx) => {
            const isUp = coin.price_change_percentage_24h >= 0;
            const inWatchlist = watchlist.includes(coin.id);
            return (
              <div
                key={coin.id}
                className={`grid grid-cols-12 px-4 py-3 border-b ${isDark ? 'border-gray-800/50' : 'border-gray-50'} ${rowHover} transition-colors cursor-pointer`}
                onClick={() => { setSelectedCoin(coin); setCurrentPage('trade'); }}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    onClick={e => { e.stopPropagation(); toggleWatchlist(coin.id); }}
                    className={`text-xs font-mono transition-colors ${inWatchlist ? 'text-yellow-400' : textMuted}`}
                    title={inWatchlist ? 'حذف از واچ‌لیست' : 'افزودن به واچ‌لیست'}
                  >
                    {inWatchlist ? <Star size={14} fill="currentColor" /> : coin.market_cap_rank || idx + 1}
                  </button>
                </div>

                {/* Coin Info */}
                <div className="col-span-3 flex items-center gap-3">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-8 h-8 rounded-full"
                    onError={e => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/32/6366f1/white?text=${coin.symbol[0].toUpperCase()}`; }}
                  />
                  <div>
                    <div className={`text-sm font-semibold ${textPrimary}`}>{coin.symbol.toUpperCase()}</div>
                    <div className={`text-xs ${textMuted} hidden sm:block truncate max-w-[80px]`}>{coin.name}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2 text-right hidden md:flex items-center justify-end">
                  <span className={`text-sm font-mono font-medium ${textPrimary}`}>{fmtPrice(coin.current_price)}</span>
                </div>

                {/* 24h Change */}
                <div className="col-span-2 flex items-center justify-end">
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {isUp ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                  </div>
                </div>

                {/* Market Cap */}
                <div className="col-span-2 text-right items-center hidden lg:flex justify-end">
                  <span className={`text-xs font-mono ${textMuted}`}>{fmtLarge(coin.market_cap)}</span>
                </div>

                {/* Volume */}
                <div className="col-span-2 text-right items-center hidden lg:flex justify-end">
                  <span className={`text-xs font-mono ${textMuted}`}>{fmtLarge(coin.total_volume)}</span>
                </div>

                {/* Actions */}
                <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedCoin(coin); setCurrentPage('trade'); }}
                    className="px-2 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all font-medium"
                  >
                    خرید
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedCoin(coin); setCurrentPage('trade'); }}
                    className="p-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
