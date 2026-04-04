export interface P2POffer {
  readonly key: string;
  readonly name: string;
  readonly price: number;
  readonly min: number;
  readonly max: number;
  readonly available: number;
  readonly exchange: string;
}

export interface P2PSearchParams {
  readonly side: 'BUY' | 'SELL';
  readonly asset: string;
  readonly fiat: string;
  readonly fiatAmount?: string;
}

export interface ExchangeResult {
  readonly exchange: string;
  readonly exchangeName: string;
  readonly data: readonly P2POffer[];
  readonly error: string | null;
  readonly fetched_at: string;
}

export interface ExchangeAdapter {
  readonly id: string;
  readonly name: string;
  fetch(params: P2PSearchParams): Promise<readonly P2POffer[]>;
}

const VALID_SIDES = new Set(['BUY', 'SELL']);

export function validateSide(side: string): side is 'BUY' | 'SELL' {
  return VALID_SIDES.has(side.toUpperCase());
}

export function parseSearchParams(params: {
  side?: string;
  asset?: string;
  fiat?: string;
}, searchParams: URLSearchParams): P2PSearchParams {
  const side = (params.side?.toUpperCase() || 'BUY');
  if (!validateSide(side)) {
    throw new Error(`Invalid side: ${side}. Must be BUY or SELL`);
  }
  const asset = params.asset?.toUpperCase() || 'USDT';
  const fiat = params.fiat?.toUpperCase() || 'CNY';
  const fiatAmount = searchParams.get('fiatAmount') || undefined;

  return { side: side as 'BUY' | 'SELL', asset, fiat, fiatAmount };
}

export function sortOffers(offers: readonly P2POffer[], side: 'BUY' | 'SELL'): readonly P2POffer[] {
  return [...offers].sort((a, b) => {
    return side === 'BUY' ? a.price - b.price : b.price - a.price;
  });
}

const DEFAULT_TIMEOUT_MS = 10_000;

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
