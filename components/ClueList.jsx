'use client';

export default function ClueList({ clues }) {
  if (!clues) return null;

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-xl font-bold mb-4 text-green-600">عمودی ↓</h3>
        <div className="space-y-2">
          {clues.down.map((clue, index) => (
            <div key={index} className="flex items-start">
              <span className="font-bold ml-2">{clue.number}.</span>
              <span>{clue.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-600">افقی →</h3>
        <div className="space-y-2">
          {clues.across.map((clue, index) => (
            <div key={index} className="flex items-start">
              <span className="font-bold ml-2">{clue.number}.</span>
              <span>{clue.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}