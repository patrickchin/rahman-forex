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
import { useSearchParams, useRouter, usePathname } from "next/navigation";

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

interface Props {
  params: Promise<{
    buyFiat: string;
    asset: string;
    sellFiat: string;
  }>;
}

export default function TradingPage({ params }: Props) {
  // All hooks must be called before any conditional returns
  const [resolvedParams, setResolvedParams] = useState<{
    buyFiat: string;
    asset: string;
    sellFiat: string;
  } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedBuyRow, setSelectedBuyRow] = useState<any | null>(null);
  const [selectedSellRow, setSelectedSellRow] = useState<any | null>(null);
  const [buyRowCount, setBuyRowCount] = useState(5);
  const [sellRowCount, setSellRowCount] = useState(5);

  // Resolve params on component mount
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Get configuration from slug paths and search params (with fallbacks for loading state)
  const buyFiat = resolvedParams?.buyFiat.toUpperCase() || "NGN";
  const baseCurrency = resolvedParams?.asset.toUpperCase() || "USDT";
  const sellFiat = resolvedParams?.sellFiat.toUpperCase() || "CNY";
  const buyExchangeKey = searchParams.get("buyex") || "BYBIT";
  const sellExchangeKey = searchParams.get("sellex") || "BYBIT";

  // Minimum amount configuration from search params or defaults
  const minBuyAmount = searchParams.get("minbuy") || "0"; // Default 0
  const minSellAmount = searchParams.get("minsell") || "0"; // Default 0

  // Function to handle exchange changes
  const handleExchangeChange = (exchangeType: "buyex" | "sellex") => {
    return async (value: string) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set(exchangeType, value);
      router.push(`${pathname}?${newSearchParams.toString()}`);
    };
  };

  // Get exchange configurations from search params
  const buyExchange =
    EXCHANGE_CONFIGS[buyExchangeKey as keyof typeof EXCHANGE_CONFIGS] ||
    EXCHANGE_CONFIGS.BYBIT;
  const sellExchange =
    EXCHANGE_CONFIGS[sellExchangeKey as keyof typeof EXCHANGE_CONFIGS] ||
    EXCHANGE_CONFIGS.BYBIT;

  const {
    data: buyData,
    isLoading: loadingBuy,
    isValidating: validatingBuy,
    error: errorBuy,
  } = useSWR(
    resolvedParams
      ? `/api/p2p/search/buy/${baseCurrency.toLowerCase()}/${buyFiat.toLowerCase()}/${
          buyExchange.id
        }${minBuyAmount && `?fiatAmount=${minBuyAmount}`}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );
  const {
    data: sellData,
    isLoading: loadingSell,
    isValidating: validatingSell,
    error: errorSell,
  } = useSWR(
    resolvedParams
      ? `/api/p2p/search/sell/${baseCurrency.toLowerCase()}/${sellFiat.toLowerCase()}/${
          sellExchange.id
        }${minSellAmount && `?fiatAmount=${minSellAmount}`}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

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

  // Show loading state while params are being resolved
  if (!resolvedParams) {
    return <div className="p-4">Loading...</div>;
  }

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

  function formatConversionRate() {
    const buyFiatPrice = selectedBuyRow?.price;
    const sellFiatPrice = selectedSellRow?.price;
    if (!buyFiatPrice || !sellFiatPrice) return "-";
    const rate = getConversionRate(buyFiatPrice, sellFiatPrice);
    return rate ? rate.toFixed(4) : "-";
  }

  function formatLargeConversion() {
    const buyFiatPrice = selectedBuyRow?.price;
    const sellFiatPrice = selectedSellRow?.price;
    if (!buyFiatPrice || !sellFiatPrice) return "-";
    const convertedAmount = (1_000_000 / buyFiatPrice) * sellFiatPrice;
    return formatNum(convertedAmount);
  }

  function formatMaxAvailable() {
    if (!selectedBuyRow || !selectedSellRow) return "";
    const maxAsset = Math.min(
      selectedBuyRow.available,
      selectedSellRow.available
    );
    const buyFiatAmount = maxAsset * selectedBuyRow.price;
    const sellFiatAmount = maxAsset * selectedSellRow.price;
    return `${formatNum(maxAsset)} ${baseCurrency} = ${formatNum(
      buyFiatAmount
    )} ${buyFiat} = ${formatNum(sellFiatAmount)} ${sellFiat}`;
  }

  return (
    <main className="p-4 max-w-6xl mx-auto space-y-12">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Home
        </Link>
        <Button
          size="sm"
          variant="outline"
          disabled={
            loadingBuy || validatingBuy || loadingSell || validatingSell
          }
          onClick={async () => {
            const buyUrl = `/api/p2p/search/buy/${baseCurrency.toLowerCase()}/${buyFiat.toLowerCase()}/${
              buyExchange.id
            }${minBuyAmount !== "0" ? `?fiatAmount=${minBuyAmount}` : ""}`;
            const sellUrl = `/api/p2p/search/sell/${baseCurrency.toLowerCase()}/${sellFiat.toLowerCase()}/${
              sellExchange.id
            }${minSellAmount !== "0" ? `?fiatAmount=${minSellAmount}` : ""}`;
            await Promise.all([mutate(buyUrl), mutate(sellUrl)]);
          }}
        >
          {loadingBuy || validatingBuy || loadingSell || validatingSell
            ? "Refreshing..."
            : "Refresh"}
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 m-0">
              Buy {baseCurrency} - {buyExchange.name} {baseCurrency}/{buyFiat}
            </h2>
            <div className="flex items-center gap-2">
              <Select
                value={buyExchangeKey}
                onValueChange={handleExchangeChange("buyex")}
              >
                <SelectTrigger id="buyExchange" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXCHANGE_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>{" "}
            <span className="text-sm font-normal">
              (Min {numeral(minBuyAmount).format("0,0")} {buyFiat})
            </span>
            <Link
              href={buyExchange.url(baseCurrency, buyFiat, "buy")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm font-normal"
            >
              Open {buyExchange.name}
            </Link>
          </div>
        </div>
        {/* Info below title and controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
          <div className="text-sm text-muted-foreground">
            <TableTimeInfo fetchedAt={buyData?.fetched_at} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium self-center">Rows:</label>
            <div className="flex gap-1">
              {[1, 3, 5, 10, 20].map((count) => (
                <Button
                  key={count}
                  variant={buyRowCount === count ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setBuyRowCount(count)}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Exchange</TableHead>
              <TableHead className="w-96">Name</TableHead>
              <TableHead className="text-right w-36">Buy Price</TableHead>
              <TableHead className="text-right w-36">Min ({buyFiat})</TableHead>
              <TableHead className="text-right w-36">Max ({buyFiat})</TableHead>
              <TableHead className="text-right w-36">
                Available ({baseCurrency})
              </TableHead>
              <TableHead className="text-right w-36">
                Equivalent ({buyFiat})
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingBuy ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : errorBuy ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-4">
                  Error loading data
                </TableCell>
              </TableRow>
            ) : !buyData || !buyData.data || buyData.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-4">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              buyData.data
                .slice(0, buyRowCount)
                .sort((a: any, b: any) => a.price - b.price)
                .map((row: any) => (
                  <TableRow
                    key={row.key}
                    className={`cursor-pointer hover:bg-gray-100 ${
                      selectedBuyRow?.key === row.key ? "bg-blue-100" : ""
                    }`}
                    onClick={() => setSelectedBuyRow(row)}
                  >
                    <TableCell className="text-xs">
                      {(row.exchange || buyExchange.name).toUpperCase()}
                    </TableCell>
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
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 m-0">
              Sell {baseCurrency} - {sellExchange.name} {baseCurrency}/
              {sellFiat}
            </h2>
            <div className="flex items-center gap-2">
              <Select
                value={sellExchangeKey}
                onValueChange={handleExchangeChange("sellex")}
              >
                <SelectTrigger id="sellExchange" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXCHANGE_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm font-normal">
              (Min {numeral(minSellAmount).format("0,0")} {sellFiat})
            </span>
            <Link
              href={sellExchange.url(baseCurrency, sellFiat, "sell")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm font-normal"
            >
              Open {sellExchange.name}
            </Link>
          </div>
        </div>
        {/* Info below title and controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
          <div className="text-sm text-muted-foreground">
            <TableTimeInfo fetchedAt={sellData?.fetched_at} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium self-center">Rows:</label>
            <div className="flex gap-1">
              {[1, 3, 5, 10, 20].map((count) => (
                <Button
                  key={count}
                  variant={sellRowCount === count ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSellRowCount(count)}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Exchange</TableHead>
              <TableHead className="w-96">Name</TableHead>
              <TableHead className="text-right w-36">Sell Price</TableHead>
              <TableHead className="text-right w-36">
                Min ({baseCurrency})
              </TableHead>
              <TableHead className="text-right w-36">
                Max ({baseCurrency})
              </TableHead>
              <TableHead className="text-right w-36">
                Available ({baseCurrency})
              </TableHead>
              <TableHead className="text-right w-36">
                Equivalent ({sellFiat})
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingSell ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : errorSell ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-4">
                  Error loading data
                </TableCell>
              </TableRow>
            ) : !sellData || !sellData.data || sellData.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-4">
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
                    <TableCell className="text-xs">
                      {(row.exchange || sellExchange.name).toUpperCase()}
                    </TableCell>
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
        <h2 className="text-xl font-semibold mb-2">
          {buyFiat} → {sellFiat} Conversion Rate (via {baseCurrency})
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Selected {baseCurrency}/{buyFiat} Price
              </TableHead>
              <TableHead>
                Selected {baseCurrency}/{sellFiat} Price
              </TableHead>
              <TableHead>
                1 {sellFiat} ≈ ? {buyFiat}
              </TableHead>
              <TableHead>
                1,000,000 {buyFiat} ≈ ? {sellFiat}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono">
                {(selectedBuyRow && formatNum(selectedBuyRow.price)) || "-"}
              </TableCell>
              <TableCell className="font-mono">
                {(selectedSellRow && formatNum(selectedSellRow.price)) || "-"}
              </TableCell>
              <TableCell className="font-mono">
                {formatConversionRate()} {buyFiat}
              </TableCell>
              <TableCell className="font-mono">
                {formatLargeConversion()} {sellFiat}
              </TableCell>
            </TableRow>
            {/* Selected available asset row */}
            {selectedBuyRow && selectedSellRow && (
              <TableRow>
                <TableCell className="font-mono font-semibold" colSpan={2}>
                  Max Available
                </TableCell>
                <TableCell className="font-mono" colSpan={2}>
                  {formatMaxAvailable()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="text-xs text-gray-500 mt-1">
          (Based on selected row prices or latest available from each table)
        </div>
      </div>
    </main>
  );
}
