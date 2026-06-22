import { useEffect, useRef, useCallback } from 'react';
import type { Coin } from '../store/useStore';
import { useStore } from '../store/useStore';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Fallback mock data for when API is rate limited
const MOCK_COINS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 67420, market_cap_rank: 1, price_change_percentage_24h: 2.34, total_volume: 28500000000, market_cap: 1320000000000, high_24h: 68100, low_24h: 65800, circulating_supply: 19600000, ath: 73750, ath_change_percentage: -8.5, image: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3520, market_cap_rank: 2, price_change_percentage_24h: 1.87, total_volume: 15200000000, market_cap: 423000000000, high_24h: 3580, low_24h: 3420, circulating_supply: 120200000, ath: 4878, ath_change_percentage: -27.8, image: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png' },
  { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.0, market_cap_rank: 3, price_change_percentage_24h: 0.01, total_volume: 45000000000, market_cap: 112000000000, high_24h: 1.001, low_24h: 0.999, circulating_supply: 112000000000, ath: 1.32, ath_change_percentage: -24.2, image: 'https://assets.coingecko.com/coins/images/325/thumb/Tether.png' },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 582, market_cap_rank: 4, price_change_percentage_24h: 3.12, total_volume: 2100000000, market_cap: 87000000000, high_24h: 595, low_24h: 560, circulating_supply: 149500000, ath: 686.31, ath_change_percentage: -15.2, image: 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png' },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 178, market_cap_rank: 5, price_change_percentage_24h: 4.56, total_volume: 3800000000, market_cap: 83000000000, high_24h: 182, low_24h: 170, circulating_supply: 466000000, ath: 259.96, ath_change_percentage: -31.5, image: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png' },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.625, market_cap_rank: 6, price_change_percentage_24h: -1.23, total_volume: 1500000000, market_cap: 35000000000, high_24h: 0.641, low_24h: 0.611, circulating_supply: 56000000000, ath: 3.84, ath_change_percentage: -83.7, image: 'https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png' },
  { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin', current_price: 1.0, market_cap_rank: 7, price_change_percentage_24h: 0.02, total_volume: 8500000000, market_cap: 33000000000, high_24h: 1.001, low_24h: 0.999, circulating_supply: 33000000000, ath: 1.17, ath_change_percentage: -14.5, image: 'https://assets.coingecko.com/coins/images/6319/thumb/usdc.png' },
  { id: 'staked-ether', symbol: 'steth', name: 'Lido Staked Ether', current_price: 3510, market_cap_rank: 8, price_change_percentage_24h: 1.75, total_volume: 320000000, market_cap: 30000000000, high_24h: 3570, low_24h: 3410, circulating_supply: 8550000, ath: 4829, ath_change_percentage: -27.3, image: 'https://assets.coingecko.com/coins/images/13442/thumb/steth_logo.png' },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.48, market_cap_rank: 9, price_change_percentage_24h: 2.89, total_volume: 580000000, market_cap: 17000000000, high_24h: 0.491, low_24h: 0.463, circulating_supply: 35500000000, ath: 3.09, ath_change_percentage: -84.4, image: 'https://assets.coingecko.com/coins/images/975/thumb/cardano.png' },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.165, market_cap_rank: 10, price_change_percentage_24h: 5.67, total_volume: 1200000000, market_cap: 24000000000, high_24h: 0.171, low_24h: 0.155, circulating_supply: 145000000000, ath: 0.7376, ath_change_percentage: -77.6, image: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png' },
  { id: 'tron', symbol: 'trx', name: 'TRON', current_price: 0.125, market_cap_rank: 11, price_change_percentage_24h: 1.45, total_volume: 780000000, market_cap: 10800000000, high_24h: 0.128, low_24h: 0.122, circulating_supply: 86500000000, ath: 0.231, ath_change_percentage: -45.9, image: 'https://assets.coingecko.com/coins/images/1094/thumb/tron-logo.png' },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 14.2, market_cap_rank: 12, price_change_percentage_24h: 3.21, total_volume: 620000000, market_cap: 8600000000, high_24h: 14.65, low_24h: 13.70, circulating_supply: 605000000, ath: 52.88, ath_change_percentage: -73.1, image: 'https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png' },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 37.5, market_cap_rank: 13, price_change_percentage_24h: -2.15, total_volume: 450000000, market_cap: 15600000000, high_24h: 38.8, low_24h: 36.1, circulating_supply: 415000000, ath: 146.22, ath_change_percentage: -74.4, image: 'https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png' },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 7.8, market_cap_rank: 14, price_change_percentage_24h: 1.92, total_volume: 340000000, market_cap: 11000000000, high_24h: 8.0, low_24h: 7.55, circulating_supply: 1400000000, ath: 55.0, ath_change_percentage: -85.8, image: 'https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png' },
  { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', current_price: 0.0000245, market_cap_rank: 15, price_change_percentage_24h: 6.78, total_volume: 890000000, market_cap: 14500000000, high_24h: 0.0000258, low_24h: 0.0000228, circulating_supply: 589000000000000, ath: 0.0000888, ath_change_percentage: -72.4, image: 'https://assets.coingecko.com/coins/images/11939/thumb/shiba.png' },
  { id: 'wrapped-bitcoin', symbol: 'wbtc', name: 'Wrapped Bitcoin', current_price: 67350, market_cap_rank: 16, price_change_percentage_24h: 2.28, total_volume: 280000000, market_cap: 9500000000, high_24h: 68050, low_24h: 65750, circulating_supply: 141000, ath: 73621, ath_change_percentage: -8.5, image: 'https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png' },
  { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', current_price: 86, market_cap_rank: 17, price_change_percentage_24h: -0.85, total_volume: 420000000, market_cap: 6400000000, high_24h: 88.5, low_24h: 84.2, circulating_supply: 74600000, ath: 412.96, ath_change_percentage: -79.2, image: 'https://assets.coingecko.com/coins/images/2/thumb/litecoin.png' },
  { id: 'bitcoin-cash', symbol: 'bch', name: 'Bitcoin Cash', current_price: 385, market_cap_rank: 18, price_change_percentage_24h: 1.65, total_volume: 210000000, market_cap: 7600000000, high_24h: 393, low_24h: 375, circulating_supply: 19700000, ath: 3785.82, ath_change_percentage: -89.8, image: 'https://assets.coingecko.com/coins/images/780/thumb/bitcoin-cash-circle.png' },
  { id: 'uniswap', symbol: 'uni', name: 'Uniswap', current_price: 8.45, market_cap_rank: 19, price_change_percentage_24h: 4.12, total_volume: 180000000, market_cap: 6350000000, high_24h: 8.72, low_24h: 8.05, circulating_supply: 751000000, ath: 44.97, ath_change_percentage: -81.2, image: 'https://assets.coingecko.com/coins/images/12504/thumb/uni.jpg' },
  { id: 'near', symbol: 'near', name: 'NEAR Protocol', current_price: 6.2, market_cap_rank: 20, price_change_percentage_24h: 3.89, total_volume: 280000000, market_cap: 6800000000, high_24h: 6.45, low_24h: 5.95, circulating_supply: 1097000000, ath: 20.44, ath_change_percentage: -69.7, image: 'https://assets.coingecko.com/coins/images/10365/thumb/near.jpg' },
  { id: 'matic-network', symbol: 'matic', name: 'Polygon', current_price: 0.68, market_cap_rank: 21, price_change_percentage_24h: -1.45, total_volume: 320000000, market_cap: 6300000000, high_24h: 0.695, low_24h: 0.661, circulating_supply: 9300000000, ath: 2.92, ath_change_percentage: -76.7, image: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png' },
  { id: 'internet-computer', symbol: 'icp', name: 'Internet Computer', current_price: 11.8, market_cap_rank: 22, price_change_percentage_24h: 2.34, total_volume: 95000000, market_cap: 5500000000, high_24h: 12.1, low_24h: 11.4, circulating_supply: 467000000, ath: 700.65, ath_change_percentage: -98.3, image: 'https://assets.coingecko.com/coins/images/14495/thumb/Internet_Computer_logo.png' },
  { id: 'stellar', symbol: 'xlm', name: 'Stellar', current_price: 0.115, market_cap_rank: 23, price_change_percentage_24h: 0.76, total_volume: 68000000, market_cap: 3400000000, high_24h: 0.118, low_24h: 0.112, circulating_supply: 29500000000, ath: 0.875, ath_change_percentage: -86.8, image: 'https://assets.coingecko.com/coins/images/100/thumb/Stellar_symbol_black_RGB.png' },
  { id: 'monero', symbol: 'xmr', name: 'Monero', current_price: 162, market_cap_rank: 24, price_change_percentage_24h: -0.42, total_volume: 52000000, market_cap: 2980000000, high_24h: 165, low_24h: 159, circulating_supply: 18400000, ath: 517.62, ath_change_percentage: -68.7, image: 'https://assets.coingecko.com/coins/images/69/thumb/monero_logo.png' },
  { id: 'ethereum-classic', symbol: 'etc', name: 'Ethereum Classic', current_price: 26.5, market_cap_rank: 25, price_change_percentage_24h: 1.87, total_volume: 78000000, market_cap: 3800000000, high_24h: 27.2, low_24h: 25.8, circulating_supply: 142000000, ath: 167.09, ath_change_percentage: -84.1, image: 'https://assets.coingecko.com/coins/images/453/thumb/ethereum-classic-logo.png' },
  { id: 'cosmos', symbol: 'atom', name: 'Cosmos Hub', current_price: 7.15, market_cap_rank: 26, price_change_percentage_24h: 2.45, total_volume: 120000000, market_cap: 2790000000, high_24h: 7.38, low_24h: 6.92, circulating_supply: 390000000, ath: 44.45, ath_change_percentage: -83.9, image: 'https://assets.coingecko.com/coins/images/1481/thumb/cosmos_hub.png' },
  { id: 'filecoin', symbol: 'fil', name: 'Filecoin', current_price: 4.85, market_cap_rank: 27, price_change_percentage_24h: -2.89, total_volume: 145000000, market_cap: 2650000000, high_24h: 5.05, low_24h: 4.68, circulating_supply: 546000000, ath: 236.84, ath_change_percentage: -97.9, image: 'https://assets.coingecko.com/coins/images/12817/thumb/filecoin.png' },
  { id: 'hedera-hashgraph', symbol: 'hbar', name: 'Hedera', current_price: 0.108, market_cap_rank: 28, price_change_percentage_24h: 3.56, total_volume: 95000000, market_cap: 3600000000, high_24h: 0.112, low_24h: 0.104, circulating_supply: 33500000000, ath: 0.569, ath_change_percentage: -81.0, image: 'https://assets.coingecko.com/coins/images/3688/thumb/hbar.png' },
  { id: 'cronos', symbol: 'cro', name: 'Cronos', current_price: 0.093, market_cap_rank: 29, price_change_percentage_24h: 1.23, total_volume: 42000000, market_cap: 2450000000, high_24h: 0.096, low_24h: 0.090, circulating_supply: 26300000000, ath: 0.9698, ath_change_percentage: -90.4, image: 'https://assets.coingecko.com/coins/images/7310/thumb/cro_token_logo.png' },
  { id: 'aptos', symbol: 'apt', name: 'Aptos', current_price: 9.2, market_cap_rank: 30, price_change_percentage_24h: 5.23, total_volume: 175000000, market_cap: 3800000000, high_24h: 9.65, low_24h: 8.72, circulating_supply: 413000000, ath: 19.92, ath_change_percentage: -53.8, image: 'https://assets.coingecko.com/coins/images/26455/thumb/aptos_round.png' },
];

function addPriceNoise(coin: any): any {
  const noise = (Math.random() - 0.5) * 0.001;
  return {
    ...coin,
    current_price: coin.current_price * (1 + noise),
    price_change_percentage_24h: coin.price_change_percentage_24h + (Math.random() - 0.5) * 0.1,
  };
}

export function useMarketData() {
  const { setMarketData, updateFuturesPrices, marketData } = useStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryCountRef = useRef(0);

  const fetchFromAPI = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(
        `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,7d`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!response.ok) {
        if (response.status === 429) return false; // Rate limited
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setMarketData(data);
        const prices: Record<string, number> = {};
        data.forEach((coin: Coin) => { prices[coin.id] = coin.current_price; });
        updateFuturesPrices(prices);
        retryCountRef.current = 0;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [setMarketData, updateFuturesPrices]);

  const useMockData = useCallback(() => {
    const enriched = MOCK_COINS.map(addPriceNoise);
    setMarketData(enriched as any);
    const prices: Record<string, number> = {};
    enriched.forEach(coin => { prices[coin.id] = coin.current_price; });
    updateFuturesPrices(prices);
  }, [setMarketData, updateFuturesPrices]);

  const updatePrices = useCallback(async () => {
    const success = await fetchFromAPI();
    if (!success) {
      retryCountRef.current++;
      // Use mock data if API fails
      if (marketData.length === 0 || retryCountRef.current > 2) {
        useMockData();
      } else {
        // Just add small noise to existing data
        const updated = marketData.map(addPriceNoise);
        setMarketData(updated);
        const prices: Record<string, number> = {};
        updated.forEach(coin => { prices[coin.id] = coin.current_price; });
        updateFuturesPrices(prices);
      }
    }
  }, [fetchFromAPI, useMockData, marketData, setMarketData, updateFuturesPrices]);

  useEffect(() => {
    // Initial load
    updatePrices();
    // Update every 30 seconds
    intervalRef.current = setInterval(updatePrices, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { marketData };
}

// Generate candlestick data for charts
export function generateCandleData(basePrice: number, count: number = 200, volatility: number = 0.02) {
  const candles = [];
  let price = basePrice * (0.7 + Math.random() * 0.3);
  const now = Date.now();
  
  for (let i = count; i >= 0; i--) {
    const open = price;
    const changePercent = (Math.random() - 0.48) * volatility;
    const close = open * (1 + changePercent);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    const volume = Math.random() * 1000000 + 100000;
    
    candles.push({
      time: Math.floor((now - i * 3600000) / 1000),
      open: parseFloat(open.toFixed(8)),
      high: parseFloat(high.toFixed(8)),
      low: parseFloat(low.toFixed(8)),
      close: parseFloat(close.toFixed(8)),
      volume: parseFloat(volume.toFixed(2)),
    });
    price = close;
  }
  return candles;
}


