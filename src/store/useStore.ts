import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  ath: number;
  ath_change_percentage: number;
  sparkline_in_7d?: { price: number[] };
}

export interface Portfolio {
  [coinId: string]: {
    amount: number;
    avgBuyPrice: number;
    coinData: Coin;
  };
}

export interface Order {
  id: string;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  price: number;
  total: number;
  stopPrice?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  status: 'open' | 'filled' | 'cancelled' | 'partial';
  timestamp: number;
  filledAt?: number;
  pnl?: number;
  pnlPercent?: number;
  reason?: string;
  notes?: string;
  leverage?: number;
  isFutures?: boolean;
  positionType?: 'long' | 'short';
  margin?: number;
  liquidationPrice?: number;
  entryEmotion?: string;
  exitEmotion?: string;
}

export interface FuturesPosition {
  id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  side: 'long' | 'short';
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  amount: number;
  margin: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
  timestamp: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  status: 'open' | 'closed' | 'liquidated';
}

export interface JournalEntry {
  id: string;
  orderId: string;
  coinSymbol: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  pnl?: number;
  pnlPercent?: number;
  entryReason: string;
  exitReason?: string;
  mistakes?: string;
  lessons?: string;
  entryEmotion?: string;
  exitEmotion?: string;
  tags?: string[];
  timestamp: number;
  exitTimestamp?: number;
  rating?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  type: 'balance' | 'trades' | 'winrate' | 'daily' | 'weekly';
  completed: boolean;
  deadline?: number;
  startedAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  unlocked: boolean;
  xp: number;
}

export interface AppState {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // User / Account
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  userXP: number;
  userLevel: string;
  addXP: (xp: number) => void;

  // Balance
  balance: number;
  initialBalance: number;
  
  // Portfolio
  portfolio: Portfolio;
  
  // Orders
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => boolean;
  cancelOrder: (orderId: string) => void;
  closePosition: (orderId: string, currentPrice: number) => void;
  
  // Futures
  futuresPositions: FuturesPosition[];
  openFuturesPosition: (position: Omit<FuturesPosition, 'id' | 'timestamp' | 'pnl' | 'pnlPercent' | 'status' | 'currentPrice'>) => boolean;
  closeFuturesPosition: (positionId: string, currentPrice: number) => void;
  updateFuturesPrices: (prices: Record<string, number>) => void;
  
  // Market Data
  marketData: Coin[];
  setMarketData: (data: Coin[]) => void;
  watchlist: string[];
  toggleWatchlist: (coinId: string) => void;
  selectedCoin: Coin | null;
  setSelectedCoin: (coin: Coin | null) => void;
  
  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => void;
  
  // Challenges
  challenges: Challenge[];
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  
  // Stats
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  dailyPnL: number;
  peakBalance: number;
  
  // Notifications
  notifications: { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; timestamp: number }[];
  addNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeNotification: (id: string) => void;
}

