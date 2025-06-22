import { db, p2pAdvertOrderHistory } from "@/db";
import {
  FetchP2pParams,
  fetchBybitP2pItems,
  fetchGateP2pItems,
} from "@/lib/fetchP2PItems";

const RATE_LIMIT_KEY = "api/refresh-data:last_call";
const RATE_LIMIT_SECONDS = 10;
import { getRedisClient, disconnectRedis } from "@/lib/redisClient";

export async function GET() {
  const redis = await getRedisClient();
  try {
    const lastCall = await redis.get(RATE_LIMIT_KEY);
    const now = Math.floor(Date.now() / 1000);
    if (lastCall && now - Number(lastCall) < RATE_LIMIT_SECONDS) {
      return Response.json(
        { success: false, error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }
    await redis.set(RATE_LIMIT_KEY, now);

    // Fetch USDT/NGN from Bybit (BUY) and USDT/CNY from Gate (SELL) in parallel
    const bybitParams: FetchP2pParams = {
      asset: "USDT",
      fiat: "NGN",
      side: "BUY",
    };
    const gateParams: FetchP2pParams = {
      asset: "USDT",
      fiat: "CNY",
      side: "SELL",
    };
    const [bybitData, gateData] = await Promise.all([
      fetchBybitP2pItems(bybitParams),
      fetchGateP2pItems(gateParams),
    ]);
    await db.insert(p2pAdvertOrderHistory).values({
      exchange: "bybit",
      asset: bybitParams.asset,
      fiat: bybitParams.fiat,
      side: bybitParams.side,
      data: JSON.stringify(bybitData),
    });
    await db.insert(p2pAdvertOrderHistory).values({
      exchange: "gate",
      asset: gateParams.asset,
      fiat: gateParams.fiat,
      side: gateParams.side,
      data: JSON.stringify(gateData),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error in cron job:", error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : error,
    });
  } finally {
    await disconnectRedis();
  }
}
