import { NextResponse } from 'next/server'

// ذخیره موقت در حافظه (در تولید از دیتابیس استفاده کنید)
let games = new Map()

export async function POST(request) {
  try {
    const { playerName } = await request.json()
    
    const gameId = Math.random().toString(36).substring(7)
    const newGame = {
      id: gameId,
      playerName,
      score: 0,
      board: initializeBoard(),
      state: 'waiting',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    games.set(gameId, newGame)
    
    return NextResponse.json(newGame)
  } catch (error) {
    return NextResponse.json(
      { error: 'خطا در ایجاد بازی' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const gameList = Array.from(games.values())
  return NextResponse.json(gameList)
}

// تابع کمکی برای ایجاد بورد اولیه
function initializeBoard() {
  const size = 5
  const board = []
  
  for (let i = 0; i < size; i++) {
    const row = []
    for (let j = 0; j < size; j++) {
      row.push({
        type: CELL_TYPE.LETTER,
        letter: '',
        isRevealed: false,
        row: i,
        col: j
      })
    }
    board.push(row)
  }
  
  return board
}بله