export const PlayerState = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
} as const

export type PlayerState = (typeof PlayerState)[keyof typeof PlayerState]
