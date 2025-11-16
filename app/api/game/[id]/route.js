import { NextResponse } from 'next/server'

// ذخیره موقت در حافظه (همان map قبلی)
let games = new Map()

export async function GET(request, { params }) {
  try {
    const { id } = params
    const game = games.get(id)
    
    if (!game) {
      return NextResponse.json(
        { error: 'بازی یافت نشد' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(game)
  } catch (error) {
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات بازی' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const updates = await request.json()
    
    const game = games.get(id)
    if (!game) {
      return NextResponse.json(
        { error: 'بازی یافت نشد' },
        { status: 404 }
      )
    }
    
    // آپدیت بازی
    const updatedGame = {
      ...game,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    games.set(id, updatedGame)
    
    return NextResponse.json(updatedGame)
  } catch (error) {
    return NextResponse.json(
      { error: 'خطا در بروزرسانی بازی' },
      { status: 500 }
    )
  }
}