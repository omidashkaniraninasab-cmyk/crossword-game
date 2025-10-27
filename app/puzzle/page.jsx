'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PuzzleGrid from '@/components/PuzzleGrid';
import ClueList from '@/components/ClueList';
import ScoreDisplay from '@/components/ScoreDisplay';

export default function PuzzlePage() {
  const [puzzle, setPuzzle] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [answerHistory, setAnswerHistory] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPuzzleLocked, setIsPuzzleLocked] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);

  useEffect(() => {
    loadTodayPuzzle();
  }, []);

  useEffect(() => {
    calculateTotalScore();
  }, [answerHistory]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // بررسی کامل شدن صحیح پازل
  useEffect(() => {
    if (isPuzzleComplete() && isAllCorrect() && !isPuzzleLocked) {
      setIsPuzzleLocked(true);
      submitFinalScore();
      setShowCongratulations(true);
    }
  }, [userAnswers]);

  const loadTodayPuzzle = async () => {
    try {
      const response = await fetch('/api/puzzle');
      const puzzleData = await response.json();
      setPuzzle(puzzleData);
    } catch (error) {
      console.error('خطا در دریافت پازل:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = () => {
    if (!puzzle) return;

    let score = 0;
    const correctAnswers = puzzle.correct_answers;

    Object.keys(answerHistory).forEach(cellId => {
      const history = answerHistory[cellId];
      const correctAnswer = correctAnswers[cellId];
      
      let cellScore = 0;
      let hasCorrectAnswer = false;

      for (const answer of history) {
        if (answer === '') {
          continue;
        } else if (answer === correctAnswer) {
          if (!hasCorrectAnswer) {
            cellScore += 10;
            hasCorrectAnswer = true;
          }
          break;
        } else {
          if (!hasCorrectAnswer) {
            cellScore -= 5;
          }
        }
      }

      score += cellScore;
    });

    setTotalScore(Math.max(0, score));
  };

  const isPuzzleComplete = () => {
    if (!puzzle) return false;
    const correctAnswers = puzzle.correct_answers;
    const totalCells = Object.keys(correctAnswers).length;
    const filledCells = Object.keys(userAnswers).length;
    
    return totalCells === filledCells;
  };

  const isAllCorrect = () => {
    if (!puzzle) return false;
    const correctAnswers = puzzle.correct_answers;
    return Object.keys(userAnswers).every(cellId => 
      userAnswers[cellId] === correctAnswers[cellId]
    );
  };

  const handleCellChange = (cellId, answer) => {
    if (!puzzle || isPuzzleLocked) return;

    const correctAnswers = puzzle.correct_answers;
    const correctAnswer = correctAnswers[cellId];

    const newAnswers = { ...userAnswers };
    if (answer === '') {
      delete newAnswers[cellId];
    } else {
      newAnswers[cellId] = answer;
    }
    setUserAnswers(newAnswers);

    const newHistory = { ...answerHistory };
    if (!newHistory[cellId]) {
      newHistory[cellId] = [];
    }
    newHistory[cellId].push(answer);
    setAnswerHistory(newHistory);
  };

  const submitFinalScore = async () => {
    try {
      const response = await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          score: totalScore,
          timeSpent: timeSpent
        })
      });

      const result = await response.json();
      console.log('امتیاز ثبت شد:', result);
    } catch (error) {
      console.error('خطا در ثبت امتیاز:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">در حال بارگذاری پازل امروز...</div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">پازل امروز موجود نیست</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-lg">
            ← بازگشت
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">کراس‌ورد امروز</h1>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-lg inline-block">
              <span className="font-mono text-xl font-bold">{formatTime(timeSpent)}</span>
            </div>
            <ScoreDisplay score={totalScore} />
            <button 
              onClick={submitFinalScore}
              disabled={!isPuzzleComplete() || isPuzzleLocked}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                isPuzzleComplete() && !isPuzzleLocked
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isPuzzleLocked ? 'ثبت شده' : 'ثبت امتیاز'}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex justify-center">
            <PuzzleGrid
              grid={puzzle.grid}
              userAnswers={userAnswers}
              onCellChange={handleCellChange}
              correctAnswers={puzzle.correct_answers}
              answerHistory={answerHistory}
              isLocked={isPuzzleLocked}
            />
          </div>

          <div className="flex-1">
            <ClueList clues={puzzle.clues} />
          </div>
        </div>

        {/* وضعیت پیشرفت */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">وضعیت پیشرفت</h3>
            <div className="text-sm text-gray-600">
              زمان: <span className="font-mono">{formatTime(timeSpent)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(userAnswers).length}
              </div>
              <div className="text-sm text-blue-800">سلول‌های پر</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(answerHistory).filter(history => 
                  history.some(answer => answer !== '')
                ).length}
              </div>
              <div className="text-sm text-green-800">سلول‌های فعال</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{totalScore}</div>
              <div className="text-sm text-purple-800">امتیاز فعلی</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {isPuzzleLocked ? '🔒' : (isPuzzleComplete() ? '✅' : '⏳')}
              </div>
              <div className="text-sm text-yellow-800">
                {isPuzzleLocked ? 'قفل شده' : (isPuzzleComplete() ? 'تکمیل شده' : 'در حال انجام')}
              </div>
            </div>
          </div>

          {isPuzzleLocked && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center">
              <span className="font-bold text-green-800">🎉 تبریک! شما پازل امروز را کامل کردید!</span>
            </div>
          )}
        </div>

        {/* پیام تبریک */}
        {showCongratulations && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                تبریک می‌گم!
              </h2>
              <p className="text-gray-600 mb-4">
                شما پازل امروز را با <strong>{totalScore} امتیاز</strong> کامل کردید!
              </p>
              <p className="text-sm text-gray-500 mb-6">
                زمان: {formatTime(timeSpent)}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  href="/leaderboard" 
                  className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  مشاهده جدول
                </Link>
                <button 
                  onClick={() => setShowCongratulations(false)}
                  className="bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ادامۀ بازی
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}