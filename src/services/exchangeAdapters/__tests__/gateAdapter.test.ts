import GateAdapter from "../gateAdapter";
import { P2POrder } from "../../../types";

describe("GateAdapter", () => {
  const adapter = GateAdapter;

  it("should have the correct name", () => {
    expect(adapter.name).toBe("Gate");
  });

  it("should fetch real P2P orders from Gate API (integration)", async () => {
    const orders = await adapter.fetchP2POrders("USDT", "CNY", "SELL");
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0]).toHaveProperty("id");
    expect(orders[0]).toHaveProperty("exchange", "Gate");
    expect(orders[0]).toHaveProperty("asset", "USDT");
    expect(orders[0]).toHaveProperty("fiatCurrency", "CNY");
    expect(["BUY", "SELL"]).toContain(orders[0].side);
  }, 15000); // Allow up to 15s for real API
});
