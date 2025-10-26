import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import redis from '@/lib/redis';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId الزامی است' }, { status: 400 });
    }

    console.log('📈 دریافت آمار کاربر:', userId);

    // چک کردن کش
    const cacheKey = `user_stats:${userId}`;
    const cachedStats = await redis.get(cacheKey);
    
    if (cachedStats) {
      console.log('✅ آمار کاربر از کش برگردانده شد');
      return NextResponse.json(JSON.parse(cachedStats));
    }

    // آمار کاربر از دیتابیس
    const [dailyRankResult, historyStatsResult, totalStatsResult] = await Promise.all([
      // رتبه امروز
      pool.query(
        `SELECT rank FROM (
          SELECT user_id, RANK() OVER (ORDER BY score DESC, time_spent ASC) as rank
          FROM daily_leaderboard 
          WHERE puzzle_date = CURRENT_DATE
        ) as ranks
        WHERE user_id = $1`,
        [userId]
      ),
      // تاریخچه 7 روز گذشته
      pool.query(
        `SELECT puzzle_date, score, time_spent
         FROM daily_leaderboard 
         WHERE user_id = $1 AND puzzle_date >= CURRENT_DATE - INTERVAL '7 days'
         ORDER BY puzzle_date DESC`,
        [userId]
      ),
      // آمار کلی
      pool.query(
        `SELECT 
           COUNT(*) as total_puzzles,
           AVG(score) as avg_score,
           MAX(score) as best_score,
           SUM(score) as total_score
         FROM daily_leaderboard 
         WHERE user_id = $1`,
        [userId]
      )
    ]);

    const stats = {
      dailyRank: dailyRankResult.rows[0]?.rank || null,
      history: historyStatsResult.rows,
      totalStats: totalStatsResult.rows[0] || {
        total_puzzles: 0,
        avg_score: 0,
        best_score: 0,
        total_score: 0
      }
    };

    // ذخیره در کش برای 2 دقیقه
    await redis.setex(cacheKey, 120, JSON.stringify(stats));

    console.log('✅ آمار کاربر از دیتابیس دریافت شد');

    return NextResponse.json(stats);

  } catch (error) {
    console.error('❌ خطا در دریافت آمار کاربر:', error);
    return NextResponse.json(
      { error: 'خطای سرور در دریافت آمار' },
      { status: 500 }
    );
  }
}