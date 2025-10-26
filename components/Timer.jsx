'use client';
import { useState, useEffect } from 'react';

export default function Timer() {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []); // بدون وابستگی به onTimeUpdate

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-100 p-3 rounded-lg inline-block">
      <span className="font-mono text-xl font-bold">{formatTime(elapsedTime)}</span>
    </div>
  );
}