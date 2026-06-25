# APEXLINK Agency — Multi-Level Marketing Platform

A next-generation MLM ecosystem built with [Next.js](https://nextjs.org) (App Router), TypeScript, and Tailwind CSS v4. Combines a powerful multi-level commission engine with a streaming media marketplace and gamified token economy.

## Platform Features

### Multi-Level Commission Engine
- **2-Level Referral Rewards** — Earn commissions on direct referrals (Level 1) and their referrals (Level 2)
- **Automated Payouts** — Commissions are calculated and distributed in real-time upon member activation
- **Withdrawal System** — Request payouts with configurable thresholds and management fees
- **Wallet Dashboard** — Track earnings, commissions, and withdrawal history at a glance

### Token Economy
- **APEX Tokens** — On-platform utility token used for premium services, media access, and promotions
- **Balance Conversion** — Convert your cash earnings to tokens and vice versa at a configurable exchange rate
- **Token Wallet** — Dedicated wallet for managing token balances with full transaction history

### Media Streaming Marketplace
- **Movies & TV Shows** — Browse trending, now-playing, top-rated, and upcoming titles powered by the TMDB API
- **Search & Filter** — Find content by genre, year, or keyword with paginated results
- **Content Details** — View synopsis, cast, crew, trailers, ratings, and runtime
- **Pay-Per-View Access** — Purchase media access using APEX tokens (configurable pricing)
- **Token-Gated Player** — Full-screen streaming page with floating controls

### Promotions & Gamification
- **APEX Promotions** — Time-based betting rounds where members wager tokens for a chance to win the pot
- **Live Countdown** — Real-time countdown timer synced to promotion intervals
- **Winner Takes Most** — Configurable winner percentage (default 70%) with platform cut
- **Admin Controls** — Enable/disable promotions, set intervals, manage draws

### Node Ecosystem
- **AI & Digital Tools** — Access AI writing, image generation, and data analytics tools
- **Resource Library** — E-books, video courses, and templates
- **Entertainment Hub** — Movies, music, games, and events
- **Business Directory** — Verified listings with reviews
- **Sellers Catalogue** — Product listings and seller profiles
- **Creator Marketplace** — Sell and buy digital content

### Admin Panel
- **Full Dashboard** — Platform metrics: total users, activated members, commissions paid, withdrawals, platform income, promo pool
- **User Management** — View, filter, and manage all registered users
- **Withdrawal Oversight** — Review and process withdrawal requests
- **Income Tracking** — Per-source revenue breakdown with date-range filtering
- **Dynamic Settings** — Edit site configuration (names, fees, rates, thresholds, promo settings) via a web UI — changes persist to `.env.local`
- **Promotion Manager** — Control the promo engine: toggle on/off, set intervals, run draws

### User Experience
- **Dark Mode** — Seamless theme toggle with system preference detection
- **Responsive Design** — Mobile-first layout that works across all devices
- **Toast Notifications** — Real-time feedback for all actions
- **Avatar System** — Auto-generated gradient avatars based on username
- **Referral System** — Track and share your unique referral code

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | MySQL via `mysql2` |
| **Auth** | JWT with `jose` + bcrypt + HTTP-only cookies |
| **Media API** | TMDB (The Movie Database) |
| **Font** | Geist (by Vercel) |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- TMDB API key (optional, for media features)

### Environment Setup

Copy the template and configure your settings:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_NAME` | Database name | `apexlink_agency` |
| `DB_USER` | Database user | `root` |
| `DB_PASS` | Database password | — |
| `SITE_NAME` | Platform name | `APEXLINK Agency` |
| `ADMIN_USERNAME` | Admin login | `admin` |
| `ADMIN_PASSWORD` | Admin password | `admin123` |
| `ACTIVATION_FEE` | Member activation cost | `500` |
| `WITHDRAWAL_THRESHOLD` | Min withdrawal amount | `200` |
| `WITHDRAWAL_FEE_PERCENTAGE` | Withdrawal fee (decimal) | `0.05` |
| `APEX_CONVERSION_RATE` | KES → Token multiplier | `100` |
| `TOKEN_NAME` | Token label | `TK` |
| `TOKEN_EXCHANGE_RATE` | Token → KES value | `1` |
| `CURRENCY_SYMBOL` | Currency display | `KES` |
| `LEVEL1_COMMISSION_RATE` | Direct ref commision | `0.10` |
| `LEVEL2_COMMISSION_RATE` | Indirect ref commission | `0.05` |
| `PROMOTIONS_ENABLED` | Toggle promo engine | `0` |
| `PROMOTION_INTERVAL_MINUTES` | Draw interval | `30` |
| `PROMOTION_WINNER_PERCENTAGE` | Prize pool % | `0.70` |
| `TMDB_API_KEY` | TMDB API key | — |
| `MEDIA_ACCESS_COST` | Token cost per view | `50` |
| `JWT_SECRET` | Session signing secret | — |

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

## Architecture

```
new-app/
├── public/              # Static assets
├── src/
│   ├── app/
│   │   ├── admin/       # Admin panel (dashboard, users, withdrawals, income, settings, promotion)
│   │   ├── api/         # REST API routes (auth, wallet, withdraw, media, promotion, admin)
│   │   ├── commissions/ # User commission history
│   │   ├── dashboard/   # User dashboard
│   │   ├── login/       # User login
│   │   ├── movies/      # Media browsing & detail
│   │   ├── nodes/       # Node ecosystem sub-pages
│   │   ├── payment/     # Activation payment
│   │   ├── play/        # Token-gated media player
│   │   ├── profile/     # User profile
│   │   ├── register/    # User registration
│   │   ├── wallet/      # Token & cash wallet
│   │   └── withdraw/    # Withdrawal + token conversion
│   ├── components/      # Shared UI (Header, ThemeProvider, Toast)
│   └── lib/             # Core modules (auth, db, config, tmdb, types, utils)
└── .env.local            # Runtime configuration (not committed)
```

## How Earnings Work

1. **Register** — Create an account with your referral link
2. **Activate** — Pay the activation fee to unlock the earning engine
3. **Refer** — Share your unique referral code with others
4. **Earn** — Collect Level 1 commissions (10%) on direct referrals and Level 2 commissions (5%) on their referrals
5. **Withdraw** — Request payouts once your balance exceeds the threshold
6. **Reinvest** — Convert earnings to APEX tokens to unlock media content, enter promotions, and access premium node features

## License

Proprietary — All rights reserved.
