import { Goal, GoalList } from "oot-bingo-generator/build/types/goalList";
import { capitalizeFirstLetter } from "../../utils/utils";

/**
 * Prints the changes between two Bingo goal lists.
 * Example usage: printChangeLog(getBingoList("v10.1").normal, getBingoList("v10.2").normal);
 *
 * @param goalList1 Goal list of the old version (normal or short list, not combined)
 * @param goalList2 Goal list of the new version (normal or short list, not combined)
 */
export function printChangeLog(goalList1: GoalList, goalList2: GoalList): void {
  const goals1 = getFlatGoals(goalList1);
  const goals2 = getFlatGoals(goalList2);

  let allLogs: string[] = [];

  allLogs.concat(getChangedPropsOfGoalListsLogs(goalList1, goalList2));

  // goals added
  const goalsAddedLogs: string[] = [];
  for (const goal2 of goals2) {
    const goal1 = goals1.find((goal1) => goal2.id === goal1.id);
    if (!goal1) {
      goalsAddedLogs.push(`* Goal *${goal2.name}* was added`);
    }
  }
  if (goalsAddedLogs.length > 0) {
    allLogs.push("\n### Added goals");
    allLogs = allLogs.concat(goalsAddedLogs);
  }

  // goals removed
  const goalsRemovedLogs: string[] = [];
  for (const goal1 of goals1) {
    const goal2 = goals2.find((goal2) => goal2.id === goal1.id);
    if (!goal2) {
      goalsRemovedLogs.push(`* Goal *${goal1.name}* was removed`);
    }
  }
  if (goalsRemovedLogs.length > 0) {
    allLogs.push("\n### Removed goals");
    allLogs = allLogs.concat(goalsRemovedLogs);
  }

  // goals changed
  let goalsChangedLogs: string[] = [];
  for (const goal1 of goals1) {
    const goal2 = goals2.find((goal2) => goal2.id === goal1.id);
    if (goal2) {
      goalsChangedLogs = goalsChangedLogs.concat(
        getChangedPropsOfGoalsLogs(goal1, goal2),
      );
    }
  }
  if (goalsChangedLogs.length > 0) {
    allLogs.push("\n### Changed goals");
    allLogs = allLogs.concat(goalsChangedLogs);
  }

  for (const log of allLogs) {
    console.log(log);
  }
  if (allLogs.length === 0) {
    console.log("No changes detected between these goal lists");
  }
}

function getChangedPropsOfGoalsLogs(goal1: Goal, goal2: Goal): string[] {
  let logs: string[] = [`\n**${goal2.name}**`];

  // props changed
  for (const prop of ["name", "jp", "skill", "time"] as const) {
    if (goal1[prop] !== goal2[prop]) {
      logs.push(`* Changed **${prop}** from **${goal1[prop]}** to **${goal2[prop]}**`);
    }
  }

  // types/subtypes/rowtypes changed
  for (const synergyType of ["types", "subtypes", "rowtypes"] as const) {
    const synergyTypeStr = synergyType.slice(0, -1);
    const synergies1 = goal1[synergyType];
    const synergies2 = goal2[synergyType];

    logs = logs.concat(getChangedPropsLogs(synergyTypeStr, synergies1, synergies2));
  }

  if (logs.length <= 1) {
    return [];
  }
  return logs;
}

function getChangedPropsOfGoalListsLogs(
  goalList1: GoalList,
  goalList2: GoalList,
): string[] {
  const logs: string[] = [];

  for (const goalListPropType of ["synfilters", "rowtypes"]) {
    const propsLogs = logs.concat(
      getChangedPropsLogs(
        goalListPropType,
        goalList1[goalListPropType],
        goalList2[goalListPropType],
      ),
    );
    if (propsLogs.length > 0) {
      logs.push(`\n### ${capitalizeFirstLetter(goalListPropType)}`);
      logs.concat(propsLogs);
    }
  }
  return logs;
}

function getChangedPropsLogs(
  propsTypeName: string,
  props1: {
    [key: string]: string | number;
  },
  props2: {
    [key: string]: string | number;
  },
) {
  const logs: string[] = [];
  for (const prop in props2 || {}) {
    if (!(prop in (props1 || {}))) {
      logs.push(`* Added ${propsTypeName} **${prop}** with value **${props2[prop]}**`);
      continue;
    }
    if (props2[prop] !== props1[prop]) {
      logs.push(
        `* Changed ${propsTypeName} **${prop}** from **${props1[prop]}** to **${props2[prop]}**`,
      );
    }
  }
  for (const filter in props1 || {}) {
    if (!(filter in (props2 || {}))) {
      logs.push(`* Removed ${propsTypeName} **${filter}** (was **${props1[filter]}**)`);
    }
  }

  return logs;
}

function getFlatGoals(goalList: GoalList): Goal[] {
  const flatGoals: Goal[] = [];
  for (let diff = 0; diff < 50; diff++) {
    for (const goal of goalList[diff.toString()]) {
      flatGoals.push(goal);
    }
  }
  return flatGoals.sort((a, b) => b.difficulty - a.difficulty);
}
