import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PriceTicker() {
  const { marketData, theme } = useStore();
  const isDark = theme === 'dark';
  const tickerRef = useRef<HTMLDivElement>(null);

  const topCoins = marketData.slice(0, 15);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;
    
    let animFrame: number;
    let position = 0;
    const speed = 0.5;
    
    const animate = () => {
      position -= speed;
      if (position <= -ticker.scrollWidth / 2) {
        position = 0;
      }
      ticker.style.transform = `translateX(${position}px)`;
      animFrame = requestAnimationFrame(animate);
    };
    
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [marketData]);

  if (topCoins.length === 0) return null;

  const fmtPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    if (p >= 0.01) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(6)}`;
  };

  return (
    <div className={`overflow-hidden border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`} style={{ height: '36px' }}>
      <div ref={tickerRef} className="flex items-center h-full" style={{ width: 'max-content' }}>
        {[...topCoins, ...topCoins].map((coin, i) => {
          const isUp = coin.price_change_percentage_24h >= 0;
          return (
            <div key={`${coin.id}-${i}`} className="flex items-center gap-2 px-4 py-1.5 h-full border-r border-opacity-10 border-gray-700 whitespace-nowrap">
              <img src={coin.image} alt={coin.symbol} className="w-4 h-4 rounded-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{coin.symbol.toUpperCase()}</span>
              <span className={`text-xs font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{fmtPrice(coin.current_price)}</span>
              <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isUp ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
