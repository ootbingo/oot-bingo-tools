# OoT Bingo Tools

![image](https://img.shields.io/npm/v/oot-bingo-tools)


A library of functions to be used in combination with
the [oot-bingo-generator](https://github.com/ootbingo/oot-bingo-generator)
and [oot-bingo-lists](https://github.com/ootbingo/oot-bingo-lists) packages. It includes tools to analyze frequencies of
goals, and differences between goal lists.

## Install

```
npm install --save oot-bingo-tools
```

## Usage

### Frequency analysis

`async analyzeFrequencies(bingoList, numberOfBoards, mode = "normal", startSeed = 0, numberOfWorkers = 8, profile = undefined)`

Perform a frequency analysis on a bingo version using `analyzeFrequencies()`.
Specify how many boards it should generate, and it calculates how often goals occur on these boards.
To make it faster, the board generation tasks are performed in parallel.
Adjust the `numberOfWorkers` parameter to specify how many threads should be used.
For the bingoList argument, you can either supply your own goal list, or import one from the `oot-bingo-lists`
package.
Note that the function is *async*, so it should be be awaited.

The function returns an object containing the frequencies, and a meta object with data about the generation
process (like how many boards failed, the average iterations needed per board, etc).

Use the accompanying `printFrequencies()` function to pretty print the results.

#### Example

```ts
import { analyzeFrequencies, printFrequencies } from 'oot-bingo-tools';
import { getBingoList } from 'oot-bingo-lists';

async function main() {
  const frequencyResult = await analyzeFrequencies(getBingoList("v10.4").normal, 1000, "normal");
  printFrequencies(frequencyResult);
}

main();
```

### Changelog

`getChangeLog(goalList1, goalList2)`

Print the changelog containing all the changes between two bingo versions.
The first argument should be the 'before' goal list, and the second argument the 'after'.
You can either supply your own goal lists, or import existing ones from the `oot-bingo-lists` package.

Use the accompanying `printChangeLog()` function to pretty print the results.

#### Example

```ts
import { getChangeLog, printChangeLog } from 'oot-bingo-tools';
import { getBingoList } from 'oot-bingo-lists';

const logs = getChangeLog(getBingoList("v10.3.2").normal, getBingoList("v10.4").normal);
printChangeLog(logs);
```