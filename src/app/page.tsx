"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import numeral from "numeral";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { EXCHANGE_CONFIGS } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function TableTimeInfo({ fetchedAt }: { fetchedAt?: string }) {
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!fetchedAt) {
    return <span className="font-mono">Last updated: Unknown</span>;
  }
  const fetchedDate = new Date(fetchedAt);
  return (
    <div className="font-mono whitespace-pre">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <span>
          {"Last updated:".padEnd(14, " ")}
          {fetchedDate.toLocaleString()}
        </span>
        <span className="hidden sm:inline mx-1">|</span>
        <span>{formatDistanceToNow(fetchedDate, { addSuffix: true })}</span>
      </div>
      <div>
        {"Time now:".padEnd(14, " ")}
        {now.toLocaleString()}
      </div>
    </div>
  );
}

export default function Home() {
  // Currency configuration - can be moved to search params later
  const BASE_CURRENCY = "USDT"; // The crypto being traded
  const BUY_FIAT = "NGN"; // Fiat currency for buying
  const SELL_FIAT = "CNY"; // Fiat currency for selling

  // Minimum amount configuration
  const MIN_BUY_AMOUNT = "1MM"; // Minimum buy amount (will be suffixed with BUY_FIAT)
  const MIN_SELL_AMOUNT = "1000"; // Minimum sell amount (will be suffixed with BASE_CURRENCY)

  // Available exchange configurations - one config per exchange
  const BUY_EXCHANGE = EXCHANGE_CONFIGS.BYBIT;
  const SELL_EXCHANGE = EXCHANGE_CONFIGS.OKX;

  const {
    data: buyData,
    isLoading: loadingBuy,
    isValidating: validatingBuy,
    error: errorBuy,
  } = useSWR(BUY_EXCHANGE.api(BASE_CURRENCY, BUY_FIAT, "buy"), fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });
  const {
    data: sellData,
    isLoading: loadingSell,
    isValidating: validatingSell,
    error: errorSell,
  } = useSWR(SELL_EXCHANGE.api(BASE_CURRENCY, SELL_FIAT, "sell"), fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });

  const [selectedBuyRow, setSelectedBuyRow] = useState<any | null>(null);
  const [selectedSellRow, setSelectedSellRow] = useState<any | null>(null);
  const [buyRowCount, setBuyRowCount] = useState(5);
  const [sellRowCount, setSellRowCount] = useState(5);

  function formatNum(val: number | string) {
    const num = Number(val);
    if (isNaN(num)) return val;
    if (num === 0) return "0.00";
    return numeral(num).format("0,0.00");
  }

  function calcFiat(available: number | string, price: number | string) {
    const a = Number(available);
    const p = Number(price);
    if (isNaN(a) || isNaN(p)) return "-";
    return formatNum(a * p);
  }

  function getConversionRate(buyFiatPrice: number, sellFiatPrice: number) {
    if (!buyFiatPrice || !sellFiatPrice) return null;
    return buyFiatPrice / sellFiatPrice;
  }

  // Auto-select first row for Buy and Sell when data loads and nothing is selected
  useEffect(() => {
    if (buyData && buyData.data && buyData.data.length > 0 && !selectedBuyRow) {
      setSelectedBuyRow(buyData.data[0]);
    }
  }, [buyData, selectedBuyRow]);

  useEffect(() => {
    if (
      sellData &&
      sellData.data &&
      sellData.data.length > 0 &&
      !selectedSellRow
    ) {
      setSelectedSellRow(sellData.data[0]);
    }
  }, [sellData, selectedSellRow]);

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <div className="overflow-x-auto space-y-8">
        <div>
          <div className="flex items-center justify-between mb-2 gap-2">
            <h2 className="text-xl font-semibold flex items-center gap-2 m-0">
              Buy {BASE_CURRENCY} - {BUY_EXCHANGE.name} {BASE_CURRENCY}/
              {BUY_FIAT}
              <span className="text-sm font-normal">
                (Min {MIN_BUY_AMOUNT} {BUY_FIAT})
              </span>
              <Link
                href={BUY_EXCHANGE.url(BASE_CURRENCY, BUY_FIAT, "buy")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm font-normal"
              >
                Open {BUY_EXCHANGE.name}
              </Link>
            </h2>
          </div>
          {/* Info below title and controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
            <div className="text-sm text-muted-foreground">
              <TableTimeInfo fetchedAt={buyData?.fetched_at} />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="buyRowCount"
                className="text-sm font-medium self-center"
              >
                Rows:
              </label>
              <Select
                value={buyRowCount.toString()}
                onValueChange={(val) => setBuyRowCount(Number(val))}
              >
                <SelectTrigger id="buyRowCount">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                disabled={loadingBuy || validatingBuy}
                onClick={async () => {
                  await mutate(
                    BUY_EXCHANGE.api(BASE_CURRENCY, BUY_FIAT, "buy")
                  );
                }}
              >
                {loadingBuy || validatingBuy ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-96">Name</TableHead>
                <TableHead className="text-right w-36">Buy Price</TableHead>
                <TableHead className="text-right w-36">
                  Min ({BUY_FIAT})
                </TableHead>
                <TableHead className="text-right w-36">
                  Max ({BUY_FIAT})
                </TableHead>
                <TableHead className="text-right w-36">
                  Available ({BASE_CURRENCY})
                </TableHead>
                <TableHead className="text-right w-36">
                  Equivalent ({BUY_FIAT})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingBuy ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : errorBuy ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Error loading data
                  </TableCell>
                </TableRow>
              ) : !buyData || !buyData.data || buyData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                buyData.data
                  .slice(0, buyRowCount)
                  .sort((a: any, b: any) => b.price - a.price)
                  .reverse()
                  .map((row: any) => (
                    <TableRow
                      key={row.key}
                      className={`cursor-pointer hover:bg-gray-100 ${
                        selectedBuyRow?.key === row.key ? "bg-blue-100" : ""
                      }`}
                      onClick={() => setSelectedBuyRow(row)}
                    >
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNum(row.price)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNum(row.min)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNum(row.max)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNum(row.available)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {calcFiat(row.available, row.price)}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2 gap-2">
            <h2 className="text-xl font-semibold flex items-center gap-2 m-0">
              Sell {BASE_CURRENCY} - {SELL_EXCHANGE.name} {BASE_CURRENCY}/
              {SELL_FIAT}
              <span className="text-sm font-normal">
                (Min {MIN_SELL_AMOUNT} {BASE_CURRENCY})
              </span>
              <Link
                href={SELL_EXCHANGE.url(BASE_CURRENCY, SELL_FIAT, "sell")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm font-normal"
              >
                Open {SELL_EXCHANGE.name}
              </Link>
            </h2>
          </div>
          {/* Info below title and controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
            <div className="text-sm text-muted-foreground">
              <TableTimeInfo fetchedAt={sellData?.fetched_at} />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sellRowCount"
                className="text-sm font-medium self-center"
              >
                Rows:
              </label>
              <Select
                value={sellRowCount.toString()}
                onValueChange={(val) => setSellRowCount(Number(val))}
              >
                <SelectTrigger id="sellRowCount">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                disabled={loadingSell || validatingSell}
                onClick={async () => {
                  await mutate(
                    SELL_EXCHANGE.api(BASE_CURRENCY, SELL_FIAT, "sell")
                  );
                }}
              >
                {loadingSell || validatingSell ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-96">Name</TableHead>
                <TableHead className="text-right w-36">Sell Price</TableHead>
                <TableHead className="text-right w-36">
                  Min ({BASE_CURRENCY})
                </TableHead>
                <TableHead className="text-right w-36">
                  Max ({BASE_CURRENCY})
                </TableHead>
                <TableHead className="text-right w-36">
                  Available ({BASE_CURRENCY})
                </TableHead>
                <TableHead className="text-right w-36">
                  Equivalent ({SELL_FIAT})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingSell ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : errorSell ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Error loading data
                  </TableCell>
                </TableRow>
              ) : !sellData || !sellData.data || sellData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                sellData.data
                  .slice(0, sellRowCount)
                  .sort((a: any, b: any) => b.price - a.price)
                  .map((row: any) => (
                    <TableRow
                      key={row.key}
                      className={`cursor-pointer hover:bg-gray-100 ${
                        selectedSellRow?.key === row.key ? "bg-blue-100" : ""
                      }`}
                      onClick={() => setSelectedSellRow(row)}
                    >
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNum(row.price)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNum(row.min)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNum(row.max)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNum(row.available)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {calcFiat(row.available, row.price)}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* Third Table: NGN to CNY Rate */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {BUY_FIAT} → {SELL_FIAT} Conversion Rate (via {BASE_CURRENCY})
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Selected {BASE_CURRENCY}/{BUY_FIAT} Price
                </TableHead>
                <TableHead>
                  Selected {BASE_CURRENCY}/{SELL_FIAT} Price
                </TableHead>
                <TableHead>
                  1 {SELL_FIAT} ≈ ? {BUY_FIAT}
                </TableHead>
                <TableHead>
                  1,000,000 {BUY_FIAT} ≈ ? {SELL_FIAT}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">
                  {selectedBuyRow ? formatNum(selectedBuyRow.price) : "-"}
                </TableCell>
                <TableCell className="font-mono">
                  {selectedSellRow ? formatNum(selectedSellRow.price) : "-"}
                </TableCell>
                <TableCell className="font-mono">
                  {(() => {
                    const buyFiatPrice = selectedBuyRow?.price;
                    const sellFiatPrice = selectedSellRow?.price;
                    if (!buyFiatPrice || !sellFiatPrice) return "-";
                    const rate = getConversionRate(buyFiatPrice, sellFiatPrice);
                    return rate ? rate.toFixed(4) : "-";
                  })()}{" "}
                  {BUY_FIAT}
                </TableCell>
                <TableCell className="font-mono">
                  {(() => {
                    const buyFiatPrice = selectedBuyRow?.price;
                    const sellFiatPrice = selectedSellRow?.price;
                    if (!buyFiatPrice || !sellFiatPrice) return "-";
                    const convertedAmount =
                      (1_000_000 / buyFiatPrice) * sellFiatPrice;
                    return formatNum(convertedAmount);
                  })()}{" "}
                  {SELL_FIAT}
                </TableCell>
              </TableRow>
              {/* Selected available USDT row */}
              {selectedBuyRow && selectedSellRow && (
                <TableRow>
                  <TableCell className="font-mono font-semibold" colSpan={2}>
                    Max Available
                  </TableCell>
                  <TableCell className="font-mono" colSpan={2}>
                    {(() => {
                      const maxUsdt = Math.min(
                        selectedBuyRow.available,
                        selectedSellRow.available
                      );
                      const buyFiatAmount = maxUsdt * selectedBuyRow.price;
                      const sellFiatAmount = maxUsdt * selectedSellRow.price;
                      return `${formatNum(
                        maxUsdt
                      )} ${BASE_CURRENCY} = ${formatNum(
                        buyFiatAmount
                      )} ${BUY_FIAT} = ${formatNum(
                        sellFiatAmount
                      )} ${SELL_FIAT}`;
                    })()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="text-xs text-gray-500 mt-1">
            (Based on selected row prices or latest available from each table)
          </div>
        </div>
      </div>
    </main>
  );
}
