import { SquareWithGoal } from "oot-bingo-generator/build/types/board";
import { BingoBoard } from "oot-bingo-generator/build/bingoBoard";

export interface WorkerResult {
  seed: number;
  // Workers just return the object, not the class instance
  board: { _squares: SquareWithGoal[]; _iterations: number } | undefined;
}

export interface GenerationResult {
  seed: number;
  iterations: number;
  board: BingoBoard;
}

export interface BoardResult {
  seed: number;
  iterations: number;
  board: BingoBoard;
}

export interface GeneratedBoardsMeta {
  iterations: { max: number; average: number };
  attempts: { successes: number; fails: number; total: number };
}

export interface FrequencyAnalysisResult {
  frequencies: { [key: string]: number },
  meta: GeneratedBoardsMeta,
}