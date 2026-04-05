export const TASK_POSITION_STEP = 1000;

export function compareTasksByPosition(left: { position: number }, right: { position: number }) {
  return left.position - right.position;
}
