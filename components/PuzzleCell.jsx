'use client';

export default function PuzzleCell({ 
  cell, 
  cellId, 
  userAnswer, 
  onAnswerChange,
  isBlack,
  correctAnswer,
  answerHistory,
  isLocked 
}) {
  const getStatus = () => {
    if (!userAnswer || userAnswer === '') return 'empty';
    
    const history = answerHistory[cellId] || [];
    const hasCorrectAnswer = history.some(answer => answer === correctAnswer);
    
    if (hasCorrectAnswer) {
      return 'correct';
    } else if (userAnswer !== correctAnswer) {
      return 'wrong';
    } else {
      return 'correct';
    }
  };

  const status = getStatus();

  if (isBlack) {
    return (
      <div className="w-10 h-10 bg-black border border-gray-800" />
    );
  }

  const getBackgroundColor = () => {
    switch (status) {
      case 'correct':
        return 'bg-green-200 border-green-500';
      case 'wrong':
        return 'bg-red-200 border-red-500';
      default:
        return 'bg-white border-gray-300';
    }
  };

  const handleChange = (e) => {
    if (isLocked) return; // اگر قفل شده، کاری نکن
    const value = e.target.value.toUpperCase();
    onAnswerChange(cellId, value);
  };

  return (
    <div className={`relative w-10 h-10 border-2 ${getBackgroundColor()} ${
      isLocked ? 'opacity-90' : ''
    }`}>
      <div className="absolute top-0 left-0 text-xs p-1 text-gray-500">
        {cell?.number || ''}
      </div>
      <input
        type="text"
        maxLength={1}
        value={userAnswer || ''}
        onChange={handleChange}
        disabled={isLocked}
        className={`w-full h-full text-center font-bold text-lg focus:outline-none bg-transparent ${
          isLocked ? 'cursor-not-allowed' : ''
        }`}
      />
      {isLocked && (
        <div className="absolute inset-0 bg-green-100 bg-opacity-20 flex items-center justify-center">
          <span className="text-green-600 text-lg">✓</span>
        </div>
      )}
    </div>
  );
}