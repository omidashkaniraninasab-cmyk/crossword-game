import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    // اعتبارسنجی
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'تمامی فیلدها الزامی هستند' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' },
        { status: 400 }
      );
    }

    // چک کردن تکراری نبودن کاربر
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'نام کاربری یا ایمیل قبلاً استفاده شده است' },
        { status: 400 }
      );
    }

    // هش کردن رمز عبور
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // ایجاد کاربر جدید
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash]
    );

    const user = result.rows[0];

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      message: 'ثبت‌نام با موفقیت انجام شد'
    });

  } catch (error) {
    console.error('خطا در ثبت‌نام:', error);
    return NextResponse.json(
      { error: 'خطای سرور در ثبت‌نام' },
      { status: 500 }
    );
  }
}