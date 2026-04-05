import type { DragOverEvent } from "@dnd-kit/core";
import { describe, expect, it } from "vitest";
import type { Task } from "../types/task";
import { getDragDestination } from "./get-drag-destination";

describe("getDragDestination", () => {
  it("uses the task's current projected status when adjusting index after a cross-column drag", () => {
    const tasks: Task[] = [
      createTask({
        id: "task-b",
        status: "done",
        position: 1000,
      }),
      createTask({
        id: "task-a",
        status: "done",
        position: 1500,
      }),
      createTask({
        id: "task-c",
        status: "done",
        position: 2000,
      }),
    ];

    const event = {
      active: {
        data: {
          current: {
            type: "task",
            taskId: "task-a",
            status: "todo",
          },
        },
        rect: {
          current: {
            translated: {
              top: 12,
            },
          },
        },
      },
      over: {
        data: {
          current: {
            type: "task",
            taskId: "task-c",
            status: "done",
          },
        },
        rect: {
          top: 0,
          height: 10,
        },
      },
    } as unknown as DragOverEvent;

    expect(getDragDestination(tasks, event)).toEqual({
      status: "done",
      index: 2,
    });
  });
});

function createTask(overrides: Pick<Task, "id" | "status" | "position">): Task {
  return {
    id: overrides.id,
    title: "Task",
    description: "Description",
    status: overrides.status,
    position: overrides.position,
    updatedBy: "alice",
    createdAt: "2026-04-05T00:00:00.000Z",
    updatedAt: "2026-04-05T00:00:00.000Z",
  };
}
