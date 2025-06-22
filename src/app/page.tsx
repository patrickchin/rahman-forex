"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import React, { useState } from "react";
import { TriggerCronButton } from "@/components/TriggerCronButton";
import numeral from "numeral";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const {
    data: ngn_usdt,
    isLoading: loadingBybit,
    error: errorBybit,
  } = useSWR("/api/getLatestBybit", fetcher);
  const {
    data: usdt_cny,
    isLoading: loadingGate,
    error: errorGate,
  } = useSWR("/api/getLatestGate", fetcher);

  const [selectedBybitRow, setSelectedBybitRow] = useState<any | null>(null);
  const [selectedGateRow, setSelectedGateRow] = useState<any | null>(null);

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

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <div className="overflow-x-auto space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            Bybit NGN/USDT <span className="text-sm font-normal">(Min 1MM NGN)</span>
            <Link
              href="https://www.bybit.com/en/fiat/trade/otc/buy/USDT/NGN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm font-normal"
            >
              Open Bybit
            </Link>
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-96">Name</TableHead>
                <TableHead className="text-right w-36">Price</TableHead>
                <TableHead className="text-right w-36">Min (NGN)</TableHead>
                <TableHead className="text-right w-36">Max (NGN)</TableHead>
                <TableHead className="text-right w-36">Available (USDT)</TableHead>
                <TableHead className="text-right w-36">Equivalent (NGN)</TableHead>
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
              ) : !ngn_usdt || ngn_usdt.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                ngn_usdt
                  .slice(0, 5)
                  .sort((a: any, b: any) => b.price - a.price)
                  .map((row: any) => (
                    <TableRow
                      key={row.key}
                      className={`cursor-pointer hover:bg-gray-100 ${selectedBybitRow?.key === row.key ? "bg-blue-100" : ""}`}
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
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            Gate USDT/CNY <span className="text-sm font-normal">(Min 1K USDT)</span>
            <Link
              href="https://www.gate.com/p2p/sell/USDT-CNY"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm font-normal"
            >
              Open Gate
            </Link>
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-96">Name</TableHead>
                <TableHead className="text-right w-36">Price</TableHead>
                <TableHead className="text-right w-36">Min (USDT)</TableHead>
                <TableHead className="text-right w-36">Max (USDT)</TableHead>
                <TableHead className="text-right w-36">Available (USDT)</TableHead>
                <TableHead className="text-right w-36">Equivalent (CNY)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingGate ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : errorGate ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    Error loading data
                  </TableCell>
                </TableRow>
              ) : !usdt_cny || usdt_cny.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4">
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                usdt_cny
                  .slice(0, 5)
                  .sort((a: any, b: any) => b.price - a.price)
                  .map((row: any) => (
                    <TableRow
                      key={row.key}
                      className={`cursor-pointer hover:bg-gray-100 ${selectedGateRow?.key === row.key ? "bg-blue-100" : ""}`}
                      onClick={() => setSelectedGateRow(row)}
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
          <h2 className="text-xl font-semibold mb-2">NGN → CNY Conversion Rate (via USDT)</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Selected USDT/NGN Price</TableHead>
                <TableHead>Selected USDT/CNY Price</TableHead>
                <TableHead>1 CNY ≈ ? NGN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">
                  {selectedBybitRow
                    ? formatNum(selectedBybitRow.price)
                    : ngn_usdt && ngn_usdt[0]?.price
                    ? formatNum(ngn_usdt[0].price)
                    : "-"}
                </TableCell>
                <TableCell className="font-mono">
                  {selectedGateRow
                    ? formatNum(selectedGateRow.price)
                    : usdt_cny && usdt_cny[0]?.price
                    ? formatNum(usdt_cny[0].price)
                    : "-"}
                </TableCell>
                <TableCell className="font-mono">
                  {(() => {
                    const ngnUsdtPrice = selectedBybitRow
                      ? selectedBybitRow.price
                      : ngn_usdt && ngn_usdt[0]?.price;
                    const usdtCnyPrice = selectedGateRow
                      ? selectedGateRow.price
                      : usdt_cny && usdt_cny[0]?.price;
                    if (!ngnUsdtPrice || !usdtCnyPrice) return "-";
                    const rate = getConversionRate(ngnUsdtPrice, usdtCnyPrice);
                    return rate ? rate.toFixed(4) : "-";
                  })()} NGN
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="text-xs text-gray-500 mt-1">
            (Based on selected rows' prices or latest available from each table)
          </div>
        </div>
      </div>
      <TriggerCronButton />
    </main>
  );
}
