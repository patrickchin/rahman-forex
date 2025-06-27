export const EXCHANGE_CONFIGS = {
  BYBIT: {
    name: "Bybit",
    id: "bybit",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://www.bybit.com/en/fiat/trade/otc/${side}/${asset.toUpperCase()}/${fiat.toUpperCase()}`,
    api: (asset: string, fiat: string, side: "buy" | "sell") =>
      `/api/p2p/search/bybit/${side}/${asset.toLowerCase()}/${fiat.toLowerCase()}`,
  },
  BINANCE: {
    name: "Binance",
    id: "binance",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://p2p.binance.com/en/trade/${side}/${asset.toUpperCase()}?fiat=${fiat.toUpperCase()}`,
    api: (asset: string, fiat: string, side: "buy" | "sell") =>
      `/api/p2p/search/binance/${side}/${asset.toLowerCase()}/${fiat.toLowerCase()}`,
  },
  KUCOIN: {
    name: "KuCoin",
    id: "kucoin",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://www.kucoin.com/otc/${side}/${asset.toUpperCase()}-${fiat.toUpperCase()}`,
    api: (asset: string, fiat: string, side: "buy" | "sell") =>
      `/api/p2p/search/kucoin/${side}/${asset.toLowerCase()}/${fiat.toLowerCase()}`,
  },
  OKX: {
    name: "OKX",
    id: "okx",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://www.okx.com/p2p/ads-merchant?side=${side}&cryptoCurrency=${asset.toLowerCase()}&fiatCurrency=${fiat.toLowerCase()}`,
    api: (asset: string, fiat: string, side: "buy" | "sell") =>
      `/api/p2p/search/okx/${side}/${asset.toLowerCase()}/${fiat.toLowerCase()}`,
  },
};
