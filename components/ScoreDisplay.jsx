'use client';

export default function ScoreDisplay({ score }) {
  return (
    <div className="bg-green-100 border-2 border-green-300 p-3 rounded-lg">
      <div className="text-sm text-green-700">امتیاز</div>
      <div className="text-2xl font-bold text-green-800">{score}</div>
    </div>
  );
}