-- Migration: Add missing tables and schema changes for production
-- Run this on your production database (e.g., via phpMyAdmin or mysql CLI)

-- 1. pending_deposits table (for wallet PesaPal deposits)
CREATE TABLE IF NOT EXISTS pending_deposits (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  amount decimal(12,2) NOT NULL,
  merchant_reference varchar(100) NOT NULL,
  order_tracking_id varchar(100) DEFAULT NULL,
  status enum('pending','completed','failed') DEFAULT 'pending',
  created_at datetime NOT NULL,
  updated_at datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_merchant_reference (merchant_reference),
  KEY idx_order_tracking_id (order_tracking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. pesapal_webhooks table (for PesaPal IPN callbacks)
CREATE TABLE IF NOT EXISTS pesapal_webhooks (
  id int NOT NULL AUTO_INCREMENT,
  order_tracking_id varchar(100) DEFAULT NULL,
  merchant_reference varchar(100) DEFAULT NULL,
  notification_type varchar(20) DEFAULT NULL,
  raw_body longtext,
  created_at datetime NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_tracking_id (order_tracking_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Add 'rejected' to transactions.status enum
ALTER TABLE transactions MODIFY COLUMN status enum('pending','completed','failed','rejected') DEFAULT 'pending';

-- 4. Add 'media_movie' and 'media_tv' to platform_income.source enum
ALTER TABLE platform_income MODIFY COLUMN source enum('activation','commission_margin','withdrawal_fee','promotion','media_movie','media_tv') NOT NULL;

-- 5. app_settings table (for auto-stored PesaPal IPN ID, etc)
CREATE TABLE IF NOT EXISTS app_settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Ensure users.avatar is LONGTEXT (for base64 avatars)
ALTER TABLE users MODIFY COLUMN avatar longtext;
