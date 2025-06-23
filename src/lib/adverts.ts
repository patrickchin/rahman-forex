import { db, p2pAdvertOrderHistory } from "@/db";
import { desc, eq, and } from "drizzle-orm";

export async function getLatestBybit() {
  const ngn_usdt = await db
    .select()
    .from(p2pAdvertOrderHistory)
    .where(
      and(
        eq(p2pAdvertOrderHistory.exchange, "bybit"),
        eq(p2pAdvertOrderHistory.fiat, "NGN"),
        eq(p2pAdvertOrderHistory.asset, "USDT"),
        eq(p2pAdvertOrderHistory.side, "BUY")
      )
    )
    .orderBy(desc(p2pAdvertOrderHistory.id));
  const items = (ngn_usdt[0]?.data as any)?.result?.items || [];
  // Map Bybit ads to unified type
  const mappedItems = items.map((ad: any) => ({
    time: ad.createDate ? new Date(Number(ad.createDate)).toLocaleString() : "",
    userId: ad.userId || ad.accountId || "",
    name: ad.nickName || "",
    price: ad.price,
    min: ad.minAmount,
    max: ad.maxAmount,
    available: ad.lastQuantity,
    currency: ad.currencyId || "NGN",
    payment: Array.isArray(ad.payments) ? ad.payments.join(", ") : "",
    side: ad.side === 1 ? "BUY" : "SELL",
    key: ad.id || ad.userId || ad.accountId || ad.createDate || Math.random().toString(),
  }));
  return {
    ...ngn_usdt[0],
    data: mappedItems,
  };
}

function parseGateMinMax(limit: string): { min: string, max: string } {
  // limit is like "1000~10383.24" or "7270~75486.15"
  if (!limit || typeof limit !== "string" || !limit.includes("~")) return { min: "", max: "" };
  const [min, max] = limit.split("~").map((v) => v.trim());
  return { min, max };
}

export async function getLatestGate() {
  const usdt_cny = await db
    .select()
    .from(p2pAdvertOrderHistory)
    .where(
      and(
        eq(p2pAdvertOrderHistory.exchange, "gate"),
        eq(p2pAdvertOrderHistory.fiat, "CNY"),
        eq(p2pAdvertOrderHistory.asset, "USDT"),
        eq(p2pAdvertOrderHistory.side, "SELL")
      )
    )
    .orderBy(desc(p2pAdvertOrderHistory.id));
  const items = (usdt_cny[0]?.data as any)?.push_order || [];
  // Map Gate ads to unified type
  const mappedItems = items.map((ad: any) => {
    const { min, max } = parseGateMinMax(ad.limit_total || ad.limit_fiat || "");
    // Swap the side: if ad.type is 'buy' make it 'SELL', if 'sell' make it 'BUY'
    let side = "SELL";
    if (ad.type) {
      const t = ad.type.toLowerCase();
      if (t === "buy") side = "SELL";
      else if (t === "sell") side = "BUY";
      else side = ad.type.toUpperCase();
    }
    return {
      time: ad.online_status || "",
      userId: ad.uid || ad.username || "",
      name: ad.username || "",
      price: ad.rate,
      min,
      max,
      available: ad.amount,
      currency: ad.curr_a || "USDT",
      payment: ad.pay_type_num || "",
      side,
      key: ad.oid || ad.uid || ad.username || Math.random().toString(),
    };
  });
  return {
    ...usdt_cny[0],
    data: mappedItems,
  };
}
