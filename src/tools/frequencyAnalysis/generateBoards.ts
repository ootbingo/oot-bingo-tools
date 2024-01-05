import { Worker } from "worker_threads";
import path from "node:path";
import { BingoList } from "oot-bingo-generator/build/types/goalList";
import { BingoBoard } from "oot-bingo-generator/build/bingoBoard";
import { Mode, Profile } from "oot-bingo-generator/build/types/settings";
import { MAX_ITERATIONS } from "oot-bingo-generator/build/constants/board";
import {
  BoardResult,
  GeneratedBoardsMeta,
  GenerationResult,
  WorkerResult,
} from "./types/frequencyAnalysisTypes";
import { average, roundToDecimals } from "../../utils/utils";

// Log progress after x board generations
const logFrequency = 500;

export function generateBoards(
  bingoList: BingoList,
  numberOfBoards: number,
  mode: Mode,
  startSeed: number,
  numberOfWorkers: number,
  profile?: Profile,
): Promise<{ results: BoardResult[]; meta: GeneratedBoardsMeta }> {
  const startTime = performance.now();

  return new Promise<{ results: BoardResult[]; meta: GeneratedBoardsMeta }>(
    (resolve) => {
      const workers = createWorkers(
        numberOfWorkers,
        { bingoList, mode, profile },
        (message: WorkerResult, workerIndex: number) =>
          handleResult(message, workerIndex),
      );

      let currentSeed = startSeed;
      const maxSeed = startSeed + numberOfBoards;

      const results: GenerationResult[] = [];

      workers.forEach((worker) => worker.postMessage({ seed: currentSeed++ }));

      const handleResult = (message: WorkerResult, workerIndex: number) => {
        const generationResult: GenerationResult = {
          ...message,
          iterations: message.board
            ? message.board._iterations
            : MAX_ITERATIONS,
          board: message.board
            ? new BingoBoard(message.board._squares, message.board._iterations)
            : undefined,
        };
        results.push(generationResult);

        if (currentSeed < maxSeed) {
          workers[workerIndex].postMessage({
            seed: currentSeed++,
            mode,
            profile,
          });
        }

        if (
          results.length % logFrequency === 0 &&
          results.length > 0 &&
          results.length < numberOfBoards
        ) {
          console.log(`Generating... (processed ${results.length} boards)`);
        }

        if (results.length >= numberOfBoards) {
          onDone();
        }
      };

      const onDone = () => {
        stopWorkers(workers);

        const successResults = results
          .sort((a, b) => a.seed - b.seed)
          .filter((result): result is BoardResult => !!result.board);

        const allIterations: number[] = results.map(
          (result) => result.iterations,
        );

        const meta = {
          iterations: {
            max: Math.max(...allIterations),
            average: roundToDecimals(average(allIterations), 3),
          },
          attempts: {
            successes: successResults.length,
            fails: results.length - successResults.length,
            total: results.length,
          },
        };

        const executionTimeInMs = performance.now() - startTime;
        console.log(
          `Finished, generated ${
            meta.attempts.successes
          } boards in ${roundToDecimals(
            executionTimeInMs / 1000,
            3,
          )}s (average iterations = ${meta.iterations.average}${
            meta.attempts.fails > 0
              ? ` (including ${meta.attempts.fails} failed boards)`
              : ""
          })\n`,
        );
        resolve({ results: successResults, meta });
      };
    },
  );
}

function createWorkers<TWorkerData, TMessage>(
  numberOfWorkers: number,
  workerData: TWorkerData,
  handleMessage: (message: TMessage, workerIndex: number) => void,
) {
  const workers: Worker[] = [];

  for (let workerIndex = 0; workerIndex < numberOfWorkers; workerIndex++) {
    const worker = new Worker(path.resolve(__dirname, "worker.js"), {
      workerData: workerData,
    });
    workers.push(worker);
    worker.on("message", (message) => handleMessage(message, workerIndex));
  }

  return workers;
}

function stopWorkers(workers: Worker[]): void {
  workers.forEach((worker) => worker.terminate());
}
