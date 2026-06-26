import { NextRequest, NextResponse } from 'next/server';
import { requireActivated } from '@/lib/api-utils';
import { execute, query } from '@/lib/db';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const session = await requireActivated();
  if (session instanceof NextResponse) return session;

  const { media_id, media_type, title, poster_path } = await req.json();

  if (!media_id || !media_type || !title) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  if (!['movie', 'tv'].includes(media_type)) {
    return NextResponse.json({ success: false, error: 'Invalid media type' }, { status: 400 });
  }

  await execute(`CREATE TABLE IF NOT EXISTS media_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    media_id INT NOT NULL,
    media_type ENUM('movie','tv') NOT NULL,
    title VARCHAR(255) NOT NULL,
    poster_path VARCHAR(255) DEFAULT NULL,
    cost DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_media (user_id, media_id, media_type),
    INDEX idx_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  const existing = await query<any[]>('SELECT id FROM media_access WHERE user_id = ? AND media_id = ? AND media_type = ?', [session.userId, media_id, media_type]);
  if (existing.length > 0) {
    return NextResponse.json({ success: true, message: 'Already purchased', hasAccess: true });
  }

  const users = await query<any[]>('SELECT apex_balance FROM users WHERE id = ?', [session.userId]);
  if (!users.length) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  const cost = config.mediaAccessCost;
  const user = users[0];

  if (parseFloat(user.apex_balance) < cost) {
    return NextResponse.json({ success: false, error: `Insufficient ${config.tokenName}. You need ${cost} ${config.tokenName} to access this content.` }, { status: 400 });
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await execute('UPDATE users SET apex_balance = apex_balance - ? WHERE id = ?', [cost, session.userId]);
  await execute('INSERT INTO media_access (user_id, media_id, media_type, title, poster_path, cost, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [session.userId, media_id, media_type, title, poster_path || null, cost, now]);
  await execute('INSERT INTO transactions (user_id, type, amount, reference, status, created_at) VALUES (?, ?, ?, ?, ?, ?)', [session.userId, 'transfer', cost, `media-${media_type}-${media_id}`, 'completed', now]);
  const incomeSource = media_type === 'movie' ? 'media_movie' : 'media_tv';
  await execute("INSERT INTO platform_income (source, amount, reference, created_at) VALUES (?, ?, ?, ?)", [incomeSource, cost, `media-${media_type}-${media_id}-${randomHex(4).toUpperCase()}`, now]);

  return NextResponse.json({
    success: true,
    message: `Access granted! ${cost} ${config.tokenName} deducted.`,
    hasAccess: true,
  });
}
