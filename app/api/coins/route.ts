import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RawCoin = {
  id: number;
  name: string;
  symbol: string;
  cmc_rank: number;
  quote: {
    USD: {
      price: number;
      market_cap: number;
      volume_24h: number;
      percent_change_1h: number | null;
      percent_change_24h: number;
      percent_change_7d: number | null;
      last_updated: string;
    };
  };
};

export type Coin = {
  id: number;
  rank: number;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  pctChange1h: number | null;
  pctChange24h: number;
  pctChange7d: number | null;
  lastUpdated: string;
};

const CMC_URL =
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=10&convert=USD";

export async function GET() {
  const apiKey = process.env.CMC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing CMC_API_KEY environment variable." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(CMC_URL, {
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch data from CoinMarketCap.", detail: errorText },
        { status: response.status },
      );
    }

    const payload = await response.json();
    const data: RawCoin[] = payload?.data ?? [];

    const coins: Coin[] = data.slice(0, 10).map((coin) => {
      const usd = coin.quote.USD;
      return {
        id: coin.id,
        rank: coin.cmc_rank,
        name: coin.name,
        symbol: coin.symbol,
        price: usd.price,
        marketCap: usd.market_cap,
        volume24h: usd.volume_24h,
        pctChange1h: usd.percent_change_1h ?? null,
        pctChange24h: usd.percent_change_24h,
        pctChange7d: usd.percent_change_7d ?? null,
        lastUpdated: usd.last_updated,
      };
    });

    return NextResponse.json(
      { coins, updatedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "private, max-age=0, must-revalidate",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected error while fetching coins.", detail: `${error}` },
      { status: 500 },
    );
  }
}
