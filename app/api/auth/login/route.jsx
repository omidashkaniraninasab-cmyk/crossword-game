import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی هستند' },
        { status: 400 }
      );
    }

    // پیدا کردن کاربر
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // بررسی رمز عبور
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // آپدیت last_login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      message: 'ورود با موفقیت انجام شد'
    });

  } catch (error) {
    console.error('خطا در ورود:', error);
    return NextResponse.json(
      { error: 'خطای سرور در ورود' },
      { status: 500 }
    );
  }
}