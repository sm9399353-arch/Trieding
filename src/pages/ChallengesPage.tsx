import { useStore } from '../store/useStore';
import { Target, Award, Star, CheckCircle, Lock, Gift, Trophy } from 'lucide-react';

export default function ChallengesPage() {
  const { challenges, achievements, userXP, userLevel, totalTrades, winningTrades, balance, theme } = useStore();
  const isDark = theme === 'dark';

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';

  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;

  // Update challenge progress dynamically
  const updatedChallenges = challenges.map(ch => {
    if (ch.id === 'c1') return { ...ch, current: balance };
    if (ch.id === 'c2') return { ...ch, current: winningTrades };
    if (ch.id === 'c3') return { ...ch, current: winRate };
    if (ch.id === 'c4') return { ...ch, current: Math.min(totalTrades, 3) };
    return ch;
  });

  const levels = [
    { name: 'مبتدی', xp: 0, icon: '🌱', color: 'text-green-400' },
    { name: 'متوسط', xp: 500, icon: '📈', color: 'text-blue-400' },
    { name: 'پیشرفته', xp: 1500, icon: '⚡', color: 'text-yellow-400' },
    { name: 'حرفه‌ای', xp: 5000, icon: '🏆', color: 'text-purple-400' },
    { name: 'استاد معامله‌گری', xp: 15000, icon: '💎', color: 'text-cyan-400' },
  ];

  const currentLevelIndex = levels.findIndex(l => l.name === userLevel);
  const nextLevel = levels[currentLevelIndex + 1];
  const currentLevelXP = levels[currentLevelIndex]?.xp || 0;
  const nextLevelXP = nextLevel?.xp || currentLevelXP + 1000;
  const progress = ((userXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          <Trophy size={24} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${textPrimary}`}>چالش‌ها و دستاوردها</h1>
          <p className={`text-sm ${textMuted}`}>پیشرفت خود را دنبال کنید</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className={`rounded-2xl border p-6 ${cardBg}`}
        style={{ background: isDark ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' : 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{levels[currentLevelIndex]?.icon}</div>
            <div>
              <div className={`text-xs ${textMuted} mb-0.5`}>سطح فعلی</div>
              <div className={`text-xl font-black gradient-text`}>{userLevel}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xs ${textMuted} mb-0.5`}>امتیاز کل</div>
            <div className={`text-2xl font-black text-yellow-400`}>{userXP.toLocaleString()} XP</div>
          </div>
        </div>

        {nextLevel && (
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className={textPrimary}>{userLevel}</span>
              <span className={textMuted}>{nextLevel.name}</span>
            </div>
            <div className={`h-3 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className={textMuted}>{userXP - currentLevelXP} / {nextLevelXP - currentLevelXP} XP</span>
              <span className="text-indigo-400">{nextLevelXP - userXP} XP تا {nextLevel.name}</span>
            </div>
          </div>
        )}

        {/* Level Path */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {levels.map((level, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center ${i <= currentLevelIndex ? '' : 'opacity-40'}`}>
                <div className={`text-xl mb-1`}>{level.icon}</div>
                <div className={`text-[10px] font-medium ${i <= currentLevelIndex ? level.color : textMuted}`}>{level.name.split(' ')[0]}</div>
              </div>
              {i < levels.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 rounded-full ${i < currentLevelIndex ? 'bg-indigo-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Challenges */}
        <div>
          <h2 className={`font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <Target size={18} className="text-indigo-400" /> چالش‌های فعال
          </h2>
          <div className="space-y-3">
            {updatedChallenges.map(ch => {
              const progressPct = Math.min((ch.current / ch.target) * 100, 100);
              const completed = progressPct >= 100;
              return (
                <div key={ch.id} className={`rounded-2xl border p-4 ${cardBg} ${completed ? isDark ? 'border-emerald-500/30' : 'border-emerald-300' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {completed ? <CheckCircle size={20} className="text-emerald-400" /> : <Target size={20} className="text-indigo-400" />}
                      <div>
                        <div className={`font-semibold text-sm ${textPrimary}`}>{ch.title}</div>
                        <div className={`text-xs ${textMuted}`}>{ch.description}</div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'} text-xs font-bold`}>
                      <Gift size={12} />
                      {ch.reward.toLocaleString()} XP
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={textMuted}>
                        {ch.type === 'balance' && `$${ch.current.toLocaleString('en-US', { maximumFractionDigits: 0 })} / $${ch.target.toLocaleString()}`}
                        {ch.type === 'trades' && `${ch.current} / ${ch.target} معامله`}
                        {ch.type === 'winrate' && `${ch.current}% / ${ch.target}%`}
                        {ch.type === 'daily' && `${ch.current} / ${ch.target} امروز`}
                      </span>
                      <span className={completed ? 'text-emerald-400 font-bold' : 'text-indigo-400'}>{progressPct.toFixed(0)}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progressPct}%`,
                          background: completed ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className={`font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <Award size={18} className="text-yellow-400" /> دستاوردها
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`rounded-2xl border p-4 text-center transition-all ${
                  ach.unlocked
                    ? isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'
                    : isDark ? 'bg-gray-900 border-gray-800 opacity-50' : 'bg-white border-gray-200 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{ach.icon}</div>
                <div className={`text-xs font-bold mb-1 ${ach.unlocked ? 'text-yellow-400' : textMuted}`}>{ach.title}</div>
                <div className={`text-[10px] ${textMuted} mb-2 leading-relaxed`}>{ach.description}</div>
                <div className={`text-[10px] font-bold ${ach.unlocked ? 'text-yellow-400' : textMuted}`}>
                  {ach.unlocked ? (
                    <span className="flex items-center justify-center gap-1">
                      <CheckCircle size={10} /> +{ach.xp} XP
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <Lock size={10} /> {ach.xp} XP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <h2 className={`font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
          <Star size={18} className="text-indigo-400" /> آمار جامع
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'کل معاملات', value: totalTrades, icon: '📊', color: 'text-indigo-400' },
            { label: 'معاملات موفق', value: winningTrades, icon: '✅', color: 'text-emerald-400' },
            { label: 'نرخ موفقیت', value: `${winRate}%`, icon: '🎯', color: winRate >= 50 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'امتیاز کسب شده', value: `${userXP} XP`, icon: '⭐', color: 'text-yellow-400' },
            { label: 'دستاوردها', value: `${achievements.filter(a => a.unlocked).length}/${achievements.length}`, icon: '🏆', color: 'text-yellow-400' },
            { label: 'چالش‌های انجام شده', value: `${updatedChallenges.filter(c => (c.current / c.target) >= 1).length}`, icon: '🎪', color: 'text-purple-400' },
            { label: 'موجودی فعلی', value: `$${(balance / 1000000).toFixed(2)}M`, icon: '💰', color: 'text-emerald-400' },
            { label: 'سطح فعلی', value: userLevel, icon: levels[currentLevelIndex]?.icon || '🌱', color: 'text-indigo-400' },
          ].map((s, i) => (
            <div key={i} className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className={`text-xs ${textMuted}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
