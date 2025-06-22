import { json, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const p2pAdvertOrderHistory = pgTable("p2p_advert_order_history", {
  id: serial("id").primaryKey(),
  fetched_at: timestamp("fetched_at").notNull().defaultNow(),
  exchange: text("exchange").notNull(),
  asset: text("asset").notNull(),
  fiat: text("fiat").notNull(),
  side: text("side").notNull(),
  data: json("data").notNull().default("{}"),
});
