const POSITION_STEP = 1000;

type GetInsertionPositionParams = {
  previousPosition?: number;
  nextPosition?: number;
};

export function getInsertionPosition({
  previousPosition,
  nextPosition,
}: GetInsertionPositionParams): number {
  if (previousPosition == null && nextPosition == null) {
    return POSITION_STEP;
  }

  if (previousPosition == null) {
    if (nextPosition == null) {
      return POSITION_STEP;
    }

    return nextPosition - POSITION_STEP;
  }

  if (nextPosition == null) {
    return previousPosition + POSITION_STEP;
  }

  return previousPosition + (nextPosition - previousPosition) / 2;
}
