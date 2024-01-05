import { getBingoList } from "oot-bingo-lists";
import {
  analyzeFrequencies,
  printFrequencies,
} from "../tools/frequencyAnalysis/frequencyAnalysis";
import { getChangeLog } from "../tools/changeLog/getChangeLog";
import { generateBingoBoard } from "oot-bingo-generator";
import { exampleBingoList } from "./exampleBingoList";
import { DEFAULT_PROFILES } from "oot-bingo-generator/build/constants/profiles";

async function main() {
  // Write your own code here! The examples below show how to generate cards, and how to use the bingo tools
  // You can run this file with `npm start`

  // Generate a board
  const board = generateBingoBoard(exampleBingoList, "normal", 112233);
  console.log(
    `Generated after ${board?.iterations} iteration(s): ${board?.goalNames.join(", ")}\n`,
  );

  // Frequency analysis of a bingo version
  const frequencies = await analyzeFrequencies(
    exampleBingoList,
    10000,
    "normal",
    33,
    16,
    DEFAULT_PROFILES.blackout,
  );
  printFrequencies(frequencies);

  // Generate changelog between two bingo versions
  const logs = getChangeLog(
    getBingoList("v10.3.1").normal,
    getBingoList("v10.3.2").normal,
  );
  for (const log of logs) {
    console.log(log);
  }
}

main().then();
