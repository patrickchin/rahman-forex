import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <div>
            <Link
              href="/ngn/usdt/cny?buyex=BYBIT&sellex=OKX&minbuy=1500000&minsell=7000"
              className="text-blue-600 hover:underline text-lg"
            >
              NGN → USDT → CNY (Bybit to OKX)
            </Link>
          </div>
          <div>
            <Link
              href="/kes/usdt/cny?buyex=BYBIT&sellex=OKX&minbuy=130000&minsell=7000"
              className="text-blue-600 hover:underline text-lg"
            >
              KES → USDT → CNY (Bybit to OKX)
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-8">
          URL format:
          /[buyFiat]/[asset]/[sellFiat]?buyex=X&sellex=Y&minbuy=N&minsell=N
        </p>
      </div>
    </div>
  );
}
