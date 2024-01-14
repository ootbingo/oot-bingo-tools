import { bingoList_v10_3_2 } from "./__testData__/bingoList_v10_3_2";
import { bingoList_v10_4 } from "./__testData__/bingoList_v10_4";
import { printChangeLog } from "../../tools/changeLog/printChangeLog";

describe("changeLog", () => {
  const consoleSpy = jest.spyOn(console, "log");

  beforeEach(() => {
    consoleSpy.mockReset();
  });

  it("prints the correct changelog of a normal version", () => {
    printChangeLog(bingoList_v10_3_2.normal, bingoList_v10_4.normal);

    expect(consoleSpy.mock.calls).toMatchSnapshot();
  });

  it("prints the correct changelog of a short version", () => {
    printChangeLog(bingoList_v10_3_2.short, bingoList_v10_4.short);

    expect(consoleSpy.mock.calls).toMatchSnapshot();
  });

  it("displays a message when there are no changes", () => {
    printChangeLog(bingoList_v10_4.normal, bingoList_v10_4.normal);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      "No changes detected between these goal lists",
    );
  });
});
