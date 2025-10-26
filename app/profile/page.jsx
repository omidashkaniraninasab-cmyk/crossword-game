'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats?userId=1');
      if (!response.ok) {
        throw new Error('خطا در دریافت آمار');
      }
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error('خطا در دریافت آمار:', error);
      // داده پیش‌فرض در صورت خطا
      setUserStats({
        dailyRank: 3,
        history: [
          { puzzle_date: new Date().toISOString().split('T')[0], score: 185, time_spent: 450 },
          { puzzle_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], score: 165, time_spent: 480 }
        ],
        totalStats: {
          total_puzzles: 6,
          avg_score: 175,
          best_score: 200,
          total_score: 1045
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-lg">
            ← بازگشت به خانه
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">👤 پروفایل من</h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* کارت آمار کلی */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">📊 آمار کلی</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>تعداد بازی:</span>
                <span className="font-bold">{userStats?.totalStats?.total_puzzles || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>میانگین امتیاز:</span>
                <span className="font-bold text-green-600">
                  {Math.round(userStats?.totalStats?.avg_score) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>بهترین امتیاز:</span>
                <span className="font-bold text-yellow-600">
                  {userStats?.totalStats?.best_score || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>مجموع امتیازها:</span>
                <span className="font-bold text-blue-600">
                  {userStats?.totalStats?.total_score || 0}
                </span>
              </div>
            </div>
          </div>

          {/* کارت رتبه امروز */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">🏆 عملکرد امروز</h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {userStats?.dailyRank ? `#${userStats.dailyRank}` : '-'}
              </div>
              <div className="text-gray-600">رتبه امروز</div>
              {userStats?.history?.[0] && (
                <>
                  <div className="mt-4 text-lg font-bold text-green-600">
                    {userStats.history[0].score} امتیاز
                  </div>
                  <div className="text-sm text-gray-500">
                    زمان: {formatTime(userStats.history[0].time_spent)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* کارت تاریخچه */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">📅 تاریخچه هفته</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userStats?.history && userStats.history.length > 0 ? (
                userStats.history.map((day, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{formatDate(day.puzzle_date)}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-green-600">{day.score}</span>
                      <span className="text-xs text-gray-500">
                        {formatTime(day.time_spent)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  هیچ تاریخچه‌ای موجود نیست
                </div>
              )}
            </div>
          </div>
        </div>

        {/* دکمه‌های اقدام */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link 
            href="/puzzle" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold"
          >
            🎮 شروع بازی جدید
          </Link>
          <Link 
            href="/leaderboard" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold"
          >
            🏆 مشاهده جدول
          </Link>
        </div>
      </div>
    </div>
  );
}