import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard, TrendingUp, BarChart3, Briefcase, BookOpen,
  GraduationCap, Target, Brain, Shield, ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, Menu, X, Zap, Star, Award,
  Activity
} from 'lucide-react';
import NotificationToast from './NotificationToast';
import PriceTicker from './PriceTicker';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'داشبورد', labelEn: 'Dashboard' },
  { id: 'market', icon: TrendingUp, label: 'بازار', labelEn: 'Market' },
  { id: 'trade', icon: BarChart3, label: 'ترید', labelEn: 'Trade' },
  { id: 'futures', icon: Zap, label: 'فیوچرز', labelEn: 'Futures' },
  { id: 'portfolio', icon: Briefcase, label: 'پرتفوی', labelEn: 'Portfolio' },
  { id: 'journal', icon: BookOpen, label: 'ژورنال', labelEn: 'Journal' },
  { id: 'challenges', icon: Target, label: 'چالش‌ها', labelEn: 'Challenges' },
  { id: 'education', icon: GraduationCap, label: 'آموزش', labelEn: 'Education' },
  { id: 'ai', icon: Brain, label: 'هوش مصنوعی', labelEn: 'AI Coach' },
  { id: 'security', icon: Shield, label: 'امنیت', labelEn: 'Security' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, currentPage, setCurrentPage, logout, balance, totalPnL, userLevel, userXP, achievements } = useStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  const formatBalance = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
  };

  const sidebarBg = isDark
    ? 'bg-gray-900 border-gray-800'
    : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const headerBg = isDark
    ? 'bg-gray-900/95 border-gray-800'
    : 'bg-white/95 border-gray-200';
  const mainBg = isDark ? 'bg-gray-950' : 'bg-gray-50';

  return (
    <div className={`flex h-screen overflow-hidden ${mainBg} ${textPrimary}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r transition-all duration-300 ${sidebarBg} ${sidebarCollapsed ? 'w-16' : 'w-60'} flex-shrink-0 z-30`}
      >
        {/* Logo */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'px-4'} h-16 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Activity size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold gradient-text">UTS</div>
                <div className={`text-[10px] ${textSecondary}`}>Trading Simulator</div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
          )}
        </div>

        {/* Balance Card */}
        {!sidebarCollapsed && (
          <div className={`mx-3 mt-4 p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className={`text-[10px] ${textSecondary} mb-1`}>موجودی کل</div>
            <div className="text-lg font-bold font-mono gradient-text">{formatBalance(balance)}</div>
            <div className={`text-xs mt-1 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{formatBalance(totalPnL)} کل
            </div>
          </div>
        )}

        {/* User Level */}
        {!sidebarCollapsed && (
          <div className={`mx-3 mt-2 p-2 rounded-lg ${isDark ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-200'}`}>
            <div className="flex items-center gap-2">
              <Star size={12} className="text-yellow-400" />
              <span className="text-xs font-medium text-indigo-400">{userLevel}</span>
              <span className={`ml-auto text-[10px] ${textSecondary}`}>{userXP} XP</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                  ${isActive
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                    : `${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : ''} />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className={`border-t p-2 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 mb-2">
              <Award size={12} className="text-yellow-400" />
              <span className={`text-xs ${textSecondary}`}>{unlockedAchievements} دستاورد</span>
            </div>
          )}
          <div className="flex gap-1">
            <button
              onClick={toggleTheme}
              className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              title="تغییر تم"
            >
              {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-400" />}
            </button>
            <button
              onClick={logout}
              className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              title="خروج"
            >
              <LogOut size={16} />
            </button>
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-full flex items-center justify-center p-2 rounded-lg mt-1 transition-all ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileMenuOpen(false)} />
          <div className={`absolute left-0 top-0 bottom-0 w-64 ${sidebarBg} border-r flex flex-col`}>
            <div className={`flex items-center justify-between px-4 h-16 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Activity size={16} className="text-white" />
                </div>
                <span className="font-bold gradient-text">UTS</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                      ${isActive ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                        : `${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className={`border-t p-3 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <button onClick={logout} className="flex items-center gap-2 text-sm text-red-400 p-2">
                <LogOut size={16} /> خروج از حساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className={`h-14 border-b ${headerBg} flex items-center px-4 gap-4 flex-shrink-0 z-20 backdrop-blur-md`}>
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Page Title */}
          <div className="flex-1">
            <h1 className="text-sm font-semibold">
              {NAV_ITEMS.find(n => n.id === currentPage)?.label || 'داشبورد'}
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Balance - Desktop */}
            <div className={`hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div>
                <div className={`text-[10px] ${textSecondary}`}>موجودی</div>
                <div className="text-sm font-bold font-mono text-emerald-400">{formatBalance(balance)}</div>
              </div>
              <div className={`h-8 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
              <div>
                <div className={`text-[10px] ${textSecondary}`}>سود/زیان کل</div>
                <div className={`text-sm font-bold font-mono ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}{formatBalance(totalPnL)}
                </div>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-500" />}
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('security')}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                T
              </div>
            </div>
          </div>
        </header>

        {/* Price Ticker */}
        <PriceTicker />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Notifications */}
      <NotificationToast />
    </div>
  );
}
