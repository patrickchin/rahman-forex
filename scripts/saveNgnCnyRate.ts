// scripts/saveNgnCnyRate.ts
// Fetches NGN/CNY rate from the Bybit API and saves it to a JSON file every 5 minutes

import axios from 'axios';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '../data/ngn_cny_rates.json');

async function fetchRate() {
  try {
    const payload = {
      userId: '',
      tokenId: 'CNY',
      currencyId: 'NGN',
      payment: [],
      side: '0',
      size: '1',
      page: '1',
      amount: '',
      vaMaker: false,
      bulkMaker: false,
      canTrade: true,
      verificationFilter: 0,
      sortType: 'TRADE_PRICE',
      paymentPeriod: [],
      itemRegion: 1
    };
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json;charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    const response = await axios.post(
      'https://api2.bybit.com/fiat/otc/item/online',
      payload,
      { headers, timeout: 10000 }
    );
    const items = response.data.result?.items || [];
    const rate = items[0]?.price ? parseFloat(items[0].price) : null;
    if (!rate) throw new Error('No rate found');
    return rate;
  } catch (error) {
    console.error('Error fetching rate:', error.message);
    return null;
  }
}

function saveRate(rate: number) {
  const now = new Date().toISOString();
  let data = [];
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
  data.push({ time: now, rate });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function main() {
  const rate = await fetchRate();
  if (rate) {
    saveRate(rate);
    console.log(`Saved rate: ${rate}`);
  }
}

main();
