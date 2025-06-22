"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import React from "react";
import { TriggerCronButton } from "@/components/TriggerCronButton";
import numeral from "numeral";
import useSWR from "swr";

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

  function formatNum(val: any) {
    const num = Number(val);
    if (isNaN(num)) return val;
    if (num === 0) return "0.00";
    return numeral(num).format("0,0.00");
  }

  function calcFiat(available: any, price: any) {
    const a = Number(available);
    const p = Number(price);
    if (isNaN(a) || isNaN(p)) return "-";
    return formatNum(a * p);
  }

  return (
    <main className="p-4 max-w-6xl">
      <div className="overflow-x-auto space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Bybit NGN/USDT</h2>
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
                    <TableRow key={row.key}>
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
          <h2 className="text-xl font-semibold mb-2">Gate USDT/CNY</h2>
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
                    <TableRow key={row.key}>
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
      </div>
      <TriggerCronButton />
    </main>
  );
}
