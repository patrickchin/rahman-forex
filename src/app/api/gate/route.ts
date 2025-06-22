import { NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const asset = searchParams.get('asset') || 'USDT';
  const fiat = searchParams.get('fiat') || 'CNY';
  const side = searchParams.get('side') || 'SELL';
  try {
    const symbol = `${asset}_${fiat}`;
    const params = new URLSearchParams({
      type: 'push_order_list',
      symbol,
      big_trade: '0',
      fiat_amount: '',
      amount: '',
      pay_type: '',
      is_blue: '0',
      is_crown: '0',
      is_follow: '0',
      have_traded: '0',
      no_query_hide: '0',
      remove_limit: '0',
      per_page: '20',
      push_type: side.toLowerCase(),
      sort_type: '1',
      page: '1',
    });
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'csrftoken': '1',
    };
    const response = await axios.post(
      'https://www.gate.com/json_svr/query_push/',
      params.toString(),
      { headers, timeout: 10000 }
    );
    return new Response(JSON.stringify(response.data), {
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