const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'چالش دوبرابر کردن سرمایه',
    description: 'موجودی خود را از ۱۰ میلیون به ۲۰ میلیون دلار برسانید',
    target: 20000000,
    current: 10000000,
    reward: 5000,
    type: 'balance',
    completed: false,
    startedAt: Date.now(),
  },
  {
    id: 'c2',
    title: 'معامله‌گر فعال',
    description: '۱۰ معامله موفق انجام دهید',
    target: 10,
    current: 0,
    reward: 1000,
    type: 'trades',
    completed: false,
    startedAt: Date.now(),
  },
  {
    id: 'c3',
    title: 'نرخ برد ۶۰٪',
    description: 'نرخ موفقیت معاملات خود را به ۶۰٪ برسانید',
    target: 60,
    current: 0,
    reward: 2000,
    type: 'winrate',
    completed: false,
    startedAt: Date.now(),
  },
  {
    id: 'c4',
    title: 'چالش روزانه',
    description: 'امروز ۳ معامله انجام دهید',
    target: 3,
    current: 0,
    reward: 500,
    type: 'daily',
    completed: false,
    startedAt: Date.now(),
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'اولین قدم', description: 'اولین معامله خود را انجام دهید', icon: '🚀', unlocked: false, xp: 100 },
  { id: 'a2', title: 'سودساز', description: 'اولین معامله سودآور خود را ثبت کنید', icon: '💰', unlocked: false, xp: 200 },
  { id: 'a3', title: 'تحلیلگر', description: 'نمودار ۱۰ ارز مختلف را بررسی کنید', icon: '📊', unlocked: false, xp: 150 },
  { id: 'a4', title: 'فیوچرز باز', description: 'اولین پوزیشن فیوچرز را باز کنید', icon: '⚡', unlocked: false, xp: 300 },
  { id: 'a5', title: 'مدیر ریسک', description: 'از Stop Loss در ۵ معامله استفاده کنید', icon: '🛡️', unlocked: false, xp: 250 },
  { id: 'a6', title: 'صد معامله', description: '۱۰۰ معامله انجام دهید', icon: '🏆', unlocked: false, xp: 1000 },
  { id: 'a7', title: 'میلیونر مجازی', description: 'موجودی خود را به ۵۰ میلیون برسانید', icon: '💎', unlocked: false, xp: 5000 },
  { id: 'a8', title: 'ژورنال‌نویس', description: '۲۰ ورودی در ژورنال معاملاتی ثبت کنید', icon: '📔', unlocked: false, xp: 400 },
];

