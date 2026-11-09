export interface MatchingEvaluationResult {
  isCorrect: boolean;
  matchedCount: number;
  totalPairs: number;
}

export function evaluateMatchingAnswer(
  submitted: string[],
  correctAnswer: string[]
): MatchingEvaluationResult {
  const sortedSubmitted = [...submitted].sort();
  const sortedCorrect = [...correctAnswer].sort();
  const isCorrect =
    sortedSubmitted.length === sortedCorrect.length &&
    sortedSubmitted.every((pair, idx) => pair === sortedCorrect[idx]);

  const matchedCount = submitted.filter((pair) => correctAnswer.includes(pair)).length;

  return {
    isCorrect,
    matchedCount,
    totalPairs: correctAnswer.length,
  };
}
