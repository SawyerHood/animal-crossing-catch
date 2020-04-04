import { monthArrayToRange } from "./AppState";
import _ from "lodash";
test("monthArrayToRange", () => {
  it("converts an array of 12 trues to say All Year", () => {
    expect(monthArrayToRange(_.fill(new Array(12), true))).toBe("All Year");
  });

  it("converts a basic range", () => {
    expect(
      monthArrayToRange([
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ])
    ).toBe("Jan - Feb");
  });

  it("converts a boundry range", () => {
    expect(
      monthArrayToRange([
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
      ])
    ).toBe("Dec - Feb");
  });

  it("converts a disjoint range", () => {
    expect(
      monthArrayToRange([
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        true,
      ])
    ).toBe("May - Jul & Dec - Feb");
  });

  it("converts a value with lots of trues", () => {
    expect(
      monthArrayToRange([
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
      ])
    ).toBe("Jan - Nov");
  });
  it("converts a value that starts with false", () => {
    expect(
      monthArrayToRange([
        false,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
      ])
    ).toBe("Apr - Aug");
  });
});
