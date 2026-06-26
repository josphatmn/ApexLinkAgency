CREATE TABLE IF NOT EXISTS pesapal_webhooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_tracking_id VARCHAR(100) DEFAULT NULL,
    merchant_reference VARCHAR(100) DEFAULT NULL,
    notification_type VARCHAR(20) DEFAULT NULL,
    raw_body LONGTEXT DEFAULT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_order_tracking_id (order_tracking_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
