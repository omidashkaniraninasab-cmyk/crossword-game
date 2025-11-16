import { NextResponse } from 'next/server'
import { getGame, setGame } from '../storage'
import { calculateScore } from '../../../utils/gameLogic'
import { WORD_LIST } from '../../../words'

export async function GET(request, { params }) {
  try {
    // استفاده از await برای unwrap کردن params
    const { id } = await params
    
    const game = getGame(id)
    
    if (!game) {
      return NextResponse.json(
        { error: 'بازی یافت نشد' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(game)
  } catch (error) {
    console.error('خطا در دریافت بازی:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات بازی' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    // استفاده از await برای unwrap کردن params
    const { id } = await params
    const updates = await request.json()
    
    const game = getGame(id)
    if (!game) {
      return NextResponse.json(
        { error: 'بازی یافت نشد' },
        { status: 404 }
      )
    }
    
    // محاسبه امتیاز جدید
    const { score, completedWords } = calculateScore(updates.board || game.board)
    
    // آپدیت بازی
    const updatedGame = {
      ...game,
      ...updates,
      score,
      completedWords,
      updatedAt: new Date().toISOString()
    }
    
    // بررسی پایان بازی
    if (completedWords === WORD_LIST.length) {
      updatedGame.state = 'finished'
    }
    
    setGame(id, updatedGame)
    
    return NextResponse.json(updatedGame)
  } catch (error) {
    console.error('خطا در بروزرسانی بازی:', error)
    return NextResponse.json(
      { error: 'خطا در بروزرسانی بازی' },
      { status: 500 }
    )
  }
}