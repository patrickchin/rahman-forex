"use client";

import React, { useState } from "react";
import numeral from "numeral";
import { bin, thresholdSturges, extent, min as d3Min, max as d3Max } from "d3-array";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Offer {
  readonly price: number;
  readonly available: number;
  readonly key: string;
}

interface PriceHistogramProps {
  readonly data: readonly Offer[];
  readonly fiatLabel: string;
  readonly side: "buy" | "sell";
}

const BIN_OPTIONS = [5, 10, 15, 20] as const;

function removeOutliers(offers: readonly Offer[], side: "buy" | "sell"): readonly Offer[] {
  const sorted = offers.map((o) => o.price).sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  if (side === "buy") {
    // Keep low prices, remove high outliers
    return offers.filter((o) => o.price <= q3 + 1.5 * iqr);
  }
  // Sell: keep high prices, remove low outliers
  return offers.filter((o) => o.price >= q1 - 1.5 * iqr);
}

export function PriceHistogram({ data, fiatLabel, side }: PriceHistogramProps) {
  const [binTarget, setBinTarget] = useState<number>(10);

  if (!data || data.length === 0) return null;

  const filtered = removeOutliers(data, side);
  if (filtered.length === 0) return null;

  // Compute fixed price extent (independent of bin count)
  const prices = filtered.map((o) => o.price);
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);

  // d3 bin generator with nice thresholds
  const histogram = bin<Offer, number>()
    .value((d) => d.price)
    .domain([priceMin, priceMax])
    .thresholds(binTarget);

  const buckets = histogram(filtered as Offer[]);

  const chartData = buckets.map((b) => {
    const low = b.x0 ?? 0;
    const high = b.x1 ?? 0;
    const total = b.reduce((sum, offer) => sum + offer.available * offer.price, 0);
    return {
      bin: `${numeral(low).format("0,0.00")} – ${numeral(high).format("0,0.00")}`,
      midPrice: (low + high) / 2,
      amount: Math.round(total),
    };
  });

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-muted-foreground font-medium">
          Amount distribution by price ({fiatLabel})
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Bins:</span>
          {BIN_OPTIONS.map((count) => (
            <button
              key={count}
              className={`px-2 py-0.5 text-xs rounded border ${
                binTarget === count
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-background text-foreground border-input hover:bg-accent"
              }`}
              onClick={() => setBinTarget(count)}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: 600, maxWidth: "100%" }}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, bottom: 20, left: 8 }}
          barCategoryGap={0}
          barGap={0}
        >
          <XAxis
            type="category"
            dataKey="midPrice"
            tickFormatter={(v: number) => numeral(v).format("0,0.00")}
            fontSize={11}
            tick={{ fill: "var(--color-foreground, #333)", fontFamily: "monospace" }}
            label={{ value: `Price (${fiatLabel})`, position: "insideBottom", offset: -10, fontSize: 11, fill: "#888" }}
            interval={0}
          />
          <YAxis
            type="number"
            tickFormatter={(v: number) => numeral(v).format("0,0")}
            fontSize={11}
            tick={{ fill: "var(--color-muted-foreground, #888)" }}
            width={70}
          />
          <Tooltip
            formatter={(value) => [numeral(Number(value)).format("0,0"), fiatLabel]}
            labelFormatter={(_label, payload) => {
              const item = payload?.[0]?.payload;
              return item?.bin ? `Range: ${item.bin}` : "";
            }}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={`hsl(217, 70%, ${55 + (i % 3) * 8}%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
