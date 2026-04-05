import { describe, expect, it } from "vitest";
import {
  TASK_COLUMN_VIRTUALIZATION_THRESHOLD,
  shouldVirtualizeTaskColumn,
} from "@/features/tasks/lib/task-virtualization";

describe("shouldVirtualizeTaskColumn", () => {
  it("returns false below the virtualization threshold", () => {
    expect(
      shouldVirtualizeTaskColumn(TASK_COLUMN_VIRTUALIZATION_THRESHOLD - 1),
    ).toBe(false);
  });

  it("returns true at and above the virtualization threshold", () => {
    expect(
      shouldVirtualizeTaskColumn(TASK_COLUMN_VIRTUALIZATION_THRESHOLD),
    ).toBe(true);
    expect(
      shouldVirtualizeTaskColumn(TASK_COLUMN_VIRTUALIZATION_THRESHOLD + 10),
    ).toBe(true);
  });
});
