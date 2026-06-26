import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.isAdmin ? payload : null;
}

export async function GET(req: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status') || 'pending';

  const withdrawals = await query<RowDataPacket[]>(
    "SELECT t.*, u.username FROM transactions t JOIN users u ON t.user_id=u.id WHERE t.type='withdrawal' AND t.status=? ORDER BY t.created_at DESC",
    [status]
  );

  return NextResponse.json({ success: true, withdrawals });
}

export async function POST(req: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { id, action } = await req.json();

  if (action === 'approve') {
    await execute("UPDATE transactions SET status = 'completed' WHERE id = ? AND type = 'withdrawal' AND status = 'pending'", [id]);
    return NextResponse.json({ success: true, message: 'Withdrawal approved.' });
  }

  if (action === 'reject') {
    const txns = await query<RowDataPacket[]>(
      "SELECT user_id, amount FROM transactions WHERE id = ? AND type = 'withdrawal' AND status = 'pending'",
      [id]
    );
    if (txns.length > 0) {
      const txn = txns[0] as any;
      await execute('UPDATE users SET balance = balance + ? WHERE id = ?', [txn.amount, txn.user_id]);
      await execute("UPDATE transactions SET status = 'rejected' WHERE id = ?", [id]);
      return NextResponse.json({ success: true, message: 'Withdrawal rejected, balance restored.' });
    }
    return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 });
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}

export const dynamic = 'force-dynamic';
