export const TASK_COLUMN_VIRTUALIZATION_THRESHOLD = 30;
export const TASK_CARD_ESTIMATED_HEIGHT = 168;
export const TASK_COLUMN_OVERSCAN = 6;

export function shouldVirtualizeTaskColumn(taskCount: number): boolean {
  return taskCount >= TASK_COLUMN_VIRTUALIZATION_THRESHOLD;
}
