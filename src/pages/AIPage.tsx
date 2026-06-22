import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Brain, Send, Bot, User, Lightbulb, TrendingUp, AlertTriangle, Target, RefreshCw, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
}

const AI_RESPONSES: Record<string, string[]> = {
  'تحلیل': [
    `📊 **تحلیل کلی عملکرد شما:**\n\nبر اساس داده‌های معاملاتی شما، به چند نکته مهم اشاره می‌کنم:\n\n✅ **نقاط قوت:**\n• انجام معاملات منظم\n• توجه به مدیریت سرمایه\n\n⚠️ **نقاط ضعف:**\n• ریسک در برخی پوزیشن‌ها بالاست\n• نیاز به استفاده بیشتر از Stop Loss\n\n💡 **پیشنهاد:** سعی کنید ریسک هر معامله را به ۱-۲٪ سرمایه محدود کنید.`,
    `🎯 **تحلیل استراتژی معاملاتی:**\n\nبررسی الگوی معاملات شما نشان می‌دهد:\n\n📈 نرخ برد قابل قبول است اما قابل بهبود می‌باشد\n📉 متوسط ضرر بیشتر از متوسط سود است\n\n**اقدام پیشنهادی:**\n1. نسبت Risk/Reward را حداقل به 1:2 برسانید\n2. قبل از ورود، حد ضرر را مشخص کنید\n3. هرگز بیش از ۵٪ سرمایه را در یک معامله ریسک نکنید`
  ],
  'آموزش': [
    `📚 **آموزش: مدیریت ریسک**\n\n**قانون ۱٪ - ۲٪:**\nهر معامله‌گر حرفه‌ای باید حداکثر ۱ تا ۲٪ سرمایه خود را در هر معامله ریسک کند.\n\n**مثال:**\n• سرمایه: $10,000\n• حداکثر ریسک: $100 - $200\n\n**Stop Loss:**\nهمیشه قبل از ورود به معامله، حد ضرر خود را تعیین کنید.\n\n**Take Profit:**\nهدف سود را با نسبت حداقل 1:2 به Stop Loss تنظیم کنید.`,
    `📊 **آموزش: RSI (شاخص قدرت نسبی)**\n\nRSI یک اندیکاتور momentum است که بین 0 تا 100 نوسان می‌کند.\n\n**تفسیر:**\n• RSI > 70 → اشباع خرید (Overbought) - احتمال ریزش\n• RSI < 30 → اشباع فروش (Oversold) - احتمال رشد\n• RSI = 50 → خنثی\n\n**کاربرد:**\n✅ سیگنال‌های بهتر در تایم‌فریم‌های بالاتر هستند\n✅ بهترین استفاده در کنار سایر اندیکاتورها\n⚠️ در بازارهای trending دقیق نیست`
  ],
  'فیوچرز': [
    `⚡ **توضیح معاملات فیوچرز:**\n\n**لانگ (Long):**\nاگر فکر می‌کنید قیمت افزایش می‌یابد، Long بگیرید.\n\n**شورت (Short):**\nاگر فکر می‌کنید قیمت کاهش می‌یابد، Short بگیرید.\n\n**اهرم (Leverage):**\n• اهرم 10x → 10 برابر قدرت خرید\n• اهرم 10x → 10 برابر ریسک بیشتر!\n\n⚠️ **هشدار مهم:**\nاهرم بالا می‌تواند کل سرمایه شما را نابود کند. همیشه از اهرم پایین شروع کنید.`,
  ],
  'استراتژی': [
    `🎯 **استراتژی Moving Average Crossover:**\n\nیکی از ساده‌ترین و محبوب‌ترین استراتژی‌های معاملاتی:\n\n**قوانین:**\n• MA(20) از بالا MA(50) را قطع کند → سیگنال خرید\n• MA(20) از پایین MA(50) را قطع کند → سیگنال فروش\n\n**فیلترها:**\n✅ فقط در جهت روند کلی معامله کنید\n✅ حجم معاملات را بررسی کنید\n✅ از تایم‌فریم بالاتر تأیید بگیرید`,
    `📈 **استراتژی Breakout Trading:**\n\n**چیست؟**\nمعامله در زمان شکست مقاومت یا حمایت مهم\n\n**مراحل:**\n1. شناسایی سطوح کلیدی\n2. انتظار برای شکست با حجم بالا\n3. ورود پس از تأیید شکست\n4. Stop Loss پشت سطح شکسته شده\n\n**نسبت R/R پیشنهادی:** 1:3`
  ],
  'پیشنهاد': [
    `💡 **پیشنهادات بهبود عملکرد:**\n\n1. **ژورنال معاملاتی:**\n   هر معامله را ثبت کنید. این عادت بهترین معامله‌گران دنیاست.\n\n2. **مدیریت احساسات:**\n   اگر در روز ۲٪ ضرر کردید، معامله را متوقف کنید.\n\n3. **بک‌تست:**\n   قبل از اجرای هر استراتژی، آن را روی داده‌های گذشته تست کنید.\n\n4. **صبر:**\n   بهترین معامله‌گران روزانه ۱-۳ معامله انجام می‌دهند نه ۳۰ معامله.`
  ],
};

const QUICK_QUESTIONS = [
  { icon: '📊', text: 'تحلیل عملکرد من' },
  { icon: '📚', text: 'آموزش مدیریت ریسک' },
  { icon: '⚡', text: 'توضیح فیوچرز' },
  { icon: '🎯', text: 'پیشنهاد استراتژی' },
  { icon: '💡', text: 'پیشنهاد بهبود عملکرد' },
  { icon: '📈', text: 'آموزش تحلیل تکنیکال' },
];

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, responses] of Object.entries(AI_RESPONSES)) {
    if (lower.includes(key)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  // Default response
  const defaults = [
    `سلام! من دستیار هوش مصنوعی شما هستم. می‌توانم در موارد زیر کمک کنم:\n\n• **تحلیل عملکرد:** بررسی معاملات و نقاط ضعف/قوت شما\n• **آموزش:** مفاهیم پایه تا پیشرفته معامله‌گری\n• **استراتژی:** معرفی و توضیح استراتژی‌های معاملاتی\n• **مدیریت ریسک:** نحوه محافظت از سرمایه\n\nهر سوالی دارید بپرسید! 🚀`,
    `سوال جالبی پرسیدید! در دنیای ارزهای دیجیتال، موفق‌ترین معامله‌گران کسانی هستند که:\n\n1. **انضباط** دارند و از استراتژی خود پیروی می‌کنند\n2. **مدیریت ریسک** را جدی می‌گیرند\n3. **احساسات** خود را کنترل می‌کنند\n4. **یادگیری** مستمر دارند\n\nمی‌خواهید در کدام موضوع بیشتر توضیح بدهم؟`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export default function AIPage() {
  const { totalTrades, winningTrades, totalPnL, balance, theme } = useStore();
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `سلام! 👋 من **AI Coach** شما هستم.\n\nبا **${totalTrades}** معامله ثبت شده، آماده‌ام تا عملکرد شما را تحلیل کنم و پیشنهادات شخصی‌سازی شده ارائه دهم.\n\nچه کمکی می‌توانم بکنم؟`,
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    const response = getAIResponse(msg);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} dangerouslySetInnerHTML={{ __html: boldLine }} className={line === '' ? 'mb-1' : 'mb-0.5'} />;
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-glow" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Brain size={24} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${textPrimary}`}>AI Coach - دستیار هوشمند</h1>
          <p className={`text-sm ${textMuted}`}>تحلیل شخصی‌سازی شده معاملات شما</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">آنلاین</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className={`lg:col-span-2 rounded-2xl border flex flex-col ${cardBg}`} style={{ height: '600px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-indigo-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  {msg.role === 'assistant' ? <Bot size={16} className="text-white" /> : <User size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'
                    : 'bg-indigo-500 text-white'
                } ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                  {formatContent(msg.content)}
                  <div className={`text-[10px] mt-2 ${msg.role === 'assistant' ? textMuted : 'text-indigo-200'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className={`rounded-2xl rounded-tl-sm px-4 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className={`px-4 py-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex gap-2 flex-wrap mb-3">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                  {q.icon} {q.text}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className={`flex gap-2 p-2 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="سوال خود را بپرسید..."
                className={`flex-1 bg-transparent outline-none text-sm ${textPrimary} placeholder:${textMuted}`}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 transition-all text-white"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Performance Summary */}
          <div className={`rounded-2xl border p-4 ${cardBg}`}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-yellow-400" />
              <h3 className={`font-semibold text-sm ${textPrimary}`}>خلاصه عملکرد</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'نرخ موفقیت', value: `${winRate}%`, color: winRate >= 50 ? 'text-emerald-400' : 'text-red-400', icon: <Target size={14} /> },
                { label: 'کل معاملات', value: totalTrades, color: 'text-indigo-400', icon: <TrendingUp size={14} /> },
                { label: 'سود/زیان کل', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(0)}`, color: totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400', icon: totalPnL >= 0 ? <TrendingUp size={14} /> : <AlertTriangle size={14} /> },
                { label: 'موجودی', value: `$${(balance / 1000000).toFixed(2)}M`, color: 'text-blue-400', icon: <Target size={14} /> },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={textMuted}>{s.icon}</span>
                    <span className={`text-xs ${textMuted}`}>{s.label}</span>
                  </div>
                  <span className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className={`rounded-2xl border p-4 ${cardBg}`}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} className="text-yellow-400" />
              <h3 className={`font-semibold text-sm ${textPrimary}`}>توصیه‌های هوش مصنوعی</h3>
            </div>
            <div className="space-y-3">
              {[
                { text: 'در هر معامله حداکثر ۲٪ سرمایه را ریسک کنید', icon: '🛡️', type: 'success' },
                { text: totalTrades < 10 ? 'برای آنالیز دقیق‌تر، معاملات بیشتری انجام دهید' : winRate < 50 ? 'نرخ موفقیت نیاز به بهبود دارد. استراتژی را مرور کنید' : 'عملکرد خوب! به همین روند ادامه دهید', icon: winRate < 50 ? '⚠️' : '✅', type: winRate < 50 ? 'warning' : 'success' },
                { text: 'قبل از هر معامله، ریسک/بازده را محاسبه کنید', icon: '📊', type: 'info' },
                { text: 'از ژورنال معاملاتی استفاده کنید', icon: '📔', type: 'info' },
              ].map((ins, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-xl ${
                  ins.type === 'success' ? 'bg-emerald-500/10' : ins.type === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                }`}>
                  <span className="text-sm">{ins.icon}</span>
                  <p className={`text-xs leading-relaxed ${textPrimary}`}>{ins.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Analysis */}
          <div className={`rounded-2xl border p-4 ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-indigo-400" />
                <h3 className={`font-semibold text-sm ${textPrimary}`}>تحلیل سریع</h3>
              </div>
              <button onClick={() => handleSend('تحلیل')} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <RefreshCw size={12} />
                بروزرسانی
              </button>
            </div>
            <div className="space-y-2">
              {[
                { label: 'ریسک معاملاتی', value: winRate > 60 ? 'پایین' : winRate > 40 ? 'متوسط' : 'بالا', color: winRate > 60 ? 'text-emerald-400' : winRate > 40 ? 'text-yellow-400' : 'text-red-400' },
                { label: 'سطح مهارت', value: totalTrades < 5 ? 'مبتدی' : totalTrades < 20 ? 'متوسط' : 'پیشرفته', color: 'text-indigo-400' },
                { label: 'وضعیت پرتفوی', value: totalPnL >= 0 ? 'مثبت' : 'منفی', color: totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className={textMuted}>{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
