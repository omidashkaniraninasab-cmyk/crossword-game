import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const samplePuzzle = {
      id: 1,
      date: new Date().toISOString().split('T')[0],
      grid: [
        [
          { number: 1, letter: null }, null, 
          { number: 2, letter: null }, null, 
          { number: 3, letter: null }
        ],
        [
          null, { number: 4, letter: null }, null, 
          { number: 5, letter: null }, null
        ],
        [
          { number: 6, letter: null }, null, null, null, 
          { number: 7, letter: null }
        ],
        [
          null, { number: 8, letter: null }, null, 
          { number: 9, letter: null }, null
        ],
        [
          { number: 10, letter: null }, null, 
          { number: 11, letter: null }, null, null
        ]
      ],
      clues: {
        across: [
          { number: 1, text: "معنای زندگی" },
          { number: 2, text: "کشور شمالی" },
          { number: 3, text: "میوه تابستانی" },
          { number: 6, text: "رنگ آسمان" },
          { number: 7, text: "حیوان خانگی" },
          { number: 10, text: "پایتخت ایران" },
          { number: 11, text: "سیاره قرمز" }
        ],
        down: [
          { number: 1, text: "میوه قرمز" },
          { number: 4, text: "درخت جنگلی" },
          { number: 5, text: "ابزار نوشتن" },
          { number: 8, text: "شهر تاریخی" },
          { number: 9, text: "حیوان درنده" }
        ]
      },
      correct_answers: {
        "0-0": "ز", "0-2": "ن", "0-4": "ه",
        "1-1": "ب", "1-3": "ق", 
        "2-0": "آ", "2-4": "س",
        "3-1": "ش", "3-3": "ب",
        "4-0": "ت", "4-2": "م"
      }
    };

    return NextResponse.json(samplePuzzle);

  } catch (error) {
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}