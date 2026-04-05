import { TASK_POSITION_STEP } from "@/features/tasks/lib/task-ordering";

type GetInsertionPositionParams = {
  previousPosition?: number;
  nextPosition?: number;
};

export function getInsertionPosition({
  previousPosition,
  nextPosition,
}: GetInsertionPositionParams): number {
  if (previousPosition == null && nextPosition == null) {
    return TASK_POSITION_STEP;
  }

  if (previousPosition == null) {
    if (nextPosition == null) {
      return TASK_POSITION_STEP;
    }

    return nextPosition - TASK_POSITION_STEP;
  }

  if (nextPosition == null) {
    return previousPosition + TASK_POSITION_STEP;
  }

  return previousPosition + (nextPosition - previousPosition) / 2;
}
