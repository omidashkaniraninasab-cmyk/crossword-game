import { NextResponse } from 'next/server'
import { setGame, getAllGames } from './storage'
import { WORD_LIST } from '../../words'

function createInitialBoard() {
  const size = 5
  const board = []
  
  for (let i = 0; i < size; i++) {
    const row = []
    for (let j = 0; j < size; j++) {
      row.push({
        type: 'letter',
        letter: '',
        isRevealed: false,
        row: i,
        col: j,
        isWordStart: false,
        wordId: null
      })
    }
    board.push(row)
  }
  
  WORD_LIST.forEach((wordObj, wordIndex) => {
    const { word, direction, startRow, startCol } = wordObj
    
    for (let i = 0; i < word.length; i++) {
      const row = direction === 'horizontal' ? startRow : startRow + i
      const col = direction === 'horizontal' ? startCol + i : startCol
      
      if (row < size && col < size) {
        board[row][col] = {
          ...board[row][col],
          letter: word[i],
          isWordStart: i === 0,
          wordId: wordIndex
        }
      }
    }
  })
  
  return board
}

export async function POST(request) {
  try {
    const { playerName } = await request.json()
    
    const gameId = Math.random().toString(36).substring(7)
    const newGame = {
      id: gameId,
      playerName,
      score: 0,
      board: createInitialBoard(),
      state: 'playing', // تغییر از 'waiting' به 'playing'
      completedWords: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setGame(gameId, newGame)
    
    console.log('بازی جدید ایجاد شد:', newGame)
    
    return NextResponse.json(newGame)
  } catch (error) {
    console.error('خطا در ایجاد بازی:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد بازی' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const gameList = getAllGames()
    return NextResponse.json(gameList)
  } catch (error) {
    console.error('خطا در دریافت لیست بازی‌ها:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت لیست بازی‌ها' },
      { status: 500 }
    )
  }
}