import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Eye, EyeOff, TrendingUp, Zap, Shield, Activity, BarChart3, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login, theme } = useStore();
  const [email, setEmail] = useState('trader@uts.io');
  const [password, setPassword] = useState('••••••••');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFA, setTwoFA] = useState('');
  const [step, setStep] = useState<'login' | '2fa'>('login');

  const isDark = theme === 'dark';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep('2fa');
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    login();
  };

  const features = [
    { icon: <TrendingUp size={20} />, text: 'بازار زنده ارزهای دیجیتال', color: 'text-emerald-400' },
    { icon: <Zap size={20} />, text: 'معاملات فیوچرز با اهرم تا 125x', color: 'text-yellow-400' },
    { icon: <BarChart3 size={20} />, text: 'نمودارهای حرفه‌ای و ابزار تکنیکال', color: 'text-blue-400' },
    { icon: <Shield size={20} />, text: 'سرمایه مجازی ۱۰ میلیون دلار', color: 'text-purple-400' },
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
        
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">UTS</div>
              <div className="text-xs text-gray-400">Ultimate Trading Simulator</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              شبیه‌ساز<br />
              <span className="gradient-text">حرفه‌ای ترید</span><br />
              ارزهای دیجیتال
            </h1>
            <p className="text-gray-400 text-lg mb-12 leading-relaxed">
              با ۱۰ میلیون دلار سرمایه مجازی، مهارت‌های معامله‌گری خود را در محیطی کاملاً واقع‌گرایانه توسعه دهید.
            </p>

            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                  <span className={f.color}>{f.icon}</span>
                  <span className="text-gray-300 text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'سرمایه مجازی', value: '$10M' },
              { label: 'ارزهای دیجیتال', value: '1000+' },
              { label: 'اندیکاتورها', value: '50+' },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-xl p-3 text-center">
                <div className="text-xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={`w-full lg:w-[420px] flex flex-col justify-center px-8 py-12 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-sm mx-auto w-full">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <div className="text-xl font-bold gradient-text">Ultimate Trading Simulator</div>
          </div>

          {step === 'login' ? (
            <>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>خوش آمدید</h2>
              <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                برای ورود به شبیه‌ساز، اطلاعات حساب را وارد کنید
              </p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    ایمیل
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500 focus:bg-gray-800'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white'
                    }`}
                    placeholder="trader@uts.io"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    رمز عبور
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none border pr-12 ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500'
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-400">حساب دمو آماده ورود</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    ایمیل: trader@uts.io | رمز: هر رمزی قبول می‌شود
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      در حال ورود...
                    </span>
                  ) : 'ورود به پلتفرم'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Lock size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>تأیید دو مرحله‌ای</h2>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>کد ۶ رقمی را وارد کنید</p>
                </div>
              </div>

              <form onSubmit={handle2FA} className="space-y-5">
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    کد تأیید (هر ۶ رقمی)
                  </label>
                  <input
                    type="text"
                    value={twoFA}
                    onChange={e => setTwoFA(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`w-full px-4 py-3 rounded-xl text-sm text-center font-mono tracking-[0.5em] transition-all outline-none border ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500'
                    }`}
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'} border border-indigo-500/20`}>
                  <p className="text-xs text-indigo-400">
                    💡 در این شبیه‌ساز، هر کد ۶ رقمی پذیرفته می‌شود
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={twoFA.length < 6 || loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      در حال تأیید...
                    </span>
                  ) : 'تأیید و ورود'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className={`w-full py-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} hover:text-indigo-400 transition-colors`}
                >
                  بازگشت
                </button>
              </form>
            </>
          )}

          <p className={`text-center text-xs mt-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            تمام معاملات مجازی هستند • هیچ پول واقعی استفاده نمی‌شود
          </p>
        </div>
      </div>
    </div>
  );
}
