import { NextResponse } from "next/server";

// OKX P2P API endpoint
const OKX_P2P_URL = "https://www.okx.com/v3/c2c/tradingOrders/books";

// Route: /api/p2p/search/okx/[side]/[asset]/[fiat]/route.ts
export async function GET(
  req: Request,
  context: { params: Promise<{ side?: string; asset?: string; fiat?: string }> }
) {
  try {
    // Await params for Next.js dynamic API routes
    const paramsObj = await context.params;
    const { searchParams } = new URL(req.url);
    const fiatAmount = searchParams.get("fiatAmount") || "";

    const side = paramsObj.side?.toUpperCase() || "SELL";
    const asset = paramsObj.asset?.toUpperCase() || "USDT";
    const fiat = paramsObj.fiat?.toUpperCase() || "CNY";
    // OKX: when user wants to BUY crypto, search for SELL ads (people selling), when user wants to SELL crypto, search for BUY ads (people buying)
    const okxSide = side === "BUY" ? "sell" : "buy";
    const params = new URLSearchParams({
      quoteCurrency: fiat,
      baseCurrency: asset,
      side: okxSide,
      paymentMethod: "all",
      userType: "all",
      receivingAds: "false",
      ...(fiatAmount && { quoteMinAmountPerOrder: fiatAmount }),
      t: Date.now().toString(), // timestamp to prevent caching issues
    });
    const response = await fetch(`${OKX_P2P_URL}?${params.toString()}`);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch OKX P2P data" },
        { status: 500 }
      );
    }
    const data = await response.json();
    const items = data?.data[okxSide] || [];
    // Map OKX ads to unified type
    const mappedItems = items.map((ad: any, idx: number) => {
      return {
        time: ad.id || "",
        userId: ad.publicUserId || ad.merchantId || "",
        name: ad.nickName || "",
        price: Number(ad.price),
        min: Number(ad.quoteMinAmountPerOrder),
        max: Number(ad.quoteMaxAmountPerOrder),
        available: Number(ad.availableAmount),
        currency: ad.baseCurrency || asset,
        payment: Array.isArray(ad.paymentMethods)
          ? ad.paymentMethods.join(", ")
          : "",
        side: ad.side ? ad.side.toUpperCase() : side,
        key: ad.id || ad.publicUserId || ad.merchantId || idx,
      };
    });

    // Sort by price (ascending for buy, descending for sell)
    mappedItems.sort((a: any, b: any) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      
      // For BUY side: sort by price ascending (cheapest first)
      // For SELL side: sort by price descending (highest first)
      return side === 'BUY' ? priceA - priceB : priceB - priceA;
    });

    return NextResponse.json({
      data: mappedItems,
      fetched_at: new Date().toISOString(),
      raw: data,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unknown error" },
      { status: 500 }
    );
  }
}

/* example response item structure
{
  "alreadyTraded": false,
  "availableAmount": "70000.00",
  "avgCompletedTime": 18,
  "avgPaymentTime": 99,
  "badgeInfo": {
    "badgeList": [
      {
        "badgeId": -1000,
        "designUrl": "https://static.coinall.ltd/cdn/assets/imgs/254/184EA5F3883D5E43.png",
        "designUrlDark": "https://static.coinall.ltd/cdn/assets/imgs/254/184EA5F3883D5E43.png",
        "hoverKey": "Diamond Merchant",
        "subtitle": "Top tier traders in the marketplace, upgraded from Super Merchants. Highly credible with large amounts of crypto to trade.",
        "title": "Diamond Merchant",
        "type": 1
      }
    ]
  },
  "baseCurrency": "usdt",
  "black": false,
  "cancelledOrderQuantity": 32,
  "completedOrderQuantity": 7903,
  "completedRate": "0.9959",
  "creatorType": "diamond",
  "guideUpgradeKyc": false,
  "id": "250629184535334",
  "intention": false,
  "isInstitution": 0,
  "maxCompletedOrderQuantity": 0,
  "maxUserCreatedDate": 0,
  "merchantId": "07fb7a9d41",
  "minCompletedOrderQuantity": 0,
  "minCompletionRate": "0.85",
  "minKycLevel": 1,
  "minSellOrderQuantity": 0,
  "minSellOrders": 0,
  "minTradeVolume": 0,
  "mine": false,
  "nickName": "小金总-晋冀鲁豫",
  "paymentMethods": [
    "bank"
  ],
  "paymentTimeoutMinutes": 30,
  "posReviewPercentage": "-1",
  "price": "7.15",
  "promoBadgeInfoVo": {
    "badgeList": []
  },
  "publicUserId": "997b4bed6b",
  "quoteCurrency": "cny",
  "quoteMaxAmountPerOrder": "500500.00",
  "quoteMinAmountPerOrder": "99999.00",
  "quoteScale": 2,
  "quoteSymbol": "¥",
  "receivingAds": true,
  "safetyLimit": false,
  "side": "sell",
  "userActiveStatusVo": null,
  "userType": "common",
  "verificationType": 0,
  "whitelistedCountries": [
    "ALL_COUNTRIES"
  ]
}

{
  "alreadyTraded": false,
  "availableAmount": "200000.00",
  "avgCompletedTime": 40,
  "avgPaymentTime": 295,
  "badgeInfo": {
    "badgeList": [
      {
        "badgeId": -1001,
        "designUrl": "https://static.coinall.ltd/cdn/assets/imgs/254/BF101DC2083F0CBC.png",
        "designUrlDark": "https://static.coinall.ltd/cdn/assets/imgs/254/BF101DC2083F0CBC.png",
        "hoverKey": "Super Merchant",
        "subtitle": "Experienced traders in the marketplace; recognized as our trusted Merchants.",
        "title": "Super Merchant",
        "type": 1
      }
    ]
  },
  "baseCurrency": "usdt",
  "black": false,
  "cancelledOrderQuantity": 4,
  "completedOrderQuantity": 456,
  "completedRate": "0.9913",
  "creatorType": "certified",
  "guideUpgradeKyc": false,
  "id": "250629185239511",
  "intention": false,
  "isInstitution": 0,
  "maxCompletedOrderQuantity": 0,
  "maxUserCreatedDate": 0,
  "merchantId": "de37f16ae5",
  "minCompletedOrderQuantity": 0,
  "minCompletionRate": "0.6",
  "minKycLevel": 1,
  "minSellOrderQuantity": 0,
  "minSellOrders": 0,
  "minTradeVolume": 0,
  "mine": false,
  "nickName": "富春江诚信商户",
  "paymentMethods": [
    "bank"
  ],
  "paymentTimeoutMinutes": 20,
  "posReviewPercentage": "-1",
  "price": "7.15",
  "promoBadgeInfoVo": {
    "badgeList": []
  },
  "publicUserId": "f9e101c5b8",
  "quoteCurrency": "cny",
  "quoteMaxAmountPerOrder": "1000000.00",
  "quoteMinAmountPerOrder": "99999.00",
  "quoteScale": 2,
  "quoteSymbol": "¥",
  "receivingAds": false,
  "safetyLimit": false,
  "side": "buy",
  "userActiveStatusVo": null,
  "userType": "common",
  "verificationType": 0,
  "whitelistedCountries": [
    "ALL_COUNTRIES"
  ]
}
    */
