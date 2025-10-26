import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId, puzzleId, cellId, answer } = await request.json();

    console.log('📝 دریافت پاسخ:', { userId, puzzleId, cellId, answer });

    const correctAnswers = {
      "0-0": "ز", "0-2": "ن", "0-4": "ه",
      "1-1": "ب", "1-3": "ق", 
      "2-0": "آ", "2-4": "س",
      "3-1": "ش", "3-3": "ب",
      "4-0": "ت", "4-2": "م"
    };

    const isCorrect = correctAnswers[cellId] === answer;
    
    return NextResponse.json({ 
      success: true, 
      isCorrect, 
      newScore: 0, // فعلاً 0 برگردون
      correctAnswer: isCorrect ? null : correctAnswers[cellId]
    });

  } catch (error) {
    console.error('❌ خطا در ثبت پاسخ:', error);
    return NextResponse.json(
      { error: 'خطای سرور در ثبت پاسخ' },
      { status: 500 }
    );
  }
}