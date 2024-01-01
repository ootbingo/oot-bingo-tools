import { Worker } from "worker_threads";
import path from "node:path";
import { BingoList } from "oot-bingo-generator/build/types/goalList";
import { BingoBoard } from "oot-bingo-generator/build/bingoBoard";

interface GenerationResult {
  seed: number;
  board: { _squares: any[]; _iterations: number } | undefined;
}

interface BoardResult {
  seed: number;
  board: BingoBoard;
}

export function generateBoards(
  numberOfBoards = 1000,
  numberOfWorkers = 4,
  bingoList: BingoList,
): Promise<BoardResult[]> {
  const startTime = performance.now();

  return new Promise<BoardResult[]>((resolve) => {
    const workers = createWorkers(
      numberOfWorkers,
      { bingoList: bingoList },
      (message: GenerationResult, workerIndex: number) =>
        handleResult(message, workerIndex),
    );

    let workload = 0;
    const workloadMax = numberOfBoards;

    const results: GenerationResult[] = [];

    workers.forEach((worker) => worker.postMessage({ seed: workload++ }));

    const handleResult = (message: GenerationResult, workerIndex: number) => {
      results.push(message);

      if (workload < workloadMax) {
        workers[workerIndex].postMessage({ seed: workload++ });
      }

      if (results.length >= workloadMax) {
        stopWorkers(workers);

        if (results.length < numberOfBoards) {
          console.log(
            `${numberOfBoards - results.length} boards failed to generate, using ${
              results.length
            } for this balance step`,
          );
        }

        const successResults = results
          .sort((a, b) => a.seed - b.seed)
          .map((result): BoardResult | undefined => {
            return (
              result.board && {
                seed: result.seed,
                board: result.board
                  ? new BingoBoard(result.board._squares, result.board._iterations)
                  : undefined,
              }
            );
          })
          .filter((result) => !!result.board);

        const boards = successResults.map((result) => result.board);
        const allIterations: number[] = boards.map((board) => board.iterations);
        const executionTime = performance.now() - startTime;
        console.log(
          `Generated ${successResults.length} boards in ${(executionTime / 1000).toFixed(
            3,
          )}s (average iterations = ${average(allIterations)})`,
        );
        resolve(successResults);
      }
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

function average(numbers: number[]) {
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}
