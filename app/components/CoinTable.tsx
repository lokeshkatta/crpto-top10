import type { Coin } from "../api/coins/route";
import { formatCurrencyUsd } from "./format";

type Props = {
  coins: Coin[];
  isLoading: boolean;
};

export function CoinTable({ coins, isLoading }: Props) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_70px_70px_70px_70px] gap-x-4 gap-y-0 border-b border-zinc-200 bg-zinc-100/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          <span>Coin</span>
          <span className="text-right tabular-nums">Price</span>
          <span className="text-right tabular-nums">Market Cap</span>
          <span className="text-right tabular-nums">24h Vol</span>
          <span className="text-right">1h %</span>
          <span className="text-right">24h %</span>
          <span className="text-right">7d %</span>
          <span className="text-right text-[10px]">Updated</span>
        </div>

        <div className="divide-y divide-zinc-100">
          {isLoading && coins.length === 0 ? (
            <LoadingRows />
          ) : (
            coins.map((coin) => <CoinRow key={coin.id} coin={coin} />)
          )}
        </div>
      </div>
    </div>
  );
}

function formatPct(value: number | null) {
  if (value == null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function CoinRow({ coin }: { coin: Coin }) {
  const changeCls = (v: number | null) =>
    v == null ? "text-zinc-400" : v >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_70px_70px_70px_70px] items-center gap-x-4 gap-y-0 px-4 py-3.5 text-sm transition-colors hover:bg-zinc-50/80">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-right text-xs tabular-nums text-zinc-400">#{coin.rank}</span>
          <span className="truncate font-semibold text-zinc-900">{coin.name}</span>
          <span className="shrink-0 text-xs font-medium text-zinc-500">{coin.symbol}</span>
        </div>
      </div>

      <div className="text-right text-[15px] font-semibold tabular-nums text-zinc-900">
        {formatCurrencyUsd(coin.price)}
      </div>

      <div className="text-right text-sm tabular-nums text-zinc-600">
        {formatCurrencyUsd(coin.marketCap)}
      </div>

      <div className="text-right text-sm tabular-nums text-zinc-600">
        {formatCurrencyUsd(coin.volume24h)}
      </div>

      <div className={`text-right text-sm font-medium tabular-nums ${changeCls(coin.pctChange1h)}`}>
        {formatPct(coin.pctChange1h)}
      </div>

      <div className={`text-right text-sm font-medium tabular-nums ${changeCls(coin.pctChange24h)}`}>
        {formatPct(coin.pctChange24h)}
      </div>

      <div className={`text-right text-sm font-medium tabular-nums ${changeCls(coin.pctChange7d)}`}>
        {formatPct(coin.pctChange7d)}
      </div>

      <div className="text-right text-xs tabular-nums text-zinc-500">
        {new Date(coin.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_70px_70px_70px_70px] items-center gap-x-4 px-4 py-3.5"
        >
          <Skeleton className="h-4 w-36" />
          <Skeleton className="ml-auto h-4 w-20" />
          <Skeleton className="ml-auto h-4 w-16" />
          <Skeleton className="ml-auto h-4 w-16" />
          <Skeleton className="ml-auto h-4 w-12" />
          <Skeleton className="ml-auto h-4 w-12" />
          <Skeleton className="ml-auto h-4 w-12" />
          <Skeleton className="ml-auto h-3 w-10" />
        </div>
      ))}
    </>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-200/70 ${className ?? ""}`}
      aria-hidden
    />
  );
}

