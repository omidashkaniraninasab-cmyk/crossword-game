import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import redis from '@/lib/redis';

export async function POST(request) {
  try {
    const { userId, score, timeSpent = 0 } = await request.json();
    const today = new Date().toISOString().split('T')[0];

    console.log('🏆 ثبت امتیاز نهایی:', { userId, score, timeSpent });

    // ثبت در جدول لیدربرد روزانه
    const result = await pool.query(
      `INSERT INTO daily_leaderboard (user_id, puzzle_date, score, time_spent, completed_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, puzzle_date) 
       DO UPDATE SET score = $3, time_spent = $4, completed_at = NOW()
       RETURNING *`,
      [userId, today, score, timeSpent]
    );

    // ثبت در تاریخچه امتیازات
    await pool.query(
      `INSERT INTO score_history (user_id, puzzle_date, score)
       VALUES ($1, $2, $3)`,
      [userId, today, score]
    );

    // پاکسازی کش لیدربرد
    await redis.del(`leaderboard:${today}`);
    await redis.del(`user_stats:${userId}`);

    console.log('✅ امتیاز با موفقیت ثبت شد');

    return NextResponse.json({ 
      success: true, 
      rank: result.rows[0].id
    });

  } catch (error) {
    console.error('❌ خطا در ثبت امتیاز:', error);
    return NextResponse.json(
      { error: 'خطای سرور در ثبت امتیاز' },
      { status: 500 }
    );
  }
}