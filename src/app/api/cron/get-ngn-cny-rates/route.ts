import { NextRequest } from 'next/server';
import fs from 'fs';

export async function GET(req: NextRequest) {
  try {
    // Read from /tmp (Vercel compatible)
    const DATA_FILE = '/tmp/ngn_cny_rates.json';
    let data = [];
    if (false && fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } else {
      // Add 10 dummy points spaced 5 minutes apart if no data file exists
      const now = Date.now();
      for (let i = 10; i > 0; i--) {
        data.push({
          time: new Date(now - i * 5 * 60 * 1000).toISOString(),
          rate: 0.012 + Math.random() * 0.002,
          ngnToUsdt: 1500 + Math.random() * 100,
          usdtToCny: 11 + Math.random() * 0.5,
        });
      }
    }
    return new Response(JSON.stringify(data), {
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
