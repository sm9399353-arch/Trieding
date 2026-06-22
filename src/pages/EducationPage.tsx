import { useState } from 'react';
import { useStore } from '../store/useStore';
import { GraduationCap, BookOpen, ChevronRight, CheckCircle, Clock, Star, Play, BarChart2, Brain, TrendingUp, Shield, Target } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'مبتدی' | 'متوسط' | 'پیشرفته';
  category: string;
  content: string;
  locked?: boolean;
  completed?: boolean;
}

const LESSONS: Lesson[] = [
  {
    id: 'l1', title: 'مقدمه‌ای بر ارزهای دیجیتال', description: 'بلاکچین، بیتکوین و اتریوم چیستند؟',
    duration: '15 دقیقه', level: 'مبتدی', category: 'اصول',
    content: `# مقدمه‌ای بر ارزهای دیجیتال

## بلاکچین چیست؟
بلاکچین یک پایگاه داده توزیع‌شده است که اطلاعات را در "بلوک‌های" به هم زنجیر شده ذخیره می‌کند.

## بیتکوین
اولین ارز دیجیتال که در سال ۲۰۰۹ توسط ساتوشی ناکاموتو معرفی شد.

## اتریوم
پلتفرم قراردادهای هوشمند که امکان ایجاد دپ‌ها (DApps) را فراهم می‌کند.

## نکات کلیدی
- هیچ مرجع مرکزی وجود ندارد
- معاملات تغییرناپذیر هستند
- کیف پول دیجیتال نیاز است`
  },
  {
    id: 'l2', title: 'خواندن نمودار کندل استیک', description: 'نحوه تفسیر کندل‌های ژاپنی',
    duration: '20 دقیقه', level: 'مبتدی', category: 'تحلیل تکنیکال',
    content: `# کندل استیک

## اجزای یک کندل
- **بدنه (Body):** فاصله بین قیمت باز و بسته
- **سایه بالایی (Upper Wick):** بالاترین قیمت
- **سایه پایینی (Lower Wick):** پایین‌ترین قیمت

## کندل صعودی (سبز)
قیمت بسته > قیمت باز = کندل صعودی

## کندل نزولی (قرمز)
قیمت بسته < قیمت باز = کندل نزولی

## الگوهای مهم
- **Doji:** نشانه تردید بازار
- **Hammer:** سیگنال برگشت صعودی
- **Shooting Star:** سیگنال برگشت نزولی`
  },
  {
    id: 'l3', title: 'سطوح حمایت و مقاومت', description: 'شناسایی نقاط کلیدی قیمتی',
    duration: '25 دقیقه', level: 'مبتدی', category: 'تحلیل تکنیکال',
    content: `# حمایت و مقاومت

## حمایت (Support)
سطحی که قیمت تمایل دارد از آن برگردد (کف قیمتی)

## مقاومت (Resistance)
سطحی که قیمت تمایل دارد در آن متوقف شود (سقف قیمتی)

## قانون تبدیل
هنگامی که مقاومت شکسته می‌شود، به حمایت تبدیل می‌شود.

## چگونه پیدا کنیم؟
- ناحیه‌هایی که قیمت چند بار برگشته
- سطوح گرد (۵۰,۰۰۰ - ۱۰۰,۰۰۰)
- High/Low های قبلی`
  },
  {
    id: 'l4', title: 'اندیکاتور RSI', description: 'شاخص قدرت نسبی و کاربردهای آن',
    duration: '20 دقیقه', level: 'متوسط', category: 'اندیکاتورها',
    content: `# RSI (Relative Strength Index)

## تعریف
RSI یک اسیلاتور momentum است که از ۰ تا ۱۰۰ نوسان می‌کند.

## تفسیر
- **بالای ۷۰:** اشباع خرید - احتمال ریزش
- **زیر ۳۰:** اشباع فروش - احتمال رشد
- **۵۰:** خط میانه

## واگرایی (Divergence)
قوی‌ترین سیگنال RSI:
- قیمت بالاتر، RSI پایین‌تر → واگرایی نزولی
- قیمت پایین‌تر، RSI بالاتر → واگرایی صعودی`
  },
  {
    id: 'l5', title: 'میانگین متحرک (MA)', description: 'Moving Average و استراتژی‌های آن',
    duration: '20 دقیقه', level: 'متوسط', category: 'اندیکاتورها',
    content: `# Moving Average

## انواع
- **SMA:** میانگین ساده
- **EMA:** میانگین نمایی (وزن بیشتر به قیمت‌های اخیر)

## کاربرد
- تعیین جهت روند
- سطوح حمایت/مقاومت داینامیک
- سیگنال خرید/فروش

## استراتژی Golden Cross
MA20 از بالا MA50 را قطع کند = سیگنال خرید (Golden Cross)
MA20 از پایین MA50 را قطع کند = سیگنال فروش (Death Cross)`
  },
  {
    id: 'l6', title: 'MACD', description: 'Moving Average Convergence Divergence',
    duration: '25 دقیقه', level: 'متوسط', category: 'اندیکاتورها',
    content: `# MACD

## فرمول
MACD Line = EMA(12) - EMA(26)
Signal Line = EMA(9) of MACD
Histogram = MACD - Signal

## سیگنال‌ها
- MACD از بالا Signal را قطع کند = خرید
- MACD از پایین Signal را قطع کند = فروش
- Histogram مثبت = Bullish momentum
- Histogram منفی = Bearish momentum`
  },
  {
    id: 'l7', title: 'مدیریت ریسک', description: 'حفظ سرمایه و کنترل ضرر',
    duration: '30 دقیقه', level: 'پیشرفته', category: 'مدیریت سرمایه',
    content: `# مدیریت ریسک

## قانون ۱-۲٪
هرگز بیش از ۲٪ سرمایه در یک معامله ریسک نکنید.

## Stop Loss
همیشه حد ضرر داشته باشید. بدون Stop Loss معامله نکنید.

## نسبت Risk/Reward
حداقل ۱:۲ = اگر ۱۰۰ دلار ریسک می‌کنید، هدف ۲۰۰ دلار باشد.

## Drawdown
حداکثر افت از قله سرمایه. محدود کنید به ۲۰٪.

## قانون روز
اگر در روز ۳٪ ضرر کردید، معامله را متوقف کنید.`
  },
  {
    id: 'l8', title: 'روانشناسی معامله‌گری', description: 'کنترل احساسات در بازار',
    duration: '35 دقیقه', level: 'پیشرفته', category: 'روانشناسی',
    content: `# روانشناسی معامله‌گری

## FOMO (Fear of Missing Out)
ترس از جا ماندن از یک فرصت. منجر به خرید در اوج می‌شود.

## FUD (Fear, Uncertainty, Doubt)
ترس، عدم قطعیت، تردید. باعث فروش در کف می‌شود.

## Revenge Trading
معامله برای جبران ضرر. خطرناک‌ترین اشتباه.

## راه‌حل
- قوانین ثابت داشته باشید
- ژورنال بنویسید
- از احساسات مستقل باشید
- به سیستم اعتماد کنید`
  },
  {
    id: 'l9', title: 'معاملات فیوچرز', description: 'Long، Short و مدیریت اهرم',
    duration: '40 دقیقه', level: 'پیشرفته', category: 'فیوچرز',
    content: `# معاملات فیوچرز

## لانگ (Long)
پیش‌بینی افزایش قیمت. سود = قیمت بالاتر از ورود

## شورت (Short)
پیش‌بینی کاهش قیمت. سود = قیمت پایین‌تر از ورود

## اهرم (Leverage)
10x اهرم = ۱۰۰ دلار مارجین برای ۱۰۰۰ دلار پوزیشن
⚠️ ریسک ۱۰ برابر هم می‌شود!

## لیکوییدیشن
وقتی ضرر به مارجین برسد، پوزیشن بسته می‌شود.

## فاندینگ ریت
هر ۸ ساعت بین Long و Short رد و بدل می‌شود.`
  },
  {
    id: 'l10', title: 'تحلیل فاندامنتال', description: 'ارزیابی ارزش ذاتی ارزها',
    duration: '30 دقیقه', level: 'پیشرفته', category: 'تحلیل فاندامنتال',
    content: `# تحلیل فاندامنتال

## عوامل کلیدی
- **تیم پروژه:** تجربه و اعتبار
- **Technology:** نوآوری و مقیاس‌پذیری
- **Tokenomics:** عرضه، توزیع، تورم
- **Community:** جامعه و اکوسیستم

## On-Chain Analysis
- تعداد کیف پول‌های فعال
- حجم تراکنش‌ها
- Whale movements

## Market Cap
Total Supply × Price = Market Cap
برای مقایسه ارزها به کار می‌رود`
  },
];

const CATEGORIES = ['همه', 'اصول', 'تحلیل تکنیکال', 'اندیکاتورها', 'مدیریت سرمایه', 'روانشناسی', 'فیوچرز', 'تحلیل فاندامنتال'];

const CATEGORY_ICONS: Record<string, any> = {
  'اصول': BookOpen,
  'تحلیل تکنیکال': BarChart2,
  'اندیکاتورها': TrendingUp,
  'مدیریت سرمایه': Shield,
  'روانشناسی': Brain,
  'فیوچرز': Target,
  'تحلیل فاندامنتال': Star,
};

const LEVEL_COLORS = { 'مبتدی': 'text-emerald-400 bg-emerald-500/10', 'متوسط': 'text-yellow-400 bg-yellow-500/10', 'پیشرفته': 'text-red-400 bg-red-500/10' };

export default function EducationPage() {
  const { theme, addXP } = useStore();
  const isDark = theme === 'dark';
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [category, setCategory] = useState('همه');

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';

  const filteredLessons = LESSONS.filter(l => category === 'همه' || l.category === category);

  const handleComplete = (lesson: Lesson) => {
    if (!completedLessons.includes(lesson.id)) {
      setCompletedLessons(prev => [...prev, lesson.id]);
      addXP(200);
    }
    setSelectedLesson(null);
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className={`text-xl font-bold mb-4 mt-2 ${textPrimary}`}>{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className={`text-base font-bold mb-2 mt-4 ${textPrimary}`}>{line.slice(3)}</h2>;
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.*?)\*\*:(.*)/);
        if (match) return <li key={i} className={`mb-1 ${textPrimary}`}><strong className="text-indigo-400">{match[1]}:</strong>{match[2]}</li>;
      }
      if (line.startsWith('- ')) return <li key={i} className={`mb-1 ml-4 ${textPrimary}`}>{line.slice(2)}</li>;
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return <p key={i} className={`mb-2 ${textPrimary}`}>{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-indigo-400">{part}</strong> : part)}</p>;
      }
      if (line.startsWith('⚠️')) return <p key={i} className="mb-2 text-yellow-400 font-medium">{line}</p>;
      if (line === '') return <br key={i} />;
      return <p key={i} className={`mb-2 leading-relaxed ${textPrimary}`}>{line}</p>;
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}>
          <GraduationCap size={24} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${textPrimary}`}>مرکز آموزش</h1>
          <p className={`text-sm ${textMuted}`}>{completedLessons.length} از {LESSONS.length} درس تکمیل شده</p>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-32 h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div className="h-full rounded-full" style={{ width: `${(completedLessons.length / LESSONS.length) * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #ec4899)' }} />
            </div>
            <span className={`text-xs ${textMuted}`}>{Math.round((completedLessons.length / LESSONS.length) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                category === cat ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : `${textMuted} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
              }`}
            >
              {Icon && <Icon size={12} />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map(lesson => {
          const isCompleted = completedLessons.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className={`text-left p-5 rounded-2xl border transition-all hover:-translate-y-1 ${cardBg} ${isCompleted ? isDark ? 'border-emerald-500/30' : 'border-emerald-300' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  {isCompleted ? <CheckCircle size={20} className="text-emerald-400" /> : <Play size={20} className="text-indigo-400" />}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${LEVEL_COLORS[lesson.level]}`}>{lesson.level}</span>
                  <div className={`flex items-center gap-1 text-xs ${textMuted}`}>
                    <Clock size={10} />
                    {lesson.duration}
                  </div>
                </div>
              </div>

              <h3 className={`font-bold mb-1 text-sm ${textPrimary}`}>{lesson.title}</h3>
              <p className={`text-xs ${textMuted} leading-relaxed`}>{lesson.description}</p>

              <div className={`mt-3 text-[10px] px-2 py-0.5 rounded-lg w-fit ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                {lesson.category}
              </div>
            </button>
          );
        })}
      </div>

      {/* Lesson Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`} style={{ maxHeight: '85vh' }}>
            {/* Header */}
            <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${LEVEL_COLORS[selectedLesson.level]}`}>{selectedLesson.level}</span>
                  <div className={`flex items-center gap-1 text-xs ${textMuted}`}><Clock size={10} />{selectedLesson.duration}</div>
                </div>
                <h2 className={`font-bold ${textPrimary}`}>{selectedLesson.title}</h2>
              </div>
              <button onClick={() => setSelectedLesson(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="prose prose-sm max-w-none">
                {formatContent(selectedLesson.content)}
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between p-5 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <button onClick={() => setSelectedLesson(null)} className={`px-4 py-2 rounded-xl text-sm ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-all`}>
                بعداً می‌خوانم
              </button>
              <button
                onClick={() => handleComplete(selectedLesson)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}
              >
                <CheckCircle size={16} />
                {completedLessons.includes(selectedLesson.id) ? 'بازگشت' : 'تکمیل درس (+200 XP)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
