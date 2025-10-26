'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedDate]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?date=${selectedDate}&limit=20`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('خطا در دریافت لیدربرد:', error);
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

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-400 text-yellow-800';
      case 2: return 'bg-gray-400 text-gray-800';
      case 3: return 'bg-orange-400 text-orange-800';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-lg">
            ← بازگشت به خانه
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">🏆 جدول امتیازات</h1>
          <div className="w-20"></div>
        </div>

        {/* فیلتر تاریخ */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center gap-4">
            <label className="font-bold">تاریخ:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <button
              onClick={loadLeaderboard}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              بروزرسانی
            </button>
          </div>
        </div>

        {/* جدول لیدربرد */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">در حال بارگذاری...</div>
          ) : leaderboard?.players?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {/* هدر */}
              <div className="bg-gray-50 px-6 py-4 grid grid-cols-12 gap-4 font-bold text-gray-700">
                <div className="col-span-1">رتبه</div>
                <div className="col-span-5">بازیکن</div>
                <div className="col-span-3">امتیاز</div>
                <div className="col-span-3">زمان</div>
              </div>
              
              {/* لیست بازیکنان */}
              {leaderboard.players.map((player, index) => (
                <div
                  key={player.user_id}
                  className={`px-6 py-4 grid grid-cols-12 gap-4 items-center ${
                    player.user_id === 1 ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="col-span-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getRankColor(player.rank)}`}>
                      {player.rank}
                    </div>
                  </div>
                  <div className="col-span-5">
                    <div className="font-bold">{player.username}</div>
                    {player.user_id === 1 && (
                      <div className="text-xs text-blue-600">(شما)</div>
                    )}
                  </div>
                  <div className="col-span-3">
                    <span className="text-lg font-bold text-green-600">
                      {player.score}
                    </span>
                  </div>
                  <div className="col-span-3 text-gray-600">
                    {formatTime(player.time_spent)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              هیچ امتیازی برای این تاریخ ثبت نشده است.
            </div>
          )}
        </div>

        {/* آمار */}
        {leaderboard && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            تعداد بازیکنان: {leaderboard.totalPlayers} نفر
          </div>
        )}
      </div>
    </div>
  );
}