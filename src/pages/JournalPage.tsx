import { useState } from 'react';
import { useStore } from '../store/useStore';
import { BookOpen, Plus, X, Star, Edit3, Tag, Calendar } from 'lucide-react';

const EMOTIONS = ['😊 خوشحال', '😰 مضطرب', '😤 عصبانی', '😴 خسته', '🧘 آرام', '😱 ترسیده', '🤩 هیجان‌زده', '🤔 متفکر'];
const TAGS = ['ترند', 'بریک‌اوت', 'ریورسال', 'اشتباه', 'موفق', 'فیوچرز', 'اسپات', 'اسکالپ'];

export default function JournalPage() {
  const { journalEntries, addJournalEntry, orders, theme } = useStore();
  const isDark = theme === 'dark';

  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [entryReason, setEntryReason] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [lessons, setLessons] = useState('');
  const [entryEmotion, setEntryEmotion] = useState('');
  const [exitEmotion, setExitEmotion] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rating, setRating] = useState(3);
  const [filterTag, setFilterTag] = useState('');

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const inputBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';

  const filledOrders = orders.filter(o => o.status === 'filled');
  const filteredEntries = journalEntries.filter(e =>
    !filterTag || e.tags?.includes(filterTag)
  );

  const handleSave = () => {
    const order = orders.find(o => o.id === selectedOrder);
    addJournalEntry({
      orderId: selectedOrder,
      coinSymbol: order?.coinSymbol || 'USDT',
      side: order?.side || 'buy',
      entryPrice: order?.price || 0,
      exitPrice: order?.side === 'sell' ? order?.price : undefined,
      amount: order?.amount || 0,
      pnl: order?.pnl,
      pnlPercent: order?.pnlPercent,
      entryReason,
      exitReason,
      mistakes,
      lessons,
      entryEmotion,
      exitEmotion,
      tags: selectedTags,
      timestamp: Date.now(),
      rating,
    });
    setShowForm(false);
    setEntryReason('');
    setExitReason('');
    setMistakes('');
    setLessons('');
    setSelectedTags([]);
    setSelectedOrder('');
    setEntryEmotion('');
    setExitEmotion('');
    setRating(3);
  };

  const totalWins = journalEntries.filter(e => (e.pnl || 0) > 0).length;
  const totalLosses = journalEntries.filter(e => (e.pnl || 0) <= 0 && e.pnl !== undefined).length;
  const avgRating = journalEntries.length > 0 ? journalEntries.reduce((s, e) => s + (e.rating || 3), 0) / journalEntries.length : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-bold ${textPrimary}`}>ژورنال معاملاتی</h1>
          <p className={`text-sm ${textMuted}`}>{journalEntries.length} ورودی ثبت شده</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Plus size={16} /> ثبت معامله
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'کل ورودی‌ها', value: journalEntries.length, color: 'text-indigo-400' },
          { label: 'معاملات سودآور', value: totalWins, color: 'text-emerald-400' },
          { label: 'معاملات زیانده', value: totalLosses, color: 'text-red-400' },
          { label: 'میانگین امتیاز', value: avgRating.toFixed(1) + '⭐', color: 'text-yellow-400' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${cardBg}`}>
            <div className={`text-2xl font-bold font-mono mb-1 ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${textMuted}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tags Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterTag('')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${!filterTag ? 'bg-indigo-500 text-white' : `${textMuted} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}`}
        >
          همه
        </button>
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${filterTag === tag ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : `${textMuted} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}`}
          >
            <Tag size={10} /> {tag}
          </button>
        ))}
      </div>

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <div className={`rounded-2xl border p-12 text-center ${cardBg}`}>
          <BookOpen size={40} className={`mx-auto mb-4 ${textMuted} opacity-30`} />
          <p className={textMuted}>هنوز ورودی ثبت نشده. اولین معامله خود را ثبت کنید.</p>
          <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 transition-all">
            + ثبت اولین معامله
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <div key={entry.id} className={`rounded-2xl border p-5 ${cardBg}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${entry.side === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {entry.side === 'buy' ? '↑' : '↓'}
                  </div>
                  <div>
                    <div className={`font-bold ${textPrimary}`}>{entry.coinSymbol.toUpperCase()}/USDT</div>
                    <div className={`text-xs ${textMuted} flex items-center gap-1`}>
                      <Calendar size={10} />
                      {new Date(entry.timestamp).toLocaleDateString('fa-IR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {entry.pnl !== undefined && (
                    <div className={`text-sm font-bold font-mono px-3 py-1 rounded-xl ${entry.pnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {entry.pnl >= 0 ? '+' : ''}${entry.pnl.toFixed(2)}
                      {entry.pnlPercent !== undefined && ` (${entry.pnlPercent.toFixed(2)}%)`}
                    </div>
                  )}
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={12} className={i < (entry.rating || 0) ? 'text-yellow-400' : textMuted} fill={i < (entry.rating || 0) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.entryReason && (
                  <div>
                    <div className={`text-xs font-semibold mb-1 text-emerald-400`}>✅ دلیل ورود</div>
                    <p className={`text-sm ${textPrimary} leading-relaxed`}>{entry.entryReason}</p>
                  </div>
                )}
                {entry.exitReason && (
                  <div>
                    <div className={`text-xs font-semibold mb-1 text-blue-400`}>🚪 دلیل خروج</div>
                    <p className={`text-sm ${textPrimary} leading-relaxed`}>{entry.exitReason}</p>
                  </div>
                )}
                {entry.mistakes && (
                  <div>
                    <div className="text-xs font-semibold mb-1 text-red-400">❌ اشتباهات</div>
                    <p className={`text-sm ${textPrimary} leading-relaxed`}>{entry.mistakes}</p>
                  </div>
                )}
                {entry.lessons && (
                  <div>
                    <div className="text-xs font-semibold mb-1 text-yellow-400">📚 درس‌ها</div>
                    <p className={`text-sm ${textPrimary} leading-relaxed`}>{entry.lessons}</p>
                  </div>
                )}
              </div>

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {entry.tags.map(tag => (
                    <span key={tag} className={`px-2 py-0.5 rounded-lg text-[11px] ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {(entry.entryEmotion || entry.exitEmotion) && (
                <div className={`mt-4 pt-4 border-t flex gap-4 text-xs ${textMuted} ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  {entry.entryEmotion && <span>قبل از معامله: {entry.entryEmotion}</span>}
                  {entry.exitEmotion && <span>بعد از معامله: {entry.exitEmotion}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-y-auto max-h-[90vh] ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-indigo-400" />
                <h2 className={`font-bold ${textPrimary}`}>ثبت معامله در ژورنال</h2>
              </div>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Select Order */}
              <div>
                <label className={`text-xs font-medium ${textMuted} block mb-1`}>معامله مرتبط (اختیاری)</label>
                <select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                  <option value="">انتخاب کنید...</option>
                  {filledOrders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.side === 'buy' ? 'خرید' : 'فروش'} {o.coinSymbol.toUpperCase()} - ${o.price.toFixed(2)} - {new Date(o.timestamp).toLocaleDateString('fa-IR')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entry Reason */}
              <div>
                <label className={`text-xs font-medium text-emerald-400 block mb-1`}>دلیل ورود به معامله *</label>
                <textarea
                  value={entryReason}
                  onChange={e => setEntryReason(e.target.value)}
                  rows={2}
                  placeholder="چرا وارد این معامله شدید؟ (تحلیل تکنیکال، فاندامنتال، ...)"
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none ${inputBg} ${textPrimary}`}
                />
              </div>

              {/* Exit Reason */}
              <div>
                <label className={`text-xs font-medium text-blue-400 block mb-1`}>دلیل خروج از معامله</label>
                <textarea
                  value={exitReason}
                  onChange={e => setExitReason(e.target.value)}
                  rows={2}
                  placeholder="چرا از این معامله خارج شدید؟"
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none ${inputBg} ${textPrimary}`}
                />
              </div>

              {/* Mistakes */}
              <div>
                <label className="text-xs font-medium text-red-400 block mb-1">اشتباهات</label>
                <textarea
                  value={mistakes}
                  onChange={e => setMistakes(e.target.value)}
                  rows={2}
                  placeholder="چه اشتباهاتی انجام دادید؟"
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none ${inputBg} ${textPrimary}`}
                />
              </div>

              {/* Lessons */}
              <div>
                <label className="text-xs font-medium text-yellow-400 block mb-1">درس‌های آموخته شده</label>
                <textarea
                  value={lessons}
                  onChange={e => setLessons(e.target.value)}
                  rows={2}
                  placeholder="از این معامله چه یاد گرفتید؟"
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none ${inputBg} ${textPrimary}`}
                />
              </div>

              {/* Emotions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-medium ${textMuted} block mb-2`}>احساس قبل از معامله</label>
                  <div className="flex flex-wrap gap-1">
                    {EMOTIONS.map(em => (
                      <button key={em} onClick={() => setEntryEmotion(em === entryEmotion ? '' : em)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${entryEmotion === em ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : `${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${textMuted}`}`}>
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-medium ${textMuted} block mb-2`}>احساس بعد از معامله</label>
                  <div className="flex flex-wrap gap-1">
                    {EMOTIONS.map(em => (
                      <button key={em} onClick={() => setExitEmotion(em === exitEmotion ? '' : em)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${exitEmotion === em ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : `${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${textMuted}`}`}>
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={`text-xs font-medium ${textMuted} block mb-2`}>برچسب‌ها</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button key={tag} onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      className={`px-3 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${selectedTags.includes(tag) ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : `${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${textMuted}`}`}>
                      <Tag size={10} /> {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className={`text-xs font-medium ${textMuted} block mb-2`}>امتیاز معامله</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => setRating(r)} className="transition-all">
                      <Star size={24} className={r <= rating ? 'text-yellow-400' : textMuted} fill={r <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                  انصراف
                </button>
                <button
                  onClick={handleSave}
                  disabled={!entryReason}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  ذخیره
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
