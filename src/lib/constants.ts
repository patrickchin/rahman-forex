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
  OKX: {
    name: "OKX",
    id: "okx",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://www.okx.com/p2p-markets/${fiat.toLowerCase()}/${side}-${asset.toLowerCase()}`,
  },
  GATE: {
    name: "Gate",
    id: "gate",
    url: (asset: string, fiat: string, side: "buy" | "sell") =>
      `https://www.gate.com/p2p/${side}/${asset.toUpperCase()}-${fiat.toUpperCase()}`,
  },
};
