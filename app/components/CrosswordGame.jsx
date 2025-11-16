'use client'

import { useState, useEffect } from 'react'
import GameClues from './GameClues'

export default function CrosswordGame() {
  const [game, setGame] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [currentCell, setCurrentCell] = useState(null)
  const [timeLeft, setTimeLeft] = useState(300)
  const [error, setError] = useState('')

  // لاگ برای دیباگ
  useEffect(() => {
    if (game) {
      console.log('وضعیت بازی:', {
        id: game.id,
        score: game.score,
        state: game.state,
        board: game.board
      })
    }
  }, [game])

  // تایمر بازی
  useEffect(() => {
    if (!game || game.state === 'finished') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          endGameDueToTime()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [game])

  const endGameDueToTime = async () => {
    try {
      const response = await fetch(`/api/game/${game.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: 'finished'
        }),
      })

      if (!response.ok) {
        throw new Error('خطا در پایان بازی')
      }

      const updatedGame = await response.json()
      setGame(updatedGame)
    } catch (error) {
      console.error('خطا در پایان بازی:', error)
      setError('خطا در ارتباط با سرور')
    }
  }

  // بارگذاری دوره‌ای وضعیت بازی
  useEffect(() => {
    if (!game) return
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/game/${game.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('بازی یافت نشد. لطفا بازی جدیدی شروع کنید.')
            return
          }
          throw new Error('خطا در دریافت وضعیت بازی')
        }
        const updatedGame = await response.json()
        setGame(updatedGame)
        setError('')
      } catch (error) {
        console.error('خطا در دریافت وضعیت بازی:', error)
        setError('خطا در بروزرسانی وضعیت بازی')
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [game])

  // ایجاد بازی جدید
  const createGame = async () => {
    if (!playerName.trim()) {
      setError('لطفا نام خود را وارد کنید')
      return
    }
    
    setIsCreating(true)
    setError('')
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName: playerName.trim() }),
      })
      
      if (!response.ok) {
        throw new Error('خطا در ایجاد بازی')
      }
      
      const newGame = await response.json()
      console.log('بازی جدید ایجاد شد:', newGame)
      setGame(newGame)
      setTimeLeft(300)
      setError('')
    } catch (error) {
      console.error('خطا در ایجاد بازی:', error)
      setError('خطا در ایجاد بازی جدید')
    } finally {
      setIsCreating(false)
    }
  }

  // انتخاب خانه
  const handleCellClick = (row, col) => {
    if (game.state === 'finished') return
    console.log('خانه انتخاب شده:', { row, col, cell: game.board[row][col] })
    setCurrentCell({ row, col })
    setError('')
  }

  // وارد کردن حرف - نسخه تصحیح شده
  const handleLetterInput = async (letter) => {
    if (!game || !currentCell || game.state === 'finished') return

    setError('')
    try {
      // ایجاد کپی عمیق از board
      const updatedBoard = game.board.map(row => 
        row.map(cell => ({ ...cell }))
      )
      
      // آپدیت خانه انتخاب شده
      updatedBoard[currentCell.row][currentCell.col] = {
        ...updatedBoard[currentCell.row][currentCell.col],
        letter: letter,
        isRevealed: true
      }

      console.log('آپدیت خانه:', {
        row: currentCell.row,
        col: currentCell.col,
        letter: letter,
        boardBefore: game.board[currentCell.row][currentCell.col],
        boardAfter: updatedBoard[currentCell.row][currentCell.col]
      })

      const response = await fetch(`/api/game/${game.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board: updatedBoard
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('بازی یافت نشد. لطفا بازی جدیدی شروع کنید.')
          return
        }
        throw new Error('خطا در بروزرسانی بازی')
      }

      const updatedGame = await response.json()
      console.log('بازی آپدیت شده:', updatedGame)
      setGame(updatedGame)
    } catch (error) {
      console.error('خطا در بروزرسانی بازی:', error)
      setError('خطا در ذخیره تغییرات')
    }
  }

  // پاک کردن خانه
  const handleClearCell = async () => {
    if (!game || !currentCell || game.state === 'finished') return

    setError('')
    try {
      const updatedBoard = game.board.map(row => 
        row.map(cell => ({ ...cell }))
      )
      
      updatedBoard[currentCell.row][currentCell.col] = {
        ...updatedBoard[currentCell.row][currentCell.col],
        letter: '',
        isRevealed: false
      }

      const response = await fetch(`/api/game/${game.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board: updatedBoard
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('بازی یافت نشد. لطفا بازی جدیدی شروع کنید.')
          return
        }
        throw new Error('خطا در پاک کردن خانه')
      }

      const updatedGame = await response.json()
      setGame(updatedGame)
    } catch (error) {
      console.error('خطا در پاک کردن خانه:', error)
      setError('خطا در پاک کردن خانه')
    }
  }

  // شروع بازی جدید
  const startNewGame = () => {
    setGame(null)
    setPlayerName('')
    setCurrentCell(null)
    setTimeLeft(300)
    setError('')
  }

  // فرمت زمان
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // رندر خانه‌های جدول
  const renderCell = (cell, rowIndex, colIndex) => {
    const isSelected = currentCell?.row === rowIndex && currentCell?.col === colIndex
    const showLetter = cell.isRevealed && cell.letter
    
    console.log(`خانه [${rowIndex}][${colIndex}]:`, {
      letter: cell.letter,
      isRevealed: cell.isRevealed,
      showLetter: showLetter,
      isSelected: isSelected
    })

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        onClick={() => handleCellClick(rowIndex, colIndex)}
        style={{
          width: '45px',
          height: '45px',
          border: '1px solid #7f8c8d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 
            isSelected
              ? '#f39c12'
              : cell.isRevealed 
                ? (cell.isWordStart ? '#3498db' : '#ecf0f1')
                : '#bdc3c7',
          cursor: game.state === 'finished' ? 'default' : 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#2c3e50',
          position: 'relative',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (game.state !== 'finished') {
            e.target.style.backgroundColor = isSelected ? '#f39c12' : '#d5dbdb'
          }
        }}
        onMouseLeave={(e) => {
          if (game.state !== 'finished') {
            e.target.style.backgroundColor = 
              isSelected
                ? '#f39c12'
                : cell.isRevealed 
                  ? (cell.isWordStart ? '#3498db' : '#ecf0f1')
                  : '#bdc3c7'
          }
        }}
      >
        {showLetter ? cell.letter : ''}
        {cell.isWordStart && (
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            fontSize: '8px',
            color: '#2c3e50',
            fontWeight: 'normal'
          }}>
            ●
          </div>
        )}
      </div>
    )
  }

  if (!game) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Tahoma, Arial, sans-serif' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>بازی جدول کلمات متقاطع</h1>
        
        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24',
            padding: '10px',
            borderRadius: '5px',
            margin: '10px 0',
            border: '1px solid #f5c6cb',
            maxWidth: '400px',
            margin: '10px auto'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'inline-block',
          minWidth: '300px'
        }}>
          <div style={{ margin: '20px 0' }}>
            <input
              type="text"
              placeholder="نام خود را وارد کنید"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={{ 
                padding: '12px', 
                fontSize: '16px',
                marginLeft: '10px',
                border: '2px solid #3498db',
                borderRadius: '5px',
                width: '200px',
                textAlign: 'center',
                fontFamily: 'Tahoma, Arial, sans-serif'
              }}
              onKeyPress={(e) => e.key === 'Enter' && createGame()}
            />
          </div>
          <button 
            onClick={createGame}
            disabled={isCreating || !playerName.trim()}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: isCreating ? '#95a5a6' : '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontFamily: 'Tahoma, Arial, sans-serif'
            }}
          >
            {isCreating ? 'در حال ایجاد...' : 'شروع بازی جدید'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'Tahoma, Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>بازی جدول کلمات متقاطع</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          padding: '10px',
          borderRadius: '5px',
          margin: '10px 0',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      
      {/* اطلاعات بازی */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <strong>بازیکن:</strong> {game.playerName}
        </div>
        <div>
          <strong>امتیاز:</strong> <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{game.score || 0}</span>
        </div>
        <div>
          <strong>کلمات کامل شده:</strong> {game.completedWords || 0}/4
        </div>
        <div>
          <strong>زمان:</strong> <span style={{ 
            color: timeLeft < 60 ? '#e74c3c' : '#2c3e50',
            fontWeight: 'bold',
            fontFamily: 'monospace'
          }}>{formatTime(timeLeft)}</span>
        </div>
        <button
          onClick={startNewGame}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          بازی جدید
        </button>
      </div>

      {game.state === 'finished' && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724',
          padding: '15px',
          borderRadius: '5px',
          margin: '10px 0',
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>🎉 تبریک! بازی را به پایان رساندید!</h3>
          <p style={{ margin: '0' }}>امتیاز نهایی شما: <strong>{game.score || 0}</strong></p>
        </div>
      )}
      
      {/* جدول بازی */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '40px', 
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        <div>
          <div style={{ 
            display: 'inline-block', 
            margin: '20px 0',
            border: '3px solid #2c3e50',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            {game.board.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: 'flex' }}>
                {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
              </div>
            ))}
          </div>

          {/* صفحه کلید حروف فارسی */}
          {currentCell && game.state !== 'finished' && (
            <div style={{ 
              margin: '20px 0',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <p style={{ marginBottom: '15px' }}>
                خانه انتخاب شده: <strong>سطر {currentCell.row + 1}</strong>, <strong>ستون {currentCell.col + 1}</strong>
              </p>
              
              <div style={{ marginBottom: '15px' }}>
                <button
                  onClick={handleClearCell}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    margin: '0 5px',
                    fontFamily: 'Tahoma, Arial, sans-serif'
                  }}
                >
                  پاک کردن
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center', maxWidth: '400px' }}>
                {['ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'].map(letter => (
                  <button
                    key={letter}
                    onClick={() => handleLetterInput(letter)}
                    style={{
                      padding: '12px',
                      margin: '2px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      width: '40px',
                      height: '40px',
                      border: '2px solid #3498db',
                      borderRadius: '5px',
                      backgroundColor: '#ecf0f1',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease',
                      fontFamily: 'Tahoma, Arial, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#3498db'
                      e.target.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ecf0f1'
                      e.target.style.color = '#2c3e50'
                    }}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* راهنما */}
        <div style={{ minWidth: '300px', maxWidth: '400px' }}>
          <GameClues board={game.board} />
        </div>
      </div>
    </div>
  )
}