const { parentPort, workerData } = require("worker_threads");
const { generateBingoBoard } = require("oot-bingo-generator");

const handleMessage = (message) => {
  const seed = message.seed;

  const mode = workerData.mode;
  const profile = workerData.profile;
  const bingoList = workerData.bingoList;

  const board = generateBingoBoard(bingoList, mode, seed, profile);

  parentPort.postMessage({ seed, board });
};

parentPort.on("message", handleMessage);
