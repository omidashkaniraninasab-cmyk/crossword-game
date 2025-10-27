'use client';
import { useState, useEffect } from 'react';
import PuzzleGrid from '@/components/PuzzleGrid';
import ClueList from '@/components/ClueList';
import ScoreDisplay from '@/components/ScoreDisplay';

export default function HomePage() {
  const [puzzle, setPuzzle] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [answerHistory, setAnswerHistory] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPuzzleLocked, setIsPuzzleLocked] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);

  // بارگذاری همه داده‌ها
  useEffect(() => {
    loadAllData();
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
      loadAllData(); // رفرش آمار
    }
  }, [userAnswers]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // بارگذاری موازی همه داده‌ها
      const [puzzleRes, leaderboardRes, statsRes] = await Promise.all([
        fetch('/api/puzzle'),
        fetch('/api/leaderboard?limit=5'),
        fetch('/api/user/stats?userId=1')
      ]);

      const puzzleData = await puzzleRes.json();
      const leaderboardData = await leaderboardRes.json();
      const statsData = statsRes.ok ? await statsRes.json() : null;

      setPuzzle(puzzleData);
      setLeaderboard(leaderboardData.players || []);
      setUserStats(statsData);
    } catch (error) {
      console.error('خطا در دریافت داده‌ها:', error);
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
        if (answer === '') continue;
        if (answer === correctAnswer) {
          if (!hasCorrectAnswer) {
            cellScore += 10;
            hasCorrectAnswer = true;
          }
          break;
        } else {
          if (!hasCorrectAnswer) cellScore -= 5;
        }
      }
      score += cellScore;
    });

    setTotalScore(Math.max(0, score));
  };

  const isPuzzleComplete = () => {
    if (!puzzle) return false;
    return Object.keys(userAnswers).length === Object.keys(puzzle.correct_answers).length;
  };

  const isAllCorrect = () => {
    if (!puzzle) return false;
    return Object.keys(userAnswers).every(cellId => 
      userAnswers[cellId] === puzzle.correct_answers[cellId]
    );
  };

  const handleCellChange = (cellId, answer) => {
    if (!puzzle || isPuzzleLocked) return;

    const newAnswers = { ...userAnswers };
    if (answer === '') {
      delete newAnswers[cellId];
    } else {
      newAnswers[cellId] = answer;
    }
    setUserAnswers(newAnswers);

    const newHistory = { ...answerHistory };
    if (!newHistory[cellId]) newHistory[cellId] = [];
    newHistory[cellId].push(answer);
    setAnswerHistory(newHistory);
  };

  const submitFinalScore = async () => {
    try {
      await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          score: totalScore,
          timeSpent: timeSpent
        })
      });
      loadAllData(); // رفرش آمار بعد از ثبت
    } catch (error) {
      console.error('خطا در ثبت امتیاز:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">پازل امروز موجود نیست</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* هدر */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">بازی کراس‌ورد</h1>
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <span className="font-mono font-bold">{formatTime(timeSpent)}</span>
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
                {isPuzzleLocked ? '✅ ثبت شده' : 'ثبت امتیاز'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* بخش اصلی - بازی */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
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
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {Object.keys(userAnswers).length}
                    </div>
                    <div className="text-sm text-blue-800">سلول‌های پر</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {Object.values(answerHistory).filter(history => 
                        history.some(answer => answer !== '')
                      ).length}
                    </div>
                    <div className="text-sm text-green-800">سلول‌های فعال</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{totalScore}</div>
                    <div className="text-sm text-purple-800">امتیاز فعلی</div>
                  </div>
                  
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">
                      {isPuzzleLocked ? '🔒' : (isPuzzleComplete() ? '✅' : '⏳')}
                    </div>
                    <div className="text-sm text-yellow-800">
                      {isPuzzleLocked ? 'قفل شده' : (isPuzzleComplete() ? 'تکمیل' : 'در حال انجام')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* سایدبار - لیدربرد و آمار */}
          <div className="w-80 space-y-6">
            {/* لیدربرد */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🏆 برترین‌ها
              </h2>
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div key={player.user_id} className={`flex justify-between items-center p-2 rounded ${
                    player.user_id === 1 ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-800' :
                        index === 1 ? 'bg-gray-400 text-gray-800' :
                        index === 2 ? 'bg-orange-400 text-orange-800' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{player.username}</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* آمار کاربر */}
            <div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    📊 آمار من
  </h2>
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <span className="text-gray-600">مجموع امتیازها:</span>
      <span className="font-bold text-2xl text-blue-600">
        {userStats?.totalStats?.total_score || 0}
      </span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600">تعداد بازی‌ها:</span>
      <span className="font-bold text-xl">
        {userStats?.totalStats?.total_puzzles || 0}
      </span>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>

      {/* پیام تبریک */}
      {showCongratulations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">تبریک می‌گم!</h2>
            <p className="text-gray-600 mb-4">
              شما پازل امروز را با <strong>{totalScore} امتیاز</strong> کامل کردید!
            </p>
            <p className="text-sm text-gray-500 mb-6">زمان: {formatTime(timeSpent)}</p>
            <button 
              onClick={() => setShowCongratulations(false)}
              className="bg-blue-500 text-white w-full py-3 rounded-lg hover:bg-blue-600 transition-colors font-bold"
            >
              ادامۀ بازی
            </button>
          </div>
        </div>
      )}
    </div>
  );
}