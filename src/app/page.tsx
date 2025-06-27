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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const {
    data: ngn_usdt,
    isLoading: loadingBybit,
    error: errorBybit,
  } = useSWR("/api/getLatestBybit", fetcher);
  const {
    data: binance_cny,
    isLoading: loadingBinance,
    error: errorBinance,
  } = useSWR("/api/getLatestBinance", fetcher);

  const [selectedBybitRow, setSelectedBybitRow] = useState<any | null>(null);
  const [selectedBinanceRow, setSelectedBinanceRow] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [rowCount, setRowCount] = useState(5);
  const [refreshStatus, setRefreshStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [refreshError, setRefreshError] = useState<string>("");

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

  function getConversionRate(ngnUsdtPrice: number, usdtCnyPrice: number) {
    if (!ngnUsdtPrice || !usdtCnyPrice) return null;
    return ngnUsdtPrice / usdtCnyPrice;
  }

  // Auto-select first row for Bybit and Binance when data loads and nothing is selected
  useEffect(() => {
    if (
      ngn_usdt &&
      ngn_usdt.data &&
      ngn_usdt.data.length > 0 &&
      !selectedBybitRow
    ) {
      setSelectedBybitRow(ngn_usdt.data[0]);
    }
  }, [ngn_usdt, selectedBybitRow]);

  useEffect(() => {
    if (
      binance_cny &&
      binance_cny.data &&
      binance_cny.data.length > 0 &&
      !selectedBinanceRow
    ) {
      setSelectedBinanceRow(binance_cny.data[0]);
    }
  }, [binance_cny, selectedBinanceRow]);

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <div className="overflow-x-auto space-y-8">
        <div>
          <div className="flex items-center justify-between mb-2 gap-2">
            <h2 className="text-xl font-semibold flex items-center gap-2 m-0">
              Buy USDT - Bybit USDT/NGN
              <span className="text-sm font-normal">(Min 1MM NGN)</span>
              <Link
                href="https://www.bybit.com/en/fiat/trade/otc/buy/USDT/NGN"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm font-normal"
              >
                Open Bybit
              </Link>
            </h2>
            <div className="flex items-center gap-2">
              <label
                htmlFor="rowCount"
                className="text-sm font-medium self-center"
              >
                Rows:
              </label>
              <Select
                value={rowCount.toString()}
                onValueChange={(val) => setRowCount(Number(val))}
              >
                <SelectTrigger id="rowCount">
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
            </div>
          </div>
          {/* Info below title */}
          <div className="text-sm text-muted-foreground mb-2">
            {ngn_usdt && ngn_usdt.fetched_at ? (
              <div className="font-mono whitespace-pre">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span>
                    {"Last updated:".padEnd(13, " ")}{new Date(ngn_usdt.fetched_at).toLocaleString()}
                  </span>
                  <span className="hidden sm:inline mx-1">|</span>
                  <span>
                    {formatDistanceToNow(new Date(ngn_usdt.fetched_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div>{"Time now:".padEnd(13, " ")}{new Date().toLocaleString()}</div>
              </div>
            ) : (
              <span className="font-mono">Last updated: Unknown</span>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-96">Name</TableHead>
                <TableHead className="text-right w-36">Buy Price</TableHead>
                <TableHead className="text-right w-36">Min (NGN)</TableHead>
                <TableHead className="text-right w-36">Max (NGN)</TableHead>
                <TableHead className="text-right w-36">
                  Available (USDT)
                </TableHead>
                <TableHead className="text-right w-36">
                  Equivalent (NGN)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingBybit ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : errorBybit ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Error loading data
                  </TableCell>
                </TableRow>
              ) : !ngn_usdt || !ngn_usdt.data || ngn_usdt.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                ngn_usdt.data
                  .slice(0, rowCount)
                  .sort((a: any, b: any) => b.price - a.price)
                  .reverse()
                  .map((row: any) => (
                    <TableRow
                      key={row.key}
                      className={`cursor-pointer hover:bg-gray-100 ${
                        selectedBybitRow?.key === row.key ? "bg-blue-100" : ""
                      }`}
                      onClick={() => setSelectedBybitRow(row)}
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
              Sell USDT - Binance USDT/CNY
              <span className="text-sm font-normal">(Min 1K USDT)</span>
              <Link
                href="https://p2p.binance.com/en/trade/sell/USDT/CNY"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm font-normal"
              >
                Open Binance
              </Link>
            </h2>
            <div className="flex items-center gap-2">
              <label
                htmlFor="rowCount"
                className="text-sm font-medium self-center"
              >
                Rows:
              </label>
              <Select
                value={rowCount.toString()}
                onValueChange={(val) => setRowCount(Number(val))}
              >
                <SelectTrigger id="rowCount">
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
            </div>
          </div>
          {/* Info below title */}
          <div className="text-sm text-muted-foreground mb-2">
            {binance_cny && binance_cny.fetched_at ? (
              <div className="font-mono whitespace-pre">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span>
                    {"Last updated:".padEnd(13, " ")}{new Date(binance_cny.fetched_at).toLocaleString()}
                  </span>
                  <span className="hidden sm:inline mx-1">|</span>
                  <span>
                    {formatDistanceToNow(new Date(binance_cny.fetched_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div>{"Time now:".padEnd(13, " ")}{new Date().toLocaleString()}</div>
              </div>
            ) : (
              <span className="font-mono">Last updated: Unknown</span>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-96">Name</TableHead>
                <TableHead className="text-right w-36">Sell Price</TableHead>
                <TableHead className="text-right w-36">Min (USDT)</TableHead>
                <TableHead className="text-right w-36">Max (USDT)</TableHead>
                <TableHead className="text-right w-36">
                  Available (USDT)
                </TableHead>
                <TableHead className="text-right w-36">
                  Equivalent (CNY)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingBinance ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : errorBinance ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Error loading data
                  </TableCell>
                </TableRow>
              ) : !binance_cny || !binance_cny.data || binance_cny.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                binance_cny.data
                  .slice(0, rowCount)
                  .sort((a: any, b: any) => b.price - a.price)
                  .map((row: any) => (
                    <TableRow
                      key={row.key}
                      className={`cursor-pointer hover:bg-gray-100 ${
                        selectedBinanceRow?.key === row.key ? "bg-blue-100" : ""
                      }`}
                      onClick={() => setSelectedBinanceRow(row)}
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
            NGN → CNY Conversion Rate (via USDT)
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Selected USDT/NGN Price</TableHead>
                <TableHead>Selected USDT/CNY Price</TableHead>
                <TableHead>1 CNY ≈ ? NGN</TableHead>
                <TableHead>1,000,000 NGN ≈ ? CNY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">
                  {selectedBybitRow ? formatNum(selectedBybitRow.price) : "-"}
                </TableCell>
                <TableCell className="font-mono">
                  {selectedBinanceRow ? formatNum(selectedBinanceRow.price) : "-"}
                </TableCell>
                <TableCell className="font-mono">
                  {(() => {
                    const ngnUsdtPrice = selectedBybitRow?.price;
                    const usdtCnyPrice = selectedBinanceRow?.price;
                    if (!ngnUsdtPrice || !usdtCnyPrice) return "-";
                    const rate = getConversionRate(ngnUsdtPrice, usdtCnyPrice);
                    return rate ? rate.toFixed(4) : "-";
                  })()} NGN
                </TableCell>
                <TableCell className="font-mono">
                  {(() => {
                    const ngnUsdtPrice = selectedBybitRow?.price;
                    const usdtCnyPrice = selectedBinanceRow?.price;
                    if (!ngnUsdtPrice || !usdtCnyPrice) return "-";
                    const cny = (1_000_000 / ngnUsdtPrice) * usdtCnyPrice;
                    return formatNum(cny);
                  })()} CNY
                </TableCell>
              </TableRow>
              {/* Selected available USDT row */}
              {selectedBybitRow && selectedBinanceRow && (
                <TableRow>
                  <TableCell className="font-mono font-semibold" colSpan={2}>
                    Max Available
                  </TableCell>
                  <TableCell className="font-mono" colSpan={2}>
                    {(() => {
                      const usdt = Math.min(
                        selectedBybitRow.available,
                        selectedBinanceRow.available
                      );
                      const ngn = usdt * selectedBybitRow.price;
                      const cny = usdt * selectedBinanceRow.price;
                      return `${formatNum(usdt)} USDT = ${formatNum(
                        ngn
                      )} NGN = ${formatNum(cny)} CNY`;
                    })()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className='text-xs text-gray-500 mt-1'>
            (Based on selected row prices or latest available from each table)
          </div>
        </div>
      </div>
      <div className="flex pt-8 items-center gap-2 font-mono text-sm">
        <Button
          onClick={async () => {
            setRefreshing(true);
            setRefreshStatus("idle");
            setRefreshError("");
            try {
              const res = await fetch("/api/refresh-data");
              const data = await res.json();
              if (res.ok && data.success) {
                setRefreshStatus("success");
                await Promise.all([
                  mutate("/api/getLatestBybit"),
                  mutate("/api/getLatestBinance"),
                ]);
              } else {
                setRefreshStatus("error");
                setRefreshError(data.error || "Unknown error");
              }
            } catch (e: any) {
              setRefreshStatus("error");
              setRefreshError(e?.message || "Unknown error");
            } finally {
              setRefreshing(false);
              setTimeout(() => setRefreshStatus("idle"), 4000);
            }
          }}
          variant={"outline"}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
        {refreshStatus === "success" && (
          <div className="text-green-600">Refresh successful!</div>
        )}
        {refreshStatus === "error" && (
          <div className="text-red-600">Refresh failed: {refreshError}</div>
        )}
      </div>
    </main>
  );
}
