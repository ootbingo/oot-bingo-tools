import { generateBoards } from "./generateBoards";
import { BingoList } from "oot-bingo-generator/build/types/goalList";
import { Mode, Profile } from "oot-bingo-generator/build/types/settings";

export async function analyzeFrequencies(
  bingoList: BingoList,
  numberOfBoards: number,
  mode: Mode = "normal",
  startSeed: number = 0,
  numberOfWorkers: number = 8,
  profile?: Profile,
) {
  const frequencies: { [key: string]: number } = {};

  console.log(
    `Analyzing goal frequency of ${numberOfBoards} boards, with mode ${mode}, starting from seed ${startSeed}...`,
  );

  const { results, meta } = await generateBoards(
    bingoList,
    numberOfBoards,
    mode,
    startSeed,
    numberOfWorkers,
    profile,
  );
  const boards = results.map((result) => result.board);

  for (const board of boards) {
    for (const goal of board.goals) {
      if (!Object.keys(frequencies).includes(goal.name)) {
        frequencies[goal.name] = 0;
      }
      frequencies[goal.name] = frequencies[goal.name] += 1;
    }
  }

  return { frequencies, meta };
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
