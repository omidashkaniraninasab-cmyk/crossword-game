'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PuzzleGrid from '@/components/PuzzleGrid';
import ClueList from '@/components/ClueList';
import ScoreDisplay from '@/components/ScoreDisplay';

export default function PuzzlePage() {
  const [puzzle, setPuzzle] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [answerHistory, setAnswerHistory] = useState({}); // تاریخچه پاسخ‌های هر سلول
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    loadTodayPuzzle();
  }, []);

  useEffect(() => {
    // محاسبه امتیاز بر اساس تاریخچه
    calculateTotalScore();
  }, [answerHistory]);

  // تایمر ساده برای صفحه
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

      // بررسی تاریخچه این سلول
      for (const answer of history) {
        if (answer === '') {
          // پاک کردن - هیچ تاثیری ندارد
          continue;
        } else if (answer === correctAnswer) {
          // اولین بار که پاسخ درست داده +۱۰
          if (!hasCorrectAnswer) {
            cellScore += 10;
            hasCorrectAnswer = true;
          }
          break; // بعد از پاسخ درست، بقیه پاسخ‌ها مهم نیست
        } else {
          // پاسخ اشتباه -۵ (فقط اگر هنوز پاسخ درست نداده)
          if (!hasCorrectAnswer) {
            cellScore -= 5;
          }
        }
      }

      score += cellScore;
    });

    console.log('🎯 امتیاز کل محاسبه شد:', score);
    setTotalScore(Math.max(0, score));
  };

  const handleCellChange = (cellId, answer) => {
    if (!puzzle) return;

    const correctAnswers = puzzle.correct_answers;
    const correctAnswer = correctAnswers[cellId];

    console.log('🔄 تغییر سلول:', cellId, 'پاسخ:', answer, 'صحیح:', correctAnswer);

    // آپدیت userAnswers برای نمایش
    const newAnswers = { ...userAnswers };
    if (answer === '') {
      delete newAnswers[cellId];
    } else {
      newAnswers[cellId] = answer;
    }
    setUserAnswers(newAnswers);

    // آپدیت تاریخچه پاسخ‌ها
    const newHistory = { ...answerHistory };
    
    if (!newHistory[cellId]) {
      newHistory[cellId] = [];
    }
    
    // اضافه کردن پاسخ جدید به تاریخچه
    newHistory[cellId].push(answer);
    setAnswerHistory(newHistory);

    console.log('📝 تاریخچه به‌روز شد:', newHistory[cellId]);
  };

  // تابع برای ثبت امتیاز نهایی
  const submitFinalScore = async () => {
    try {
      const response = await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // کاربر فعلی (test_user)
          score: totalScore,
          timeSpent: timeSpent
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`🏆 امتیاز شما ثبت شد! \nامتیاز: ${totalScore} \nزمان: ${formatTime(timeSpent)}`);
      }
    } catch (error) {
      console.error('خطا در ثبت امتیاز:', error);
      alert('❌ خطا در ثبت امتیاز. لطفاً دوباره تلاش کنید.');
    }
  };

  // تابع برای فرمت کردن زمان
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // تابع برای بررسی آیا همه سلول‌ها پر شده‌اند
  const isPuzzleComplete = () => {
    if (!puzzle) return false;
    
    const correctAnswers = puzzle.correct_answers;
    const totalCells = Object.keys(correctAnswers).length;
    const filledCells = Object.keys(userAnswers).length;
    
    return totalCells === filledCells;
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
              disabled={!isPuzzleComplete()}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                isPuzzleComplete() 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              ثبت امتیاز
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
                {isPuzzleComplete() ? '✅' : '⏳'}
              </div>
              <div className="text-sm text-yellow-800">
                {isPuzzleComplete() ? 'تکمیل شده' : 'در حال انجام'}
              </div>
            </div>
          </div>

          {isPuzzleComplete() && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center">
              <span className="font-bold text-green-800">🎉 تبریک! شما پازل امروز را کامل کردید!</span>
            </div>
          )}
        </div>

        {/* نمایش دیباگ */}
        <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
          <details>
            <summary className="cursor-pointer font-bold">اطلاعات دیباگ</summary>
            <div className="mt-2 space-y-1">
              <div>امتیاز کل: {totalScore}</div>
              <div>تعداد سلول‌های پر: {Object.keys(userAnswers).length}</div>
              <div>زمان سپری شده: {timeSpent} ثانیه</div>
              <div>تاریخچه پاسخ‌ها: {JSON.stringify(answerHistory)}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}