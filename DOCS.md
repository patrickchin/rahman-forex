# Rahman Forex — P2P Crypto Exchange Rate Comparison Dashboard

## Overview

Rahman Forex is a real-time P2P cryptocurrency exchange rate comparison dashboard. It aggregates peer-to-peer trading offers from multiple crypto exchanges (Bybit, Binance, OKX, Gate.io, HTX, KuCoin, Bitget) so users can identify the best conversion rates and arbitrage opportunities between fiat currencies via USDT.

**Example use case:** Find the cheapest way to convert NGN → USDT → CNY by comparing buy/sell prices across all supported exchanges.

---

## Tech Stack

| Layer          | Technology                                           |
| -------------- | ---------------------------------------------------- |
| Framework      | Next.js 15 (App Router), React 19, TypeScript        |
| Styling        | Tailwind CSS 4, Shadcn/ui (Radix UI primitives)      |
| Data Fetching  | SWR (client-side caching)                            |
| Database       | PostgreSQL 15, Drizzle ORM                           |
| Caching        | Redis 7 (IORedis locally, Upstash in production)     |
| Icons          | Lucide React                                         |
| Formatting     | numeral.js (numbers), date-fns (dates)               |
| Infrastructure | Docker Compose (dev), Vercel (prod)                  |
| Analytics      | Vercel Analytics                                     |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                         # Landing page
│   ├── layout.tsx                       # Root layout
│   ├── globals.css                      # Global styles
│   ├── [buyFiat]/
│   │   └── [asset]/
│   │       └── [sellFiat]/
│   │           └── page.tsx             # Main trading dashboard
│   └── api/
│       └── p2p/
│           └── search/
│               └── [side]/[asset]/[fiat]/
│                   ├── binance/route.ts # Binance P2P API
│                   ├── bybit/route.ts   # Bybit P2P API
│                   ├── okx/route.ts     # OKX P2P API
│                   ├── gate/route.ts    # Gate.io P2P API
│                   └── all/route.ts     # Aggregates all exchanges
├── components/
│   └── ui/                              # Shadcn/ui components (Button, Select, Table)
├── db/
│   ├── index.ts                         # Database connection
│   └── schema.ts                        # Drizzle schema
└── lib/
    ├── constants.ts                     # Exchange configs & URLs
    ├── redisClient.ts                   # Redis client (dev/prod)
    └── utils.ts                         # Utilities (cn helper)
