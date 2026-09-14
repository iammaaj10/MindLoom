export interface SM2State {
  repetitions: number;
  easeFactor: number;
  interval: number; // in days
}

/**
 * SuperMemo-2 Algorithm Implementation
 *
 * @param quality Quality of the response (0-5 scale):
 * 5 - perfect response
 * 4 - correct response after a hesitation
 * 3 - correct response recalled with serious difficulty
 * 2 - incorrect response; where the correct one seemed easy to recall
 * 1 - incorrect response; the correct one remembered
 * 0 - complete blackout
 *
 * @param previousState The previous SM-2 state for this item
 * @returns The new SM-2 state
 */
export function calculateSM2(quality: number, previousState: SM2State): SM2State {
  let { repetitions, easeFactor, interval } = previousState;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Calculate new ease factor (E-Factor)
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  return {
    repetitions,
    easeFactor,
    interval,
  };
}
