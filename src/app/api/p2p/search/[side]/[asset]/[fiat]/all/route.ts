import { NextResponse } from 'next/server';
import { EXCHANGE_CONFIGS } from '@/lib/constants';

// Route: /api/p2p/search/[side]/[asset]/[fiat]/all/route.ts
export async function GET(
  req: Request,
  context: { params: Promise<{ side?: string; asset?: string; fiat?: string }> }
) {
  try {
    // Await params for Next.js dynamic API routes
    const paramsObj = await context.params;
    const { searchParams } = new URL(req.url);
    const fiatAmount = searchParams.get('fiatAmount') || '';
    
    const side = paramsObj.side?.toLowerCase() || 'sell';
    const asset = paramsObj.asset?.toUpperCase() || 'USDT';
    const fiat = paramsObj.fiat?.toUpperCase() || 'CNY';

    // Get the base URL from the current request
    const baseUrl = new URL(req.url).origin;
    
    // List of exchanges to fetch from (excluding 'ALL' itself)
    const exchangesToFetch = Object.keys(EXCHANGE_CONFIGS).filter(key => key !== 'ALL');
    
    // Create query parameters for the requests
    const queryParams = fiatAmount ? `?fiatAmount=${encodeURIComponent(fiatAmount)}` : '';
    
    // Fetch data from all exchanges concurrently
    const fetchPromises = exchangesToFetch.map(async (exchangeKey) => {
      const exchangeConfig = EXCHANGE_CONFIGS[exchangeKey as keyof typeof EXCHANGE_CONFIGS];
      const exchangeId = exchangeConfig.id;
      const exchangeName = exchangeConfig.name;
      const apiUrl = `${baseUrl}/api/p2p/search/${side}/${asset}/${fiat}/${exchangeId}${queryParams}`;
      
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn(`Failed to fetch from ${exchangeId}: ${response.status} ${response.statusText}`);
          return {
            exchange: exchangeId,
            exchangeName: exchangeName,
            data: [],
            error: `HTTP ${response.status}: ${response.statusText}`,
            fetched_at: new Date().toISOString(),
          };
        }
        
        const data = await response.json();
        return {
          exchange: exchangeId,
          exchangeName: exchangeName,
          data: data.data || [],
          fetched_at: data.fetched_at || new Date().toISOString(),
          error: data.error || null,
        };
      } catch (error: any) {
        console.warn(`Error fetching from ${exchangeId}:`, error.message);
        return {
          exchange: exchangeId,
          exchangeName: exchangeName,
          data: [],
          error: error.message || 'Unknown error',
          fetched_at: new Date().toISOString(),
        };
      }
    });

    // Wait for all requests to complete
    const results = await Promise.allSettled(fetchPromises);
    
    // Process results and combine data
    const exchangeResults: any[] = [];
    const allData: any[] = [];
    let successCount = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const exchangeResult = result.value;
        exchangeResults.push(exchangeResult);
        
        if (!exchangeResult.error && exchangeResult.data.length > 0) {
          successCount++;
          // Add exchange identifier to each item
          const dataWithExchange = exchangeResult.data.map((item: any) => ({
            ...item,
            exchange: exchangeResult.exchange,
            exchangeName: exchangeResult.exchangeName,
            key: `${exchangeResult.exchange}-${item.key || item.userId || Math.random()}`,
          }));
          allData.push(...dataWithExchange);
        }
      } else {
        const exchangeKey = exchangesToFetch[index];
        const exchangeConfig = EXCHANGE_CONFIGS[exchangeKey as keyof typeof EXCHANGE_CONFIGS];
        console.warn(`Promise rejected for ${exchangeConfig.id}:`, result.reason);
        exchangeResults.push({
          exchange: exchangeConfig.id,
          exchangeName: exchangeConfig.name,
          data: [],
          error: result.reason?.message || 'Promise rejected',
          fetched_at: new Date().toISOString(),
        });
      }
    });

    // Sort combined data by price (ascending for buy, descending for sell)
    allData.sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      
      // For BUY side: sort by price ascending (cheapest first)
      // For SELL side: sort by price descending (highest first)
      return side === 'buy' ? priceA - priceB : priceB - priceA;
    });

    return NextResponse.json({
      data: allData,
      exchanges: exchangeResults,
      summary: {
        total_exchanges_queried: exchangesToFetch.length,
        successful_exchanges: successCount,
        total_offers: allData.length,
        side,
        asset,
        fiat,
        fiat_amount: fiatAmount || null,
      },
      fetched_at: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('Error in /all route:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Unknown error',
        data: [],
        exchanges: [],
        summary: {
          total_exchanges_queried: 0,
          successful_exchanges: 0,
          total_offers: 0,
        }
      }, 
      { status: 500 }
    );
  }
}