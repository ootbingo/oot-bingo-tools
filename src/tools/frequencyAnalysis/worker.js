/* eslint-disable @typescript-eslint/no-var-requires */
const { parentPort, workerData } = require("worker_threads");
const { generateBingoBoard } = require("oot-bingo-generator");

const handleMessage = (message) => {
  const seed = message.seed;

  const bingoList = workerData.bingoList;

  const board = generateBingoBoard(bingoList, "normal", seed);

  parentPort.postMessage({ seed: seed, board: board });
};

parentPort.on("message", handleMessage);
