import { bingoList_v10_3_2 } from "./__testData__/bingoList_v10_3_2";
import { bingoList_v10_4 } from "./__testData__/bingoList_v10_4";
import { getChangeLog } from "../../tools/changeLog/getChangeLog";

describe("changeLog", () => {
  it("generates the correct changelog", () => {
    const logs = getChangeLog(bingoList_v10_3_2.normal, bingoList_v10_4.normal);

    expect(logs).toMatchSnapshot();
  });

  it("does not display anything when there are no changes", () => {
    const logs = getChangeLog(bingoList_v10_4.normal, bingoList_v10_4.normal);

    expect(logs).toHaveLength(0);
  });
});
