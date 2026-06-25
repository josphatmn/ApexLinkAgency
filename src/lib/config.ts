export const config = {
  siteName: process.env.SITE_NAME || 'APEXLINK Agency',
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',
  defaultReferralCode: process.env.DEFAULT_REFERRAL_CODE || 'APEXLINK',
  level1CommissionRate: parseFloat(process.env.LEVEL1_COMMISSION_RATE || '0.10'),
  level2CommissionRate: parseFloat(process.env.LEVEL2_COMMISSION_RATE || '0.05'),
  activationFee: parseFloat(process.env.ACTIVATION_FEE || '500'),
  withdrawalThreshold: parseFloat(process.env.WITHDRAWAL_THRESHOLD || '200'),
  withdrawalFeePercentage: parseFloat(process.env.WITHDRAWAL_FEE_PERCENTAGE || '0.05'),
  apexConversionRate: parseInt(process.env.APEX_CONVERSION_RATE || '100'),
  tokenName: process.env.TOKEN_NAME || 'tokens',
  currencySymbol: process.env.CURRENCY_SYMBOL || 'KES',
  tokenExchangeRate: parseFloat(process.env.TOKEN_EXCHANGE_RATE || '1'),
  promotionWinnerPercentage: parseFloat(process.env.PROMOTION_WINNER_PERCENTAGE || '0.70'),
  promotionIntervalMinutes: parseInt(process.env.PROMOTION_INTERVAL_MINUTES || '30'),
  mediaAccessCost: parseInt(process.env.MEDIA_ACCESS_COST || '50'),
  jwtSecret: process.env.JWT_SECRET || 'apexlink-jwt-secret',
};

export const countries = [
  { name: 'Kenya', code: 'KE', prefix: '+254', currency: 'KES' },
  { name: 'Uganda', code: 'UG', prefix: '+256', currency: 'UGX' },
  { name: 'Tanzania', code: 'TZ', prefix: '+255', currency: 'TZS' },
  { name: 'Rwanda', code: 'RW', prefix: '+250', currency: 'RWF' },
] as const;

export const avatarColors = [
  '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];
