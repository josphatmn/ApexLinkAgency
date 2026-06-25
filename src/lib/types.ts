export interface User {
  id: number;
  username: string;
  fullname: string | null;
  email: string | null;
  bio: string | null;
  avatar: string | null;
  country: string;
  phone: string;
  referral_code: string;
  referred_by: number;
  referred_by_username: string;
  activated: 0 | 1;
  activated_at: string | null;
  balance: number;
  apex_balance: number;
  created_at: string;
  updated_at: string | null;
}

export interface Commission {
  id: number;
  user_id: number;
  from_user_id: number;
  level: number;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  paid_at: string | null;
  from_username?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'payment' | 'commission' | 'withdrawal' | 'deposit' | 'transfer';
  amount: number;
  reference: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface PromotionRound {
  id: number;
  winner_id: number | null;
  total_pot: number;
  winner_amount: number;
  platform_amount: number;
  status: 'open' | 'drawing' | 'completed';
  started_at: string;
  ended_at: string | null;
  username?: string;
}

export interface PromotionBet {
  id: number;
  user_id: number;
  round_id: number;
  amount: number;
  created_at: string;
  username?: string;
}

export interface PlatformIncome {
  id: number;
  source: 'activation' | 'commission_margin' | 'withdrawal_fee' | 'promotion';
  amount: number;
  reference: string | null;
  created_at: string;
}
