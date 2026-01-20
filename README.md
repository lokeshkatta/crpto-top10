# crypto-top10

Live-updating top 10 cryptocurrency board using **Next.js 16** with a serverless proxy to CoinMarketCap. The UI polls every 30s and shows rank, price, market cap, 24h volume, 1h/24h/7d percent change, and last updated time—with loading skeletons and error states.

## Tech stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (zinc palette, light theme, responsive table)
- **CoinMarketCap API** via `/api/coins` (BFF; API key stays server-side)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure API key (CoinMarketCap)**
   - Create `.env.local` in the project root:
   ```
   CMC_API_KEY=your_coinmarketcap_api_key
   ```
   - The key is used only by `/api/coins`; it never reaches the browser.

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

4. **Production**
   ```bash
   npm run build
   npm run start
   ```

## Notes
- Get a free API key at [CoinMarketCap](https://coinmarketcap.com/api/).
