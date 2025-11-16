'use client'

import { useState, useEffect } from 'react'

export default function CrosswordGame() {
  const [game, setGame] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [currentCell, setCurrentCell] = useState(null)

  // ایجاد بازی جدید
  const createGame = async () => {
    if (!playerName.trim()) return
    
    setIsCreating(true)
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName: playerName.trim() }),
      })
      
      if (response.ok) {
        const newGame = await response.json()
        setGame(newGame)
      }
    } catch (error) {
      console.error('خطا در ایجاد بازی:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // انتخاب خانه
  const handleCellClick = (row, col) => {
    setCurrentCell({ row, col })
  }

  // وارد کردن حرف
  const handleLetterInput = async (letter) => {
    if (!game || !currentCell) return

    try {
      const updatedBoard = game.board.map(row => [...row])
      updatedBoard[currentCell.row][currentCell.col] = {
        ...updatedBoard[currentCell.row][currentCell.col],
        letter: letter.toUpperCase(),
        isRevealed: true
      }

      const response = await fetch(`/api/game/${game.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board: updatedBoard,
          score: game.score + 10 // افزایش امتیاز
        }),
      })

      if (response.ok) {
        const updatedGame = await response.json()
        setGame(updatedGame)
      }
    } catch (error) {
      console.error('خطا در بروزرسانی بازی:', error)
    }
  }

  if (!game) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>بازی کراسورد</h1>
        <div style={{ margin: '20px 0' }}>
          <input
            type="text"
            placeholder="نام خود را وارد کنید"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ 
              padding: '10px', 
              fontSize: '16px',
              marginLeft: '10px'
            }}
          />
          <button 
            onClick={createGame}
            disabled={isCreating}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isCreating ? 'در حال ایجاد...' : 'شروع بازی'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>بازی کراسورد</h1>
      <div style={{ margin: '20px 0' }}>
        <p>بازیکن: {game.playerName}</p>
        <p>امتیاز: {game.score}</p>
      </div>
      
      <div style={{ display: 'inline-block', margin: '20px 0' }}>
        {game.board.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 
                    currentCell?.row === rowIndex && currentCell?.col === colIndex
                      ? '#ffff99'
                      : cell.isRevealed ? '#e6f3ff' : '#f0f0f0',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                {cell.isRevealed ? cell.letter : ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {currentCell && (
        <div style={{ margin: '20px 0' }}>
          <p>خانه انتخاب شده: سطر {currentCell.row + 1}, ستون {currentCell.col + 1}</p>
          <div>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(letter => (
              <button
                key={letter}
                onClick={() => handleLetterInput(letter)}
                style={{
                  padding: '10px',
                  margin: '5px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}