import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { tasksQueryKeys } from "../query-keys";
import type { Task } from "../types/task";
import { upsertTaskInTasksCache } from "./upsert-task-in-tasks-cache";

const BOARD_ID = "board-1";

describe("upsertTaskInTasksCache", () => {
  it("replaces an existing task and keeps the column ordered by position", () => {
    const queryClient = new QueryClient();
    const tasks: Task[] = [
      createTask({
        id: "task-a",
        status: "todo",
        position: 1000,
      }),
      createTask({
        id: "task-b",
        status: "todo",
        position: 3000,
      }),
    ];

    queryClient.setQueryData(tasksQueryKeys.list(BOARD_ID), tasks);

    const didPatch = upsertTaskInTasksCache(
      queryClient,
      BOARD_ID,
      createTask({
        id: "task-b",
        status: "todo",
        position: 500,
        updatedAt: "2026-04-06T00:00:00.000Z",
      }),
    );

    expect(didPatch).toBe(true);
    expect(
      queryClient
        .getQueryData<Task[]>(tasksQueryKeys.list(BOARD_ID))
        ?.map((task) => task.id),
    ).toEqual(["task-b", "task-a"]);
  });
});

function createTask(overrides: Partial<Task> & Pick<Task, "id" | "status" | "position">): Task {
  return {
    id: overrides.id,
    boardId: BOARD_ID,
    title: "Task",
    description: "Description",
    status: overrides.status,
    position: overrides.position,
    updatedById: "user-1",
    updatedByName: "Alice",
    createdAt: "2026-04-05T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-05T00:00:00.000Z",
  };
}
