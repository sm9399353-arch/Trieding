import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { useMarketData } from './hooks/useMarketData';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MarketPage from './pages/MarketPage';
import TradePage from './pages/TradePage';
import FuturesPage from './pages/FuturesPage';
import PortfolioPage from './pages/PortfolioPage';
import JournalPage from './pages/JournalPage';
import AIPage from './pages/AIPage';
import EducationPage from './pages/EducationPage';
import ChallengesPage from './pages/ChallengesPage';
import SecurityPage from './pages/SecurityPage';

function AppContent() {
  const { currentPage } = useStore();
  useMarketData(); // Initialize market data fetching

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    market: <MarketPage />,
    trade: <TradePage />,
    futures: <FuturesPage />,
    portfolio: <PortfolioPage />,
    journal: <JournalPage />,
    ai: <AIPage />,
    education: <EducationPage />,
    challenges: <ChallengesPage />,
    security: <SecurityPage />,
  };

  return (
    <Layout>
      {pages[currentPage] || <DashboardPage />}
    </Layout>
  );
}

export default function App() {
  const { isLoggedIn, theme } = useStore();

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return <AppContent />;
}
