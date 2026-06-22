import { useMemo } from 'react';
import { useStore } from '../store/useStore';

export default function FearGreedGauge() {
  const { marketData, theme } = useStore();
  const isDark = theme === 'dark';

  const index = useMemo(() => {
    if (marketData.length === 0) return 50;
    const avgChange = marketData.slice(0, 20).reduce((s, c) => s + (c.price_change_percentage_24h || 0), 0) / 20;
    // Map -5% to +5% → 10 to 90
    const raw = 50 + avgChange * 8;
    return Math.min(90, Math.max(10, Math.round(raw)));
  }, [marketData]);

  const label = index <= 20 ? 'ترس شدید' : index <= 40 ? 'ترس' : index <= 60 ? 'خنثی' : index <= 80 ? 'طمع' : 'طمع شدید';
  const color = index <= 20 ? '#ef4444' : index <= 40 ? '#f97316' : index <= 60 ? '#eab308' : index <= 80 ? '#84cc16' : '#10b981';

  const angle = (index / 100) * 180 - 90;

  return (
    <div className={`rounded-2xl border p-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>شاخص ترس و طمع</div>
      
      <div className="flex flex-col items-center">
        {/* Gauge SVG */}
        <svg viewBox="0 0 120 70" className="w-32">
          {/* Background arc */}
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={isDark ? '#1f2937' : '#e5e7eb'} strokeWidth="10" strokeLinecap="round" />
          
          {/* Color segments */}
          {[
            { from: 0, to: 0.2, color: '#ef4444' },
            { from: 0.2, to: 0.4, color: '#f97316' },
            { from: 0.4, to: 0.6, color: '#eab308' },
            { from: 0.6, to: 0.8, color: '#84cc16' },
            { from: 0.8, to: 1, color: '#10b981' },
          ].map((seg, i) => {
            const r = 50;
            const cx = 60, cy = 60;
            const startAngle = (seg.from * Math.PI) - Math.PI;
            const endAngle = (seg.to * Math.PI) - Math.PI;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={seg.color}
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.8"
              />
            );
          })}

          {/* Needle */}
          <g transform={`translate(60, 60) rotate(${angle})`}>
            <line x1="0" y1="0" x2="0" y2="-40" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="4" fill={color} />
          </g>
        </svg>

        <div className="text-center -mt-2">
          <div className="text-2xl font-black" style={{ color }}>{index}</div>
          <div className="text-xs font-bold" style={{ color }}>{label}</div>
        </div>
      </div>
    </div>
  );
}
