import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    console.log('📅 درخواست پازل برای تاریخ:', today);

    // اول چک می‌کنیم کش Redis داره یا نه
    const cachedPuzzle = await redis.get(`puzzle:${today}`);
    if (cachedPuzzle) {
      console.log('✅ پازل از کش Redis برگردونده شد');
      return NextResponse.json(JSON.parse(cachedPuzzle));
    }

    // اگر کش نبود، از دیتابیس می‌گیریم
    const result = await pool.query(
      'SELECT * FROM puzzles WHERE date = $1',
      [today]
    );

    if (result.rows.length === 0) {
      console.log('❌ پازل امروز پیدا نشد');
      return NextResponse.json(
        { error: 'پازل امروز موجود نیست' }, 
        { status: 404 }
      );
    }

    const puzzle = result.rows[0];
    console.log('✅ پازل از دیتابیس دریافت شد:', puzzle.id);

    // ذخیره در کش Redis برای 24 ساعت
    await redis.setex(`puzzle:${today}`, 86400, JSON.stringify(puzzle));
    console.log('✅ پازل در Redis کش شد');

    return NextResponse.json(puzzle);

  } catch (error) {
    console.error('❌ خطا در دریافت پازل:', error);
    return NextResponse.json(
      { error: 'خطای سرور در دریافت پازل' },
      { status: 500 }
    );
  }
}