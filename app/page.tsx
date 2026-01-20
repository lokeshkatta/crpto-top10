"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Coin } from "./api/coins/route";
import { CoinTable } from "./components/CoinTable";

type FetchState = "idle" | "loading" | "success" | "error";

const POLL_INTERVAL_MS = 30_000;

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [status, setStatus] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchCoins = useCallback(
    async (reason: "initial" | "interval" | "manual") => {
      if (reason === "initial") {
        setStatus("loading");
      }

      try {
        const res = await fetch(`/api/coins?_t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        const data = await res.json();
        setCoins(data.coins ?? []);
        setLastUpdated(data.updatedAt ?? new Date().toISOString());
        setStatus("success");
        setError(null);
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load coin data right now.",
        );
      }
    },
    [],
  );

  useEffect(() => {
    fetchCoins("initial");
    const timer = setInterval(() => {
      fetchCoins("interval");
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchCoins]);

  const formattedUpdateTime = useMemo(() => {
    if (!lastUpdated) return null;
    const date = new Date(lastUpdated);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }, [lastUpdated]);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-zinc-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
                Top 10 Cryptocurrencies
              </h1>
              <p className="mt-0.5 text-xs text-zinc-500 sm:text-[13px]">
                Auto refresh 30s
                {formattedUpdateTime ? ` · Updated ${formattedUpdateTime}` : ""}
              </p>
            </div>
            <button
              onClick={() => fetchCoins("manual")}
              className="mt-2 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 sm:mt-0"
            >
              Refresh
            </button>
          </div>

          {status === "error" ? (
            <div className="border-b border-zinc-200 bg-rose-50/50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <CoinTable coins={coins} isLoading={status === "loading"} />
        </div>

        <section
          className="mt-10 rounded-xl border border-zinc-200/80 bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6"
          aria-labelledby="decisions-heading"
        >
          <h2
            id="decisions-heading"
            className="text-base font-bold tracking-tight text-zinc-900 sm:text-lg"
          >
            Why We Built It This Way
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Key decisions and reasons behind this app’s architecture and implementation.
          </p>

          <dl className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
            <div>
              <dt className="text-sm font-semibold text-zinc-800">
                Next.js App Router + API route as BFF
              </dt>
              <dd className="mt-1 text-sm text-zinc-600">
                We use a <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs">/api/coins</code> route as a Backend-for-Frontend. It calls CoinMarketCap on the server, so the API key never reaches the browser. The route also normalizes the CMC (CoinMarketCap) response (e.g. <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs">cmc_rank</code> → <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs">rank</code>) so the UI stays simple and stable if the external API changes.
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-zinc-800">
                Client-side fetch with 30s polling
              </dt>
              <dd className="mt-1 text-sm text-zinc-600">
                Data is fetched from our own API on the client with a 30-second poll and an optional manual refresh. This gives a “live” feel without WebSockets, avoids re-running the CMC (CoinMarketCap) request on every page load, and works well with CDN/caching. The countdown and “Refresh” button make the update behavior clear to users.
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-zinc-800">
                Separated components and formatting
              </dt>
              <dd className="mt-1 text-sm text-zinc-600">
                <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs">CoinTable</code> handles layout and display; <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs">format.ts</code> centralizes currency and number formatting. This keeps the table reusable, easier to test, and consistent if we add more views or locales.
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-zinc-800">
                Caching and resilience
              </dt>
              <dd className="mt-1 text-sm text-zinc-600">
                The API uses <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs">revalidate: 60</code> on the CoinMarketCap fetch to limit upstream calls, and <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs">Cache-Control: private, max-age=0, must-revalidate</code> on the response so manual and auto refresh always receive fresh data. On the client, we track loading, success, and error states and surface clear messages when something fails.
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-zinc-800">
                Tailwind and responsive layout
              </dt>
              <dd className="mt-1 text-sm text-zinc-600">
                Tailwind CSS powers layout and theming with a zinc palette and simple borders/shadows. The table uses a responsive grid, horizontal scroll on small screens, and skeleton placeholders during loading so the UI stays readable and predictable across devices.
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}
