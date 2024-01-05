import { BingoList } from "oot-bingo-generator/build/types/goalList";
import { Mode, Profile } from "oot-bingo-generator/build/types/settings";
import { generateBoards } from "./generateBoards";
import { sortObject } from "../../util/utils";
import { FrequencyAnalysisResult } from "./types/frequencyAnalysisTypes";

/**
 * Performs an analysis of how frequent each goal is in a certain Bingo version.
 * It does so by generating a certain amount of boards, and then counts on how many boards each goal appears.
 * The generation of the boards is performed in parallel.
 * Note that this is an async function that should be awaited to use the results.
 * @param bingoList Goal list of a bingo version
 * @param numberOfBoards Amount of boards to generate; the more, the more accurate the results
 * @param [mode] Bingo mode ('normal', 'short', 'blackout', or 'shortBlackout')
 * @param [startSeed] The first seed it starts generating boards with. E.g. if this value is 150, and numberOfBoards is 1000,
 * it will generate boards from seed 150 to 1049. Defaults to 0.
 * @param [numberOfWorkers] The amount of worker threads to create for parallel task execution. Optimal value may depend on your hardware. Defaults to 8.
 * @param [profile] The profile that the generator should use.
 */
export async function analyzeFrequencies(
  bingoList: BingoList,
  numberOfBoards: number,
  mode: Mode = "normal",
  startSeed: number = 0,
  numberOfWorkers: number = 8,
  profile?: Profile,
): Promise<FrequencyAnalysisResult> {
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

  const sortedFrequencies = sortObject(frequencies, (a, b) => b.value - a.value);

  return { frequencies: sortedFrequencies, meta };
}

/**
 * Pretty prints a frequency analysis result object
 * @param frequenciesResult Object containing frequencies and board generation meta information.
 * Can be obtained by running the analyzeFrequencies function.
 */
export function printFrequencies(
  frequenciesResult: FrequencyAnalysisResult
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
