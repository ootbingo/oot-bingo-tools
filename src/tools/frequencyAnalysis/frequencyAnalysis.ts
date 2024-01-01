import { generateBoards } from "./generateBoards";
import { BingoList } from "oot-bingo-generator/build/types/goalList";
import { Mode, Profile } from "oot-bingo-generator/build/types/settings";

export async function analyzeFrequencies(
  numberOfBoards: number,
  bingoList: BingoList,
  mode: Mode,
  startSeed?: number,
  profile?: Profile,
) {
  startSeed = startSeed ?? 0;
  const maxIterations = 100;

  const frequencies: { [key: string]: number } = {};

  console.log(
    `Analyzing goal frequency of ${numberOfBoards} boards, starting at seed ${startSeed}...`,
  );

  // todoo number of workers
  const boardResults = await generateBoards(numberOfBoards, 16, bingoList);
  const boards = boardResults.map((result) => result.board);
  const allIterations = boards.map((board) => board.iterations);
  const numberOfSuccessBoards = boards.length;

  for (const board of boards) {
    for (const goal of board.goals) {
      if (!Object.keys(frequencies).includes(goal.name)) {
        frequencies[goal.name] = 0;
      }
      frequencies[goal.name] = frequencies[goal.name] += 1;
    }
  }

  console.log(`Finished (processed ${numberOfSuccessBoards} boards total)\n`);
  return {
    frequencies: frequencies,
    meta: {
      iterations: {
        max: Math.max(...allIterations),
        average:
          allIterations.length > 0
            ? allIterations.reduce((total, currentValue) => total + currentValue, 0) /
              allIterations.length
            : NaN,
      },
      attempts: {
        successes: numberOfSuccessBoards,
        fails: numberOfBoards - numberOfSuccessBoards,
        total: numberOfBoards,
      },
    },
  };
}

export function printFrequencies(
  frequenciesResult: Awaited<ReturnType<typeof analyzeFrequencies>>,
) {
  const { frequencies, meta } = frequenciesResult;
  const sortedGoalNames = Object.keys(frequencies).sort(function (a, b) {
    return frequencies[b] - frequencies[a];
  });
  let str = "";
  for (const name of sortedGoalNames) {
    str += `${name}: ${frequencies[name]}\n`;
  }

  console.log("META\n------------");
  console.log(
    `Iterations - Max: ${meta.iterations.max}, Average: ${meta.iterations.average}`,
  );
  console.log(
    `Attempts - Successes: ${meta.attempts.successes}, Fails: ${meta.attempts.fails}, Total: ${meta.attempts.total}`,
  );

  console.log("\nGOAL FREQUENCIES\n------------");
  console.log(str);
}
