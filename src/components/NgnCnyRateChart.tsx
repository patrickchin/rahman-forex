"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "./ui/card";
import { ChartContainer, ChartTooltipContent } from "./ui/chart";

export default function NgnCnyRateChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/cron/get-ngn-cny-rates")
      .then((res) => res.json())
      .then((d) => setData(d));
  }, []);

  return (
    <Card className="py-4 sm:py-0 max-w-2xl mx-auto my-8">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>NGN/CNY Rate - Interactive</CardTitle>
          <CardDescription>
            Showing NGN/CNY rate for the last 24 hours
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={{
            yLabel: { label: "Rate" },
            xLabel: { label: "Time" },
            // Add other ChartConfig properties as required by your ChartContainer
          }}
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    nameKey="rate"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                }
              />
              <Line
                dataKey="rate"
                type="monotone"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
