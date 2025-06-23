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
  let redis;
  try {
    try {
      redis = await getRedisClient();
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      return Response.json(
        {
          success: false,
          error: "Failed to connect to Redis.",
          details: error instanceof Error ? error.message : error,
        },
        { status: 500 }
      );
    }

    let lastCall;
    let now;
    try {
      lastCall = await redis.get(RATE_LIMIT_KEY);
      now = Math.floor(Date.now() / 1000);
      if (lastCall && now - Number(lastCall) < RATE_LIMIT_SECONDS) {
        return Response.json(
          { success: false, error: "Rate limit exceeded. Try again later." },
          { status: 429 }
        );
      }
      await redis.set(RATE_LIMIT_KEY, now);
    } catch (error) {
      console.error("Error during Redis rate limit check:", error);
      return Response.json(
        {
          success: false,
          error: "Redis rate limit check failed.",
          details: error instanceof Error ? error.message : error,
        },
        { status: 500 }
      );
    }

    // Fetch USDT/NGN from Bybit (BUY) and USDT/CNY from Gate (SELL) in parallel, but distinguish errors
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
    const [bybitResult, gateResult] = await Promise.allSettled([
      fetchBybitP2pItems(bybitParams),
      fetchGateP2pItems(gateParams),
    ]);

    if (bybitResult.status === "rejected") {
      console.error("Error fetching Bybit P2P data:", bybitResult.reason);
      return Response.json(
        {
          success: false,
          error: "Failed to fetch Bybit P2P data.",
          details:
            bybitResult.reason instanceof Error
              ? bybitResult.reason.message
              : bybitResult.reason,
        },
        { status: 502 }
      );
    }
    if (gateResult.status === "rejected") {
      console.error("Error fetching Gate P2P data:", gateResult.reason);
      return Response.json(
        {
          success: false,
          error: "Failed to fetch Gate P2P data.",
          details:
            gateResult.reason instanceof Error
              ? gateResult.reason.message
              : gateResult.reason,
        },
        { status: 502 }
      );
    }
    const bybitData = bybitResult.value;
    const gateData = gateResult.value;

    try {
      await db.insert(p2pAdvertOrderHistory).values({
        exchange: "bybit",
        asset: "USDT",
        fiat: "NGN",
        side: "BUY",
        data: JSON.stringify(bybitData),
      });
      await db.insert(p2pAdvertOrderHistory).values({
        exchange: "gate",
        asset: "USDT",
        fiat: "CNY",
        side: "SELL",
        data: JSON.stringify(gateData),
      });
    } catch (error) {
      console.error("Error inserting into database:", error);
      return Response.json(
        {
          success: false,
          error: "Database insert failed.",
          details: error instanceof Error ? error.message : error,
        },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Unknown error in /api/refresh-data request:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  } finally {
    try {
      await disconnectRedis();
    } catch (error) {
      console.error("Error disconnecting Redis:", error);
    }
  }
}
