'use client';
import PuzzleCell from './PuzzleCell';

export default function PuzzleGrid({ 
  grid, 
  userAnswers, 
  onCellChange,
  correctAnswers,
  answerHistory,
  isLocked 
}) {
  return (
    <div className="inline-block border-2 border-gray-800 p-2 bg-gray-100">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, cellIndex) => {
            const cellId = `${rowIndex}-${cellIndex}`;
            const isBlack = cell === null;
            
            return (
              <PuzzleCell
                key={cellId}
                cell={isBlack ? null : cell}
                cellId={cellId}
                userAnswer={userAnswers[cellId]}
                onAnswerChange={onCellChange}
                isBlack={isBlack}
                correctAnswer={correctAnswers[cellId]}
                answerHistory={answerHistory}
                isLocked={isLocked}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}