'use client'

import { WORD_LIST } from '../words'

export default function GameClues({ board }) {
  const getWordCompletion = (wordId) => {
    const word = WORD_LIST[wordId]
    if (!word) return false
    
    for (let i = 0; i < word.word.length; i++) {
      const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i
      const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol
      
      if (!board[row] || !board[row][col] || !board[row][col].isRevealed) {
        return false
      }
    }
    return true
  }

  return (
    <div style={{ margin: '20px 0', textAlign: 'right' }}>
      <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>راهنمای کلمات:</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {WORD_LIST.map((word, index) => (
          <div
            key={index}
            style={{
              padding: '15px',
              border: `2px solid ${getWordCompletion(index) ? '#27ae60' : '#bdc3c7'}`,
              borderRadius: '8px',
              backgroundColor: getWordCompletion(index) ? '#d5f4e6' : '#f8f9fa',
              transition: 'all 0.3s ease',
              textAlign: 'right'
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#2c3e50' }}>
                {word.direction === 'horizontal' ? '⯈ افقی' : '⯀ عمودی'} - 
                شروع: ({word.startRow + 1}, {word.startCol + 1})
              </strong>
            </div>
            <div style={{ color: '#34495e', lineHeight: '1.5' }}>
              {word.clue}
            </div>
            {getWordCompletion(index) && (
              <div style={{ 
                color: '#27ae60', 
                marginTop: '8px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '5px'
              }}>
                <span>✅ کامل شد</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}