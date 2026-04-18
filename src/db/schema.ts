import { index, integer, json, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const p2pAdvertOrderHistory = pgTable("p2p_advert_order_history", {
  id: serial("id").primaryKey(),
  fetched_at: timestamp("fetched_at").notNull().defaultNow(),
  exchange: text("exchange").notNull(),
  asset: text("asset").notNull(),
  fiat: text("fiat").notNull(),
  side: text("side").notNull(),
  data: json("data").notNull().default("{}"),
});

export const priceSnapshots = pgTable(
  "price_snapshots",
  {
    id: serial("id").primaryKey(),
    recorded_at: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
    exchange: text("exchange").notNull(),
    asset: text("asset").notNull(),
    fiat: text("fiat").notNull(),
    side: text("side").notNull(),
    best_price: numeric("best_price", { precision: 18, scale: 6 }).notNull(),
    avg_price: numeric("avg_price", { precision: 18, scale: 6 }),
    offer_count: integer("offer_count"),
    total_volume: numeric("total_volume", { precision: 18, scale: 2 }),
  },
  (table) => [
    index("idx_snapshots_lookup").on(
      table.asset,
      table.fiat,
      table.side,
      table.exchange,
      table.recorded_at,
    ),
  ],
);