```

---

## How It Works

### URL-Driven Configuration

The dashboard is driven entirely by URL parameters — no accounts or saved preferences needed:

```
/[buyFiat]/[asset]/[sellFiat]?buyex=EXCHANGE&sellex=EXCHANGE&minbuy=AMOUNT&minsell=AMOUNT
```

| Parameter  | Description                                      | Example   |
| ---------- | ------------------------------------------------ | --------- |
| `buyFiat`  | Fiat currency to buy crypto with                 | `ngn`     |
| `asset`    | Crypto asset to trade                            | `usdt`    |
| `sellFiat` | Fiat currency to sell crypto for                 | `cny`     |
| `buyex`    | Exchange for buy side                            | `BYBIT`   |
| `sellex`   | Exchange for sell side                            | `OKX`     |
| `minbuy`   | Minimum fiat amount filter for buy orders        | `1000000` |
| `minsell`  | Minimum fiat amount filter for sell orders       | `10000`   |

**Full example:** `/ngn/usdt/cny?buyex=BYBIT&sellex=OKX&minbuy=1000000&minsell=10000`

### Trading Dashboard

The main page renders a **dual-table layout**:

- **Left Panel (BUY):** P2P offers where you buy crypto with the buy-side fiat — sorted cheapest first.
- **Right Panel (SELL):** P2P offers where you sell crypto for the sell-side fiat — sorted highest first.

**Features:**
- Exchange selector dropdown (Bybit, Binance, OKX, Gate.io, HTX, KuCoin, Bitget, or All)
- Configurable row count (1, 3, 5, 10, 20)
- Manual refresh with loading states
- Row selection to pick the best offer
- Last-updated timestamp with relative time display
- **Conversion panel:** Calculates the effective fiat-to-fiat rate (e.g., NGN/CNY) based on selected buy/sell prices

### Conversion Rate Calculation

The cross-currency rate is computed as:

```
Rate = Buy Price (per USDT in buyFiat) / Sell Price (per USDT in sellFiat)
```

For example, if USDT/NGN = 1,500 and USDT/CNY = 7.0, then NGN → CNY rate ≈ 214.29.

---

## API Routes

All API routes follow the pattern:

```
/api/p2p/search/[side]/[asset]/[fiat]/[exchange]
```

| Exchange   | Upstream API                                            |
| ---------- | ------------------------------------------------------- |
| **Bybit**  | `api2.bybit.com/fiat/otc/item/online`                  |
| **Binance**| `p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search`  |
| **OKX**    | `www.okx.com/v3/c2c/tradingOrders/books`                |
| **Gate.io**| `www.gate.com/json_svr/query_push/`                     |
| **HTX**    | `www.htx.com/-/x/otc/v1/data/trade-market` (GET)       |
| **KuCoin** | `www.kucoin.com/_api/otc/ad/list` (GET)                 |
| **Bitget** | `www.bitget.com/v1/p2p/pub/adv/queryAdvList` (POST)     |
| **All**    | Aggregates all seven in parallel via `Promise.allSettled` |

Each exchange handler normalizes the response into a unified format containing: price, min/max amounts, available quantity, and merchant info.

### HTX Notes

HTX (formerly Huobi) uses numeric IDs instead of currency/coin codes. The adapter maintains lookup tables mapping standard codes (e.g., `USDT` → `2`, `NGN` → `15`, `RUB` → `11`). If a requested fiat or asset has no known ID, the adapter returns an empty array instead of erroring.

### KuCoin Notes

KuCoin's P2P API requires the `x-site: global` header. The `side` parameter uses the merchant's perspective: `SELL` means the merchant sells crypto (user buys), `BUY` means the merchant buys (user sells). The `floatPrice` field is the fiat price per crypto unit; `limitMinQuote`/`limitMaxQuote` are fiat-denominated order limits.

### Bitget Notes

Bitget's public P2P endpoint is `/v1/p2p/pub/adv/queryAdvList` (POST). Requires `locale`, `language`, and `terminaltype` headers. Side convention: `1` = user buys crypto, `2` = user sells. The `price` field is fiat per crypto; `minAmount`/`maxAmount` are fiat order limits; `lastAmount` is remaining crypto available.

---

## Database Schema

Single table — `p2pAdvertOrderHistory`:

| Column       | Type      | Description                          |
| ------------ | --------- | ------------------------------------ |
| `id`         | serial PK | Auto-incrementing identifier         |
| `fetched_at` | timestamp | When the data was fetched            |
| `exchange`   | text      | Exchange name (e.g., BYBIT)          |
| `asset`      | text      | Crypto asset (e.g., USDT)            |
| `fiat`       | text      | Fiat currency (e.g., NGN)            |
| `side`       | text      | Trade side (buy/sell)                |
| `data`       | json      | Raw advertisement data from exchange |

---

## Environment Variables

| Variable               | Required | Description                           |
| ---------------------- | -------- | ------------------------------------- |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string          |
| `REDIS_URL`            | Dev only | Local Redis URL                       |
| `UPSTASH_REDIS_URL`    | Prod     | Upstash Redis REST URL                |
| `UPSTASH_REDIS_TOKEN`  | Prod     | Upstash Redis auth token              |
| `CRON_SECRET`          | Prod     | Bearer token required for Vercel cron |

---

## Local Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### Setup

```bash
# Start PostgreSQL, Redis, and Adminer
docker compose up -d

# Install dependencies
npm install

# Run database migrations
npx drizzle-kit push

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`. Adminer (database GUI) is available at `http://localhost:8080`.

---

## Deployment

The backend is designed to run on **Vercel** with a managed PostgreSQL database and Upstash Redis.

### Production Checklist

1. Create a managed PostgreSQL database that accepts connections from Vercel.
2. Prefer the provider's pooled/transaction connection string for serverless workloads.
3. In Vercel project settings, add:
    - `DATABASE_URL`
    - `UPSTASH_REDIS_URL`
    - `UPSTASH_REDIS_TOKEN`
    - `CRON_SECRET`
4. Apply the production schema before the first deployment:

```bash
npm install
npm run db:push
```

5. Deploy to Vercel.
6. Verify the cron job exists in [vercel.json](vercel.json) and that `/api/cron/collect-prices` returns `401` without the bearer token in production.

### Recommended Rollout Flow

```bash
npm install
npm run test
npm run build
npm run db:push
```

After the schema is applied, trigger a deployment and verify:

- `GET /api/p2p/search/buy/USDT/NGN/all` returns aggregated offers.
- `GET /api/p2p/history/USDT/NGN?side=BUY&period=24h` returns data after the cron job has run.
- Vercel Cron invokes `/api/cron/collect-prices` once per day.

### Notes

- The database-backed routes use the Node.js runtime explicitly because `pg` is not supported on the Edge runtime.
- `CRON_SECRET` must be configured in Vercel so cron requests carry the expected `Authorization: Bearer ...` header.
- Use [.env.example](.env.example) as the baseline variable set for local and production environments.
