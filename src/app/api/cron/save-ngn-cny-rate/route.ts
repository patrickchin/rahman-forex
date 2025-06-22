import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import bybitAdapter from 'lib/exchanges/bybitAdapter';
import gateAdapter from 'lib/exchanges/gateAdapter';

export async function GET(req: NextRequest) {
  try {
    // Fetch top Bybit NGN→USDT order
    const bybitOrders = await bybitAdapter.fetchP2POrders('USDT', 'NGN', 'BUY');
    // Fetch top Gate USDT→CNY order
    const gateOrders = await gateAdapter.fetchP2POrders('USDT', 'CNY', 'SELL');

    let bestRate = null;
    let ngnToUsdt = null;
    let usdtToCny = null;
    if (bybitOrders && bybitOrders.length > 0 && gateOrders && gateOrders.length > 0) {
      ngnToUsdt = bybitOrders[0].price; // NGN per USDT
      usdtToCny = gateOrders[0].price; // CNY per USDT
      if (ngnToUsdt > 0) {
        bestRate = usdtToCny / ngnToUsdt; // CNY per NGN
      }
    }

    if (!bestRate) throw new Error('No valid rate found');

    // Save to file (in /tmp for Vercel compatibility)
    const now = new Date().toISOString();
    const DATA_FILE = '/tmp/ngn_cny_rates.json';
    let data = [];
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
    data.push({ time: now, rate: bestRate, ngnToUsdt, usdtToCny });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify({ success: true, rate: bestRate, ngnToUsdt, usdtToCny }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
