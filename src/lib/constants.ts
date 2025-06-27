export const EXCHANGE_CONFIGS = {
  BYBIT: {
    name: "Bybit",
    id: "bybit",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://www.bybit.com/en/fiat/trade/otc/${side}/${asset.toUpperCase()}/${fiat.toUpperCase()}`,
  },
  BINANCE: {
    name: "Binance",
    id: "binance",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://p2p.binance.com/en/trade/${side}/${asset.toUpperCase()}?fiat=${fiat.toUpperCase()}`,
  },
  KUCOIN: {
    name: "KuCoin",
    id: "kucoin",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://www.kucoin.com/otc/${side}/${asset.toUpperCase()}-${fiat.toUpperCase()}`,
  },
  OKX: {
    name: "OKX",
    id: "okx",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://www.okx.com/p2p/ads-merchant?side=${side}&cryptoCurrency=${asset.toLowerCase()}&fiatCurrency=${fiat.toLowerCase()}`,
  },
  GATE: {
    name: "Gate.io",
    id: "gate",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://www.gate.io/otc?side=${side}&currency=${asset.toUpperCase()}&fiat=${fiat.toUpperCase()}`,
  },
};
