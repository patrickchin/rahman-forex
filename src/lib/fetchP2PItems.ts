export interface FetchP2pParams {
  asset: string;
  fiat: string;
  side: "BUY" | "SELL";
}

export async function fetchBybitP2pItems({ asset, fiat, side }: FetchP2pParams) {
  const payload = {
    userId: '',
    tokenId: asset,
    currencyId: fiat,
    payment: [],
    side: side === 'BUY' ? '1' : '0',
    size: '20',
    page: '1',
    amount: '',
    vaMaker: false,
    bulkMaker: false,
    canTrade: true,
    verificationFilter: 0,
    sortType: 'TRADE_PRICE',
    paymentPeriod: [],
    itemRegion: 1
  };
  const headers = {
    'accept': 'application/json',
    'content-type': 'application/json;charset=UTF-8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };
  const response = await fetch('https://api2.bybit.com/fiat/otc/item/online', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    // 10s timeout is not natively supported by fetch; handle externally if needed
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchBinanceP2pItems({ asset, fiat, side }: FetchP2pParams) {
  const payload = {
    fiat,
    page: 1,
    rows: 20,
    tradeType: side,
    asset,
    countries: [],
    proMerchantAds: false,
    shieldMerchantAds: false,
    filterType: "all",
    periods: [],
    additionalKycVerifyFilter: 0,
    publisherType: null,
    payTypes: [],
    classifies: ["mass", "profession"]
  };
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };
  const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    // 10s timeout is not natively supported by fetch; handle externally if needed
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchGateP2pItems({ asset, fiat, side }: FetchP2pParams) {
  const symbol = `${asset}_${fiat}`;
  const params = new URLSearchParams({
    type: 'push_order_list',
    symbol,
    big_trade: '0',
    fiat_amount: '',
    amount: '',
    pay_type: '',
    is_blue: '0',
    is_crown: '0',
    is_follow: '0',
    have_traded: '0',
    no_query_hide: '0',
    remove_limit: '0',
    per_page: '20',
    push_type: side.toLowerCase(),
    sort_type: '1',
    page: '1',
  });
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'csrftoken': '1',
  };
  const response = await fetch('https://www.gate.com/json_svr/query_push/', {
    method: 'POST',
    headers,
    body: params.toString(),
    // 10s timeout is not natively supported by fetch; handle externally if needed
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchBitgetP2pItems({ asset, fiat, side }: FetchP2pParams) {
  const payload = {
    side: side === 'BUY' ? 1 : 2,
    pageNo: 1,
    pageSize: 20,
    coinCode: asset,
    fiatCode: fiat,
    languageType: 0
  };
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json;charset=utf-8',
  };
  const response = await fetch('https://www.bitget.com/v1/p2p/pub/adv/queryAdvList', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    // 10s timeout is not natively supported by fetch; handle externally if needed
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
