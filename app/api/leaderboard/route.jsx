import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import redis from '@/lib/redis';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const limit = parseInt(searchParams.get('limit')) || 10;

    console.log('📊 دریافت لیدربرد برای تاریخ:', date);

    // چک کردن کش
    const cacheKey = `leaderboard:${date}:${limit}`;
    const cachedLeaderboard = await redis.get(cacheKey);
    
    if (cachedLeaderboard) {
      console.log('✅ لیدربرد از کش برگردانده شد');
      return NextResponse.json(JSON.parse(cachedLeaderboard));
    }

    // دریافت لیدربرد از دیتابیس
    const result = await pool.query(
      `SELECT 
         dl.score,
         dl.time_spent,
         dl.completed_at,
         u.username,
         u.id as user_id,
         RANK() OVER (ORDER BY dl.score DESC, dl.time_spent ASC) as rank
       FROM daily_leaderboard dl
       JOIN users u ON dl.user_id = u.id
       WHERE dl.puzzle_date = $1
       ORDER BY dl.score DESC, dl.time_spent ASC
       LIMIT $2`,
      [date, limit]
    );

    const leaderboard = {
      date,
      players: result.rows,
      totalPlayers: result.rows.length
    };

    // ذخیره در کش برای 5 دقیقه
    await redis.setex(cacheKey, 300, JSON.stringify(leaderboard));

    console.log('✅ لیدربرد از دیتابیس دریافت شد');

    return NextResponse.json(leaderboard);

  } catch (error) {
    console.error('❌ خطا در دریافت لیدربرد:', error);
    return NextResponse.json(
      { error: 'خطای سرور در دریافت لیدربرد' },
      { status: 500 }
    );
  }
}