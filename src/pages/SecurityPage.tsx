import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Shield, Smartphone, Eye, Clock, Globe, CheckCircle, AlertTriangle, Key, Activity, LogOut } from 'lucide-react';

const ACTIVITY_LOG = [
  { action: 'ورود موفق', ip: '192.168.1.1', device: 'Chrome / Windows', time: Date.now() - 1000 * 60 * 5, status: 'success' },
  { action: 'تأیید دو مرحله‌ای', ip: '192.168.1.1', device: 'Chrome / Windows', time: Date.now() - 1000 * 60 * 5, status: 'success' },
  { action: 'خرید BTC', ip: '192.168.1.1', device: 'Chrome / Windows', time: Date.now() - 1000 * 60 * 30, status: 'success' },
  { action: 'باز کردن پوزیشن فیوچرز', ip: '192.168.1.1', device: 'Chrome / Windows', time: Date.now() - 1000 * 60 * 60, status: 'success' },
  { action: 'تغییر تنظیمات', ip: '192.168.1.1', device: 'Chrome / Windows', time: Date.now() - 1000 * 60 * 120, status: 'success' },
];

const DEVICES = [
  { name: 'Chrome / Windows 11', ip: '192.168.1.1', lastActive: 'همین الان', current: true, icon: '💻' },
  { name: 'Safari / iPhone 15', ip: '10.0.0.5', lastActive: '۲ ساعت پیش', current: false, icon: '📱' },
  { name: 'Firefox / macOS', ip: '172.16.0.3', lastActive: '۱ روز پیش', current: false, icon: '🖥️' },
];

export default function SecurityPage() {
  const { theme, logout } = useStore();
  const isDark = theme === 'dark';
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';

  const securityScore = twoFAEnabled ? 92 : 65;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${textPrimary}`}>مرکز امنیت</h1>
          <p className={`text-sm ${textMuted}`}>مدیریت امنیت حساب کاربری</p>
        </div>
      </div>

      {/* Security Score */}
      <div className={`rounded-2xl border p-6 ${cardBg}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`font-bold text-lg ${textPrimary}`}>امتیاز امنیتی</h2>
            <p className={`text-sm ${textMuted}`}>وضعیت کلی امنیت حساب شما</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke={isDark ? '#1f2937' : '#e5e7eb'} strokeWidth="8" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={securityScore >= 80 ? '#10b981' : securityScore >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34 * securityScore / 100} ${2 * Math.PI * 34}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-black ${securityScore >= 80 ? 'text-emerald-400' : securityScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{securityScore}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'ورود دو مرحله‌ای', status: twoFAEnabled, icon: <Smartphone size={16} /> },
            { label: 'رمز عبور قوی', status: true, icon: <Key size={16} /> },
            { label: 'ایمیل تأیید شده', status: true, icon: <CheckCircle size={16} /> },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className={item.status ? 'text-emerald-400' : 'text-red-400'}>{item.icon}</div>
              <span className={`text-sm ${textPrimary}`}>{item.label}</span>
              <div className="ml-auto">
                {item.status ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-red-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2FA */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="text-indigo-400" />
              <h2 className={`font-bold ${textPrimary}`}>تأیید دو مرحله‌ای (2FA)</h2>
            </div>
            <button
              onClick={() => setTwoFAEnabled(!twoFAEnabled)}
              className={`relative w-12 h-6 rounded-full transition-all ${twoFAEnabled ? 'bg-emerald-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow ${twoFAEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <p className={`text-sm mb-4 ${textMuted}`}>
            {twoFAEnabled ? '✅ تأیید دو مرحله‌ای فعال است.' : '⚠️ تأیید دو مرحله‌ای غیرفعال است. برای امنیت بیشتر فعال کنید.'}
          </p>

          {twoFAEnabled && (
            <div>
              <button
                onClick={() => setShowQR(!showQR)}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                {showQR ? 'مخفی کردن' : 'نمایش'} QR Code
              </button>

              {showQR && (
                <div className={`mt-4 p-4 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="w-32 h-32 mx-auto mb-3 rounded-xl overflow-hidden" style={{ background: 'white', padding: '8px' }}>
                    <div className="w-full h-full" style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'white\'/%3E%3Cg fill=\'black\'%3E%3Crect x=\'10\' y=\'10\' width=\'30\' height=\'30\'/%3E%3Crect x=\'60\' y=\'10\' width=\'30\' height=\'30\'/%3E%3Crect x=\'10\' y=\'60\' width=\'30\' height=\'30\'/%3E%3Crect x=\'45\' y=\'45\' width=\'10\' height=\'10\'/%3E%3Crect x=\'60\' y=\'60\' width=\'10\' height=\'10\'/%3E%3Crect x=\'75\' y=\'60\' width=\'10\' height=\'10\'/%3E%3Crect x=\'60\' y=\'75\' width=\'10\' height=\'10\'/%3E%3Crect x=\'75\' y=\'75\' width=\'10\' height=\'10\'/%3E%3C/g%3E%3C/svg%3E")',
                      backgroundSize: 'cover'
                    }} />
                  </div>
                  <p className={`text-xs ${textMuted}`}>با اپلیکیشن Google Authenticator اسکن کنید</p>
                  <div className={`mt-2 px-3 py-1.5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'} font-mono text-xs`}>
                    JBSWY3DPEHPK3PXP
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <Eye size={18} className="text-indigo-400" />
            <h2 className={`font-bold ${textPrimary}`}>اطلاعات حساب</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: 'ایمیل', value: 'trader@uts.io', verified: true },
              { label: 'نام کاربری', value: 'Trader Pro', verified: true },
              { label: 'نوع حساب', value: 'شبیه‌ساز مجازی', verified: true },
              { label: 'تاریخ عضویت', value: new Date().toLocaleDateString('fa-IR'), verified: false },
            ].map((info, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className={`text-xs ${textMuted}`}>{info.label}</div>
                  <div className={`text-sm font-medium ${textPrimary}`}>{info.value}</div>
                </div>
                {info.verified && <CheckCircle size={14} className="text-emerald-400" />}
              </div>
            ))}
          </div>

          <button
            onClick={logout}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20`}
          >
            <LogOut size={16} /> خروج از حساب
          </button>
        </div>
      </div>

      {/* Active Devices */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-indigo-400" />
          <h2 className={`font-bold ${textPrimary}`}>دستگاه‌های فعال</h2>
        </div>
        <div className="space-y-3">
          {DEVICES.map((device, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{device.icon}</span>
                <div>
                  <div className={`text-sm font-medium ${textPrimary}`}>
                    {device.name}
                    {device.current && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">جاری</span>}
                  </div>
                  <div className={`text-xs ${textMuted}`}>{device.ip} • {device.lastActive}</div>
                </div>
              </div>
              {!device.current && (
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  قطع اتصال
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-indigo-400" />
          <h2 className={`font-bold ${textPrimary}`}>لاگ فعالیت‌ها</h2>
        </div>
        <div className="space-y-2">
          {ACTIVITY_LOG.map((log, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <div className="flex-1">
                <div className={`text-sm font-medium ${textPrimary}`}>{log.action}</div>
                <div className={`text-xs ${textMuted}`}>{log.ip} • {log.device}</div>
              </div>
              <div className={`text-xs ${textMuted} flex items-center gap-1`}>
                <Clock size={10} />
                {Math.round((Date.now() - log.time) / 60000)} دقیقه پیش
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
