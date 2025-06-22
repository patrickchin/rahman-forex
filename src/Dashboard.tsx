"use client";

import useSWR from "swr";
import React from "react";
import numbro from "numbro";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../src/components/ui/table";
import bybitAdapter from "lib/exchanges/bybitAdapter";
import gateAdapter from "lib/exchanges/gateAdapter";

function useBybitNgnToUsdtOrders() {
  return useSWR(
    ["bybit-ngn-usdt-orders"],
    async () => {
      try {
        // Bybit expects asset as USDT, fiat as NGN
        const orders = await bybitAdapter.fetchP2POrders("USDT", "NGN", "BUY");
        return orders.slice(0, 10);
      } catch (e) {
        console.error("[DEBUG] Bybit error", e);
        return [];
      }
    },
    { revalidateOnFocus: false }
  );
}

function OrdersTable({
  title,
  orders,
  isLoading,
  amountUnit,
  link,
}: {
  title: string;
  orders: any[];
  isLoading: boolean;
  amountUnit: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h3 className="font-semibold mb-4 text-gray-700 text-lg flex items-center gap-2">
        {title}
        {link && (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm font-normal ml-2"
          >
            {link.label}
          </a>
        )}
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Amount ({amountUnit})</TableHead>
            <TableHead>Min</TableHead>
            <TableHead>Max</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading || !orders ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400">
                Loading or no orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.merchantName}</TableCell>
                <TableCell>{formatNumber(order.price)}</TableCell>
                <TableCell>{formatNumber(order.availableAmount)}</TableCell>
                <TableCell>{formatNumber(order.minAmount)}</TableCell>
                <TableCell>{formatNumber(order.maxAmount)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function BybitNgnToUsdtTable() {
  const { data: bybitOrders, isLoading: isBybitLoading } =
    useBybitNgnToUsdtOrders();
  const { data: gateOrders, isLoading: isGateLoading } =
    useGateUsdtToCnyOrders();

  // Calculate best cross rate if both have at least one order
  let bestRate = null;
  let ngnToUsdt = null;
  let usdtToCny = null;
  if (
    bybitOrders &&
    bybitOrders.length > 0 &&
    gateOrders &&
    gateOrders.length > 0
  ) {
    ngnToUsdt = bybitOrders[0].price; // NGN per USDT
    usdtToCny = gateOrders[0].price; // CNY per USDT
    if (ngnToUsdt > 0) {
      bestRate = usdtToCny / ngnToUsdt; // CNY per NGN
    }
  }

  return (
    <>
      <BestNgnToCnyRateTable
        bestRate={bestRate}
        ngnToUsdt={ngnToUsdt}
        usdtToCny={usdtToCny}
      />
      <OrdersTable
        title="Top 10 Bybit P2P Orders: NGN → USDT"
        orders={bybitOrders || []}
        isLoading={isBybitLoading}
        amountUnit="USDT"
        link={{ href: "https://www.bybit.com/en/fiat/trade/otc/buy/USDT/NGN", label: "Bybit P2P" }}
      />
      <OrdersTable
        title="Top 10 Gate P2P Orders: USDT → CNY"
        orders={gateOrders || []}
        isLoading={isGateLoading}
        amountUnit="USDT"
        link={{ href: "https://www.gate.com/p2p/buy/USDT-CNY", label: "Gate P2P" }}
      />
    </>
  );
}

function BestNgnToCnyRateTable({
  bestRate,
  ngnToUsdt,
  usdtToCny,
}: {
  bestRate: number | null;
  ngnToUsdt: number | null;
  usdtToCny: number | null;
}) {
  const reciprocal = bestRate && bestRate > 0 ? 1 / bestRate : null;

  // Calculate the max amount able to be exchanged at this rate (limited by available USDT in both top orders)
  // This is the minimum of the availableAmount from Bybit and Gate top orders
  const { data: bybitOrders } = useBybitNgnToUsdtOrders();
  const { data: gateOrders } = useGateUsdtToCnyOrders();
  let maxUsdt = null;
  if (
    bybitOrders &&
    bybitOrders.length > 0 &&
    gateOrders &&
    gateOrders.length > 0
  ) {
    maxUsdt = Math.min(
      bybitOrders[0].availableAmount,
      gateOrders[0].availableAmount
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h3 className="font-semibold mb-4 text-gray-700 text-lg">
        Best NGN → CNY Cross Rate
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NGN→USDT (Bybit)</TableHead>
            <TableHead>USDT→CNY (Gate)</TableHead>
            <TableHead>Rate (CNY/NGN)</TableHead>
            <TableHead>Rate (NGN/CNY)</TableHead>
            <TableHead>Max USDT at This Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{ngnToUsdt ? ngnToUsdt.toFixed(2) : "N/A"}</TableCell>
            <TableCell>{usdtToCny ? usdtToCny.toFixed(2) : "N/A"}</TableCell>
            <TableCell>{bestRate ? bestRate.toFixed(6) : "N/A"}</TableCell>
            <TableCell>{reciprocal ? reciprocal.toFixed(6) : "N/A"}</TableCell>
            <TableCell>
              {maxUsdt !== null ? maxUsdt.toFixed(2) : "N/A"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function useGateUsdtToCnyOrders() {
  return useSWR(
    ["gate-usdt-cny-orders"],
    async () => {
      try {
        const orders = await gateAdapter.fetchP2POrders("USDT", "CNY", "SELL");
        return orders.slice(0, 10);
      } catch (e) {
        console.error("[DEBUG] Gate error", e);
        return [];
      }
    },
    { revalidateOnFocus: false }
  );
}

function formatNumber(
  num: number | null | undefined,
  format: string = "0.[000]a"
) {
  if (num === null || num === undefined || isNaN(num)) return "N/A";
  // Use numbro to format with 3 significant figures, no trailing zeros, and thousands separator
  return numbro(num).format({
    mantissa: 3,
    trimMantissa: true,
    optionalMantissa: true,
    thousandSeparated: true,
  });
}
