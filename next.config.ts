import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SITE_NAME: process.env.SITE_NAME || 'APEXLINK Agency',
    NEXT_PUBLIC_SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_ACTIVATION_FEE: process.env.ACTIVATION_FEE || '500',
    NEXT_PUBLIC_WITHDRAWAL_THRESHOLD: process.env.WITHDRAWAL_THRESHOLD || '200',
    NEXT_PUBLIC_MEDIA_ACCESS_COST: process.env.MEDIA_ACCESS_COST || '50',
    NEXT_PUBLIC_TMDB_API_KEY: process.env.TMDB_API_KEY || '',
    NEXT_PUBLIC_CURRENCY_SYMBOL: process.env.CURRENCY_SYMBOL || 'KES',
    NEXT_PUBLIC_TOKEN_EXCHANGE_RATE: process.env.TOKEN_EXCHANGE_RATE || '1',
    NEXT_PUBLIC_TOKEN_NAME: process.env.TOKEN_NAME || 'tokens',
  },
};

export default nextConfig;
