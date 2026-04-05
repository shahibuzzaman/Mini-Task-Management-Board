import { describe, expect, it } from "vitest";
import { getInsertionPosition } from "./get-insertion-position";

describe("getInsertionPosition", () => {
  it("returns the default step when the column is empty", () => {
    expect(
      getInsertionPosition({
        previousPosition: undefined,
        nextPosition: undefined,
      }),
    ).toBe(1000);
  });

  it("returns a midpoint between neighboring tasks", () => {
    expect(
      getInsertionPosition({
        previousPosition: 1000,
        nextPosition: 2000,
      }),
    ).toBe(1500);
  });

  it("returns a position after the previous task when inserting at the end", () => {
    expect(
      getInsertionPosition({
        previousPosition: 3000,
        nextPosition: undefined,
      }),
    ).toBe(4000);
  });
});
