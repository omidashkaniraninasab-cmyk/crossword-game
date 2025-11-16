import { WORD_LIST } from '../words'

export function checkWordCompletion(board, wordId) {
  const word = WORD_LIST[wordId]
  if (!word) return false
  
  const { word: targetWord, direction, startRow, startCol } = word
  
  for (let i = 0; i < targetWord.length; i++) {
    const row = direction === 'horizontal' ? startRow : startRow + i
    const col = direction === 'horizontal' ? startCol + i : startCol
    
    if (row >= board.length || col >= board[0].length) return false
    
    const cell = board[row][col]
    if (!cell.isRevealed || cell.letter !== targetWord[i]) {
      return false
    }
  }
  
  return true
}

export function calculateScore(board) {
  let score = 0
  let completedWords = 0
  
  // امتیاز برای خانه‌های پر شده
  board.forEach(row => {
    row.forEach(cell => {
      if (cell.isRevealed && cell.letter) {
        score += 10
      }
    })
  })
  
  // امتیاز اضافه برای کلمات کامل شده
  WORD_LIST.forEach((_, wordId) => {
    if (checkWordCompletion(board, wordId)) {
      score += 50
      completedWords++
    }
  })
  
  return { score, completedWords }
}