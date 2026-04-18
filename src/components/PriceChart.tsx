"use client";

import React from "react";
import numeral from "numeral";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PERIODS = ["24h", "7d", "30d"] as const;
type Period = (typeof PERIODS)[number];

const EXCHANGE_COLORS: Record<string, string> = {
  bybit: "#f7a600",
  binance: "#f0b90b",
  okx: "#121212",
  gate: "#2354e6",
  htx: "#1a73e8",
  kucoin: "#23af5f",
  bitget: "#00d09c",
};

interface PriceChartProps {
  readonly asset: string;
  readonly fiat: string;
  readonly side: "BUY" | "SELL";
  readonly label: string;
}

interface SnapshotRow {
  readonly recorded_at: string;
  readonly exchange: string;
  readonly best_price: string;
  readonly avg_price: string | null;
  readonly offer_count: number | null;
  readonly total_volume: string | null;
}

export function PriceChart({ asset, fiat, side, label }: PriceChartProps) {
  const [period, setPeriod] = React.useState<Period>("24h");

  const { data, isLoading, error } = useSWR(
    `/api/p2p/history/${asset.toLowerCase()}/${fiat.toLowerCase()}?side=${side}&period=${period}`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 5 * 60 * 1000 },
  );

  const rows: SnapshotRow[] = data?.data ?? [];

  // Group by exchange, build time-series per exchange
  const exchangeMap = new Map<string, { time: number; price: number }[]>();
  for (const row of rows) {
    const arr = exchangeMap.get(row.exchange) ?? [];
    arr.push({
      time: new Date(row.recorded_at).getTime(),
      price: Number(row.best_price),
    });
    exchangeMap.set(row.exchange, arr);
  }

  // Merge into unified time-series keyed by timestamp
  const timeMap = new Map<number, Record<string, number>>();
  for (const [exchange, points] of exchangeMap) {
    for (const pt of points) {
      const entry = timeMap.get(pt.time) ?? {};
      entry[exchange] = pt.price;
      timeMap.set(pt.time, entry);
    }
  }

  const chartData = Array.from(timeMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([time, prices]) => ({ time, ...prices }));

  const exchanges = Array.from(exchangeMap.keys()).sort();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return period === "24h"
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (rows.length === 0 && !isLoading) {
    return (
      <div className="border rounded p-4 text-center text-sm text-muted-foreground">
        No historical data yet for {label}. Data will appear after the first cron run.
      </div>
    );
  }

  return (
    <div className="border rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{label} — Best Price Over Time</h3>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "secondary" : "outline"}
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Loading chart...
        </div>
      ) : error ? (
        <div className="h-48 flex items-center justify-center text-red-500 text-sm">
          Failed to load history
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
              fontSize={10}
              tick={{ fill: "var(--color-muted-foreground, #888)" }}
              type="number"
              domain={["dataMin", "dataMax"]}
              scale="time"
            />
            <YAxis
              fontSize={10}
              tickFormatter={(v: number) => numeral(v).format("0,0.00")}
              tick={{
                fill: "var(--color-foreground, #333)",
                fontFamily: "monospace",
              }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              labelFormatter={(ts) => new Date(ts as number).toLocaleString()}
              formatter={(value, name) => [
                numeral(Number(value)).format("0,0.00"),
                String(name).toUpperCase(),
              ]}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend />
            {exchanges.map((ex) => (
              <Line
                key={ex}
                dataKey={ex}
                name={ex.toUpperCase()}
                stroke={EXCHANGE_COLORS[ex] ?? "#888"}
                dot={false}
                strokeWidth={1.5}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
