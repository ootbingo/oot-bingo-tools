import { Worker } from "worker_threads";
import path from "node:path";
import { BingoList } from "oot-bingo-generator/build/types/goalList";
import { BingoBoard } from "oot-bingo-generator/build/bingoBoard";
import { Mode, Profile } from "oot-bingo-generator/build/types/settings";
import { MAX_ITERATIONS } from "oot-bingo-generator/build/constants/board";
import { average } from "../../util/arrayUtils";
import { SquareWithGoal } from "oot-bingo-generator/build/types/board";
import { roundToDecimals } from "../../util/numberUtils";

interface WorkerResult {
  seed: number;
  // Workers just return the object, not the class instance
  board: { _squares: SquareWithGoal[]; _iterations: number } | undefined;
}

interface GenerationResult {
  seed: number;
  iterations: number;
  board: BingoBoard;
}

interface BoardResult {
  seed: number;
  iterations: number;
  board: BingoBoard;
}

interface Meta {
  iterations: { max: number; average: number };
  attempts: { successes: number; fails: number; total: number };
}

export function generateBoards(
  bingoList: BingoList,
  numberOfBoards: number,
  mode: Mode,
  startSeed: number,
  numberOfWorkers: number,
  profile?: Profile,
): Promise<{ results: BoardResult[]; meta: Meta }> {
  const startTime = performance.now();

  return new Promise<{ results: BoardResult[]; meta: Meta }>((resolve) => {
    const workers = createWorkers(
      numberOfWorkers,
      { bingoList, mode, profile },
      (message: WorkerResult, workerIndex: number) => handleResult(message, workerIndex),
    );

    let currentSeed = startSeed;
    const maxSeed = startSeed + numberOfBoards;

    const results: GenerationResult[] = [];

    workers.forEach((worker) => worker.postMessage({ seed: currentSeed++ }));

    const handleResult = (message: WorkerResult, workerIndex: number) => {
      const generationResult: GenerationResult = {
        ...message,
        iterations: message.board ? message.board._iterations : MAX_ITERATIONS,
        board: message.board
          ? new BingoBoard(message.board._squares, message.board._iterations)
          : undefined,
      };
      results.push(generationResult);

      if (currentSeed < maxSeed) {
        workers[workerIndex].postMessage({ seed: currentSeed++, mode, profile });
      }

      if (results.length % 1000 === 0 && results.length > 0) {
        console.log(`Generating... (currently at ${results.length} boards)`);
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

      const allIterations: number[] = results.map((result) => result.iterations);

      const meta = {
        iterations: {
          max: Math.max(...allIterations),
          average: average(allIterations),
        },
        attempts: {
          successes: successResults.length,
          fails: results.length - successResults.length,
          total: results.length,
        },
      };

      const executionTime = performance.now() - startTime;
      console.log(
        `Generated ${meta.attempts.successes} boards in ${roundToDecimals(
          executionTime / 1000,
          3,
        )}s (average iterations = ${meta.iterations.average}${
          meta.attempts.fails > 0
            ? ` (including ${meta.attempts.fails} failed boards)`
            : ""
        })`,
      );
      resolve({ results: successResults, meta });
    };
  });
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