function getLevelFromXP(xp: number): string {
  if (xp < 500) return 'مبتدی';
  if (xp < 1500) return 'متوسط';
  if (xp < 5000) return 'پیشرفته';
  if (xp < 15000) return 'حرفه‌ای';
  return 'استاد معامله‌گری';
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      toggleTheme: () => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // Navigation
      currentPage: 'login',
      setCurrentPage: (page) => set({ currentPage: page }),

      // Auth
      isLoggedIn: false,
      login: () => set({ isLoggedIn: true, currentPage: 'dashboard' }),
      logout: () => set({ isLoggedIn: false, currentPage: 'login' }),
      
      userXP: 0,
      userLevel: 'مبتدی',
      addXP: (xp) => set(s => {
        const newXP = s.userXP + xp;
        return { userXP: newXP, userLevel: getLevelFromXP(newXP) };
      }),

      // Balance
      balance: 10000000,
      initialBalance: 10000000,

      // Portfolio
      portfolio: {},

      // Orders
      orders: [],
      placeOrder: (orderData) => {
        const state = get();
        const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        if (orderData.side === 'buy') {
          const cost = orderData.total;
          if (state.balance < cost) {
            get().addNotification('موجودی کافی نیست', 'error');
            return false;
          }
          
          const newPortfolio = { ...state.portfolio };
          if (newPortfolio[orderData.coinId]) {
            const existing = newPortfolio[orderData.coinId];
            const totalAmount = existing.amount + orderData.amount;
            const totalCost = existing.amount * existing.avgBuyPrice + orderData.amount * orderData.price;
            newPortfolio[orderData.coinId] = {
              ...existing,
              amount: totalAmount,
              avgBuyPrice: totalCost / totalAmount,
            };
          } else {
            const coinData = state.marketData.find(c => c.id === orderData.coinId);
            if (coinData) {
              newPortfolio[orderData.coinId] = {
                amount: orderData.amount,
                avgBuyPrice: orderData.price,
                coinData,
              };
            }
          }
          
          const newOrder: Order = { ...orderData, id, timestamp: Date.now(), status: 'filled', filledAt: Date.now() };
          set(s => ({
            balance: s.balance - cost,
            portfolio: newPortfolio,
            orders: [newOrder, ...s.orders],
            totalTrades: s.totalTrades + 1,
          }));
          get().addXP(50);
          get().addNotification(`خرید ${orderData.coinSymbol.toUpperCase()} با موفقیت انجام شد`, 'success');
          
          // Check achievements
          const { totalTrades, achievements } = get();
          if (totalTrades === 1 && !achievements.find(a => a.id === 'a1')?.unlocked) {
            get().unlockAchievement('a1');
          }
          return true;
        } else {
          // Sell
          const holding = state.portfolio[orderData.coinId];
          if (!holding || holding.amount < orderData.amount) {
            get().addNotification('موجودی کافی نیست', 'error');
            return false;
          }
          
          const pnl = (orderData.price - holding.avgBuyPrice) * orderData.amount;
          const pnlPercent = ((orderData.price - holding.avgBuyPrice) / holding.avgBuyPrice) * 100;
          
          const newPortfolio = { ...state.portfolio };
          if (Math.abs(holding.amount - orderData.amount) < 0.000001) {
            delete newPortfolio[orderData.coinId];
          } else {
            newPortfolio[orderData.coinId] = {
              ...holding,
              amount: holding.amount - orderData.amount,
            };
          }
          
          const newOrder: Order = { 
            ...orderData, id, timestamp: Date.now(), status: 'filled', filledAt: Date.now(),
            pnl, pnlPercent 
          };
          
          const won = pnl > 0;
          set(s => ({
            balance: s.balance + orderData.total,
            portfolio: newPortfolio,
            orders: [newOrder, ...s.orders],
            totalTrades: s.totalTrades + 1,
            winningTrades: won ? s.winningTrades + 1 : s.winningTrades,
            losingTrades: !won ? s.losingTrades + 1 : s.losingTrades,
            totalPnL: s.totalPnL + pnl,
            dailyPnL: s.dailyPnL + pnl,
            peakBalance: Math.max(s.peakBalance, s.balance + orderData.total),
          }));
          
          get().addXP(won ? 100 : 30);
          get().addNotification(
            `فروش ${orderData.coinSymbol.toUpperCase()} | سود/زیان: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
            pnl >= 0 ? 'success' : 'error'
          );
          
          if (won && !get().achievements.find(a => a.id === 'a2')?.unlocked) {
            get().unlockAchievement('a2');
          }
          return true;
        }
      },
      cancelOrder: (orderId) => set(s => ({
        orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o)
      })),
      closePosition: (orderId, currentPrice) => {
        const state = get();
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;
        const pnl = (currentPrice - order.price) * order.amount;
        set(s => ({
          orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'filled', pnl, filledAt: Date.now() } : o),
          balance: s.balance + pnl,
          totalPnL: s.totalPnL + pnl,
        }));
      },

      // Futures
      futuresPositions: [],
      openFuturesPosition: (posData) => {
        const state = get();
        if (state.balance < posData.margin) {
          get().addNotification('مارجین کافی نیست', 'error');
          return false;
        }
        const id = `fut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newPos: FuturesPosition = {
          ...posData,
          id,
          currentPrice: posData.entryPrice,
          pnl: 0,
          pnlPercent: 0,
          status: 'open',
          timestamp: Date.now(),
        };
        set(s => ({
          futuresPositions: [newPos, ...s.futuresPositions],
          balance: s.balance - posData.margin,
        }));
        get().addXP(80);
        get().addNotification(`پوزیشن ${posData.side === 'long' ? 'لانگ' : 'شورت'} ${posData.coinSymbol.toUpperCase()} باز شد`, 'success');
        if (!get().achievements.find(a => a.id === 'a4')?.unlocked) get().unlockAchievement('a4');
        return true;
      },
      closeFuturesPosition: (positionId, currentPrice) => {
        const state = get();
        const pos = state.futuresPositions.find(p => p.id === positionId);
        if (!pos) return;
        
        let pnl = 0;
        if (pos.side === 'long') {
          pnl = (currentPrice - pos.entryPrice) / pos.entryPrice * pos.margin * pos.leverage;
        } else {
          pnl = (pos.entryPrice - currentPrice) / pos.entryPrice * pos.margin * pos.leverage;
        }
        
        const returnAmount = pos.margin + pnl;
        set(s => ({
          futuresPositions: s.futuresPositions.map(p => 
            p.id === positionId ? { ...p, status: 'closed' as const, pnl, currentPrice } : p
          ),
          balance: s.balance + Math.max(0, returnAmount),
          totalPnL: s.totalPnL + pnl,
          totalTrades: s.totalTrades + 1,
          winningTrades: pnl > 0 ? s.winningTrades + 1 : s.winningTrades,
          losingTrades: pnl <= 0 ? s.losingTrades + 1 : s.losingTrades,
        }));
        get().addNotification(
          `پوزیشن بسته شد | سود/زیان: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
          pnl >= 0 ? 'success' : 'error'
        );
      },
      updateFuturesPrices: (prices) => {
        set(s => ({
          futuresPositions: s.futuresPositions.map(pos => {
            if (pos.status !== 'open') return pos;
            const price = prices[pos.coinId];
            if (!price) return pos;
            let pnl = 0;
            if (pos.side === 'long') {
              pnl = (price - pos.entryPrice) / pos.entryPrice * pos.margin * pos.leverage;
            } else {
              pnl = (pos.entryPrice - price) / pos.entryPrice * pos.margin * pos.leverage;
            }
            const pnlPercent = (pnl / pos.margin) * 100;
            // Check liquidation
            if (pnl <= -pos.margin * 0.9) {
              return { ...pos, currentPrice: price, pnl: -pos.margin, pnlPercent: -100, status: 'liquidated' as const };
            }
            return { ...pos, currentPrice: price, pnl, pnlPercent };
          })
        }));
      },

      // Market
      marketData: [],
      setMarketData: (data) => set({ marketData: data }),
      watchlist: ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple'],
      toggleWatchlist: (coinId) => set(s => ({
        watchlist: s.watchlist.includes(coinId)
          ? s.watchlist.filter(id => id !== coinId)
          : [...s.watchlist, coinId]
      })),
      selectedCoin: null,
      setSelectedCoin: (coin) => set({ selectedCoin: coin }),

      // Journal
      journalEntries: [],
      addJournalEntry: (entry) => set(s => ({
        journalEntries: [{ ...entry, id: `j_${Date.now()}` }, ...s.journalEntries]
      })),
      updateJournalEntry: (id, data) => set(s => ({
        journalEntries: s.journalEntries.map(e => e.id === id ? { ...e, ...data } : e)
      })),

      // Challenges & Achievements
      challenges: INITIAL_CHALLENGES,
      achievements: INITIAL_ACHIEVEMENTS,
      unlockAchievement: (id) => {
        const state = get();
        const achievement = state.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
          set(s => ({
            achievements: s.achievements.map(a => a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a)
          }));
          get().addXP(achievement.xp);
          get().addNotification(`🏆 دستاورد جدید: ${achievement.title}`, 'success');
        }
      },

      // Stats
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0,
      dailyPnL: 0,
      peakBalance: 10000000,

      // Notifications
      notifications: [],
      addNotification: (message, type) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set(s => ({ notifications: [{ id, message, type, timestamp: Date.now() }, ...s.notifications.slice(0, 4)] }));
        setTimeout(() => get().removeNotification(id), 4000);
      },
      removeNotification: (id) => set(s => ({
        notifications: s.notifications.filter(n => n.id !== id)
      })),
    }),
    {
      name: 'uts-storage-v1',
      partialize: (state) => ({
        theme: state.theme,
        isLoggedIn: state.isLoggedIn,
        balance: state.balance,
        portfolio: state.portfolio,
        orders: state.orders,
        futuresPositions: state.futuresPositions,
        watchlist: state.watchlist,
        journalEntries: state.journalEntries,
        challenges: state.challenges,
        achievements: state.achievements,
        totalTrades: state.totalTrades,
        winningTrades: state.winningTrades,
        losingTrades: state.losingTrades,
        totalPnL: state.totalPnL,
        dailyPnL: state.dailyPnL,
        peakBalance: state.peakBalance,
        userXP: state.userXP,
        userLevel: state.userLevel,
        currentPage: state.currentPage,
      }),
    }
  )
);
