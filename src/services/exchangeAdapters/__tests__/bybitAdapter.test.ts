import bybitAdapter from '../bybitAdapter';

describe('BybitAdapter', () => {
  const adapter = bybitAdapter;

  it('should have the correct name', () => {
    expect(adapter.name).toBe('Bybit');
  });

  it('should fetch real P2P orders from Bybit API (integration)', async () => {
    const orders = await adapter.fetchP2POrders('USDT', 'USD', 'BUY');
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0]).toHaveProperty('id');
    expect(orders[0]).toHaveProperty('exchange', 'Bybit');
    expect(orders[0]).toHaveProperty('asset', 'USDT');
    expect(orders[0]).toHaveProperty('fiatCurrency', 'USD');
    expect(['BUY', 'SELL']).toContain(orders[0].side);
  }, 15000); // Allow up to 15s for real API
});
