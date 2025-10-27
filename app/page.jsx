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
  
  // stateهای جدید برای کاربران
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  // بارگذاری همه داده‌ها
  useEffect(() => {
    loadAllData();
    
    // چک کردن کاربر ذخیره شده در localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
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
      const [puzzleRes, leaderboardRes] = await Promise.all([
        fetch('/api/puzzle'),
        fetch('/api/leaderboard?limit=5')
      ]);

      const puzzleData = await puzzleRes.json();
      const leaderboardData = await leaderboardRes.json();

      setPuzzle(puzzleData);
      setLeaderboard(leaderboardData.players || []);
      
      // اگر کاربر لاگین کرده، آمارش رو بگیر
      if (currentUser) {
        const statsRes = await fetch(`/api/user/stats?userId=${currentUser.id}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setUserStats(statsData);
        }
      }
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
    if (!currentUser) {
      alert('لطفاً اول وارد حساب کاربری خود شوید');
      setShowAuthModal(true);
      return;
    }

    try {
      await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          score: totalScore,
          timeSpent: timeSpent
        })
      });
      loadAllData(); // رفرش آمار بعد از ثبت
    } catch (error) {
      console.error('خطا در ثبت امتیاز:', error);
    }
  };

  const handleAuth = async () => {
  // اعتبارسنجی اولیه
  if (!authForm.username || !authForm.password) {
    alert('لطفاً نام کاربری و رمز عبور را وارد کنید');
    return;
  }

  if (authMode === 'register' && !authForm.email) {
    alert('لطفاً ایمیل را وارد کنید');
    return;
  }

  // حالت تست - تا زمانی که API رو نساختیم
  try {
    // شبیه‌سازی API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const testUser = {
      id: Date.now(),
      username: authForm.username,
      email: authForm.email || `${authForm.username}@example.com`
    };
    
    setCurrentUser(testUser);
    localStorage.setItem('currentUser', JSON.stringify(testUser));
    setShowAuthModal(false);
    setAuthForm({ username: '', email: '', password: '' });
    loadAllData();
    
    alert(`✅ ${authMode === 'login' ? 'ورود' : 'ثبت‌نام'} موفقیت‌آمیز بود!`);
    
  } catch (error) {
    alert('خطا در ورود/ثبت‌نام. لطفاً دوباره تلاش کنید.');
  }
};
  const handleLogout = () => {
    setCurrentUser(null);
    setShowUserPanel(false);
    localStorage.removeItem('currentUser');
    setUserStats(null);
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
    <div className="min-h-screen bg-gray-50" onClick={() => showUserPanel && setShowUserPanel(false)}>
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
              
              {/* بخش کاربر */}
              {currentUser ? (
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserPanel(!showUserPanel);
                    }}
                    className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium hidden sm:block">{currentUser.username}</span>
                    <span className="text-blue-600">▼</span>
                  </button>

                  {/* پنل کاربر */}
                  {showUserPanel && (
                    <div className="absolute top-12 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50" onClick={(e) => e.stopPropagation()}>
                      <div className="p-4 border-b border-gray-100 bg-blue-50 rounded-t-lg">
                        <div className="font-bold text-gray-800">{currentUser.username}</div>
                        <div className="text-sm text-gray-600 mt-1">{currentUser.email}</div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">مجموع امتیاز:</span>
                          <span className="font-bold text-lg text-blue-600">
                            {userStats?.totalStats?.total_score || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">تعداد بازی:</span>
                          <span className="font-bold text-gray-800">{userStats?.totalStats?.total_puzzles || 0}</span>
                        </div>
                      </div>
                      
                      <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-100 rounded transition-colors flex items-center gap-2"
                        >
                          <span>🔒</span>
                          <span>خروج از حساب</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold transition-colors"
                >
                  ورود / ثبت‌نام
                </button>
              )}

              <button 
                onClick={submitFinalScore}
                disabled={!isPuzzleComplete() || isPuzzleLocked || !currentUser}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  isPuzzleComplete() && !isPuzzleLocked && currentUser
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {!currentUser ? 'ورود اول' : (isPuzzleLocked ? '✅ ثبت شده' : 'ثبت امتیاز')}
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
                    currentUser && player.user_id === currentUser.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
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
                      {currentUser && player.user_id === currentUser.id && (
                        <span className="text-xs bg-blue-500 text-white px-1 rounded">شما</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-green-600">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* آمار کاربر */}
            {currentUser && (
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
            )}
          </div>
        </div>
      </div>

      {/* مودال ثبت‌نام/ورود */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {authMode === 'login' ? 'ورود به بازی' : 'ثبت‌نام در بازی'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام کاربری
                </label>
                <input
                  type="text"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                  placeholder="نام کاربری خود را وارد کنید"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ایمیل
                  </label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز عبور
                </label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  placeholder="رمز عبور"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={handleAuth}
                  className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold transition-colors"
                >
                  {authMode === 'login' ? 'ورود' : 'ثبت‌نام'}
                </button>
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthForm({ username: '', email: '', password: '' });
                  }}
                  className="bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-bold transition-colors"
                >
                  {authMode === 'login' ? 'ثبت‌نام' : 'ورود'}
                </button>
              </div>
              
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

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