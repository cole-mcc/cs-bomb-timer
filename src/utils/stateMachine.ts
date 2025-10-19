export const PLANT_TIME_DEFAULT = 4000;
export const DEFUSE_TIME_DEFAULT = 10000;
export const BOMB_TIMER_DEFAULT = 40000;

export const BombStatus = {
    IDLE: 'idle',
    PLANTING: 'planting',
    PLANTED: 'planted',
    DEFUSING: 'defusing',
    DEFUSED: 'defused',
    EXPLODED: 'exploded',
} as const;

export type BombEvent =
    | { type: 'PLANT_START'; time: number }
    | { type: 'PLANT_CANCEL' }
    | { type: 'PLANT_COMPLETE'; time: number }
    | { type: 'DEFUSE_START'; time: number }
    | { type: 'DEFUSE_CANCEL' }
    | { type: 'DEFUSE_COMPLETE' }
    | { type: 'COUNTDOWN_EXPIRED' }
    | { type: 'RESET' };

export type BombStatus = (typeof BombStatus)[keyof typeof BombStatus];

export interface BombContext {
    // when current hold (plant/defuse) began; undefined otherwise
    actionStart?: number;

    // the timestamp at which planting finished (start of bomb countdown)
    plantedAt?: number;

    // configurable durations (ms)
    plantDuration: number;
    defuseDuration: number;
    bombTimer: number;
}

export interface BombMachine {
    status: BombStatus;
    context: BombContext;
}

/* Initializes/reset the state machine to its original state */
export function createInitialMachine(
    overrides?: Partial<
        Pick<BombContext, 'plantDuration' | 'defuseDuration' | 'bombTimer'>
    >
): BombMachine {
    return {
        status: BombStatus.IDLE,
        context: {
            actionStart: undefined,
            plantedAt: undefined,
            plantDuration: overrides?.plantDuration ?? PLANT_TIME_DEFAULT,
            defuseDuration: overrides?.defuseDuration ?? DEFUSE_TIME_DEFAULT,
            bombTimer: overrides?.bombTimer ?? BOMB_TIMER_DEFAULT,
        },
    };
}

/* Handles bomb state changes (ex: PLANTED -> DEFUSE_START) */
export function bombReducer(
    machine: BombMachine,
    event: BombEvent
): BombMachine {
    const { status, context } = machine;

    switch (status) {
        case BombStatus.IDLE: {
            if (event.type === 'PLANT_START') {
                return {
                    status: BombStatus.PLANTING,
                    context: { ...context, actionStart: event.time },
                };
            }
            if (event.type === 'RESET') {
                return machine;
            }
            return machine;
        }

        case BombStatus.PLANTING: {
            if (event.type === 'PLANT_CANCEL') {
                return {
                    status: BombStatus.IDLE,
                    context: { ...context, actionStart: undefined },
                };
            }
            if (event.type === 'PLANT_COMPLETE') {
                return {
                    status: BombStatus.PLANTED,
                    context: {
                        ...context,
                        actionStart: undefined,
                        plantedAt: event.time,
                    },
                };
            }
            return machine;
        }

        case BombStatus.PLANTED: {
            if (event.type === 'DEFUSE_START') {
                return {
                    status: BombStatus.DEFUSING,
                    context: { ...context, actionStart: event.time },
                };
            }
            if (event.type === 'COUNTDOWN_EXPIRED') {
                return {
                    status: BombStatus.EXPLODED,
                    context: { ...context, actionStart: undefined },
                };
            }
            return machine;
        }

        case BombStatus.DEFUSING: {
            if (event.type === 'DEFUSE_CANCEL') {
                // stop defusing, return to planted
                return {
                    status: BombStatus.PLANTED,
                    context: { ...context, actionStart: undefined },
                };
            }
            if (event.type === 'DEFUSE_COMPLETE') {
                return {
                    status: BombStatus.DEFUSED,
                    context: {
                        ...context,
                        actionStart: undefined,
                        plantedAt: undefined,
                    },
                };
            }
            return machine;
        }

        case BombStatus.DEFUSED:
        case BombStatus.EXPLODED: {
            if (event.type === 'RESET') {
                return createInitialMachine({
                    plantDuration: context.plantDuration,
                    defuseDuration: context.defuseDuration,
                    bombTimer: context.bombTimer,
                });
            }
            return machine;
        }

        default:
            return machine;
    }
}

/** Time elapsed (ms) since actionStart (planting/defusing), or undefined */
export function getActionElapsed(context: BombContext, now: number): number | undefined {
  if (context.actionStart === undefined) return undefined;
  return Math.max(0, now - context.actionStart);
}

/** Fraction [0..1] for planting progress */
export function getPlantProgress(context: BombContext, now: number): number {
  const elapsed = getActionElapsed(context, now) ?? 0;
  return Math.min(1, elapsed / context.plantDuration);
}

/** Fraction [0..1] for defuse progress */
export function getDefuseProgress(context: BombContext, now: number): number {
  const elapsed = getActionElapsed(context, now) ?? 0;
  return Math.min(1, elapsed / context.defuseDuration);
}

/** Time left on bomb countdown (ms). If not planted, returns full bombTimer. */
export function getBombTimeLeft(context: BombContext, now: number): number {
  if (!context.plantedAt) return context.bombTimer;
  const elapsed = Math.max(0, now - context.plantedAt);
  return Math.max(0, context.bombTimer - elapsed);
}