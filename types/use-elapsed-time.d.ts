export interface ElapsedTimeReturnValue {
  /** Current elapsed time in seconds */
  elapsedTime: number
  /** Reset method to reset the elapsed time and start over from the "startAt" value */
  reset: (newStartAt: number) => void
}

export interface OnComplete {
  /** Indicates if the loop should start over. Default: false */
  shouldRepeat?: boolean
  /** Delay before looping again. Default: 0 */
  delay?: number
  /** New value to start at when repeating. Default: startAt */
  newStartAt?: number
}

/** Optional configuration object */
export interface Options {
  /** Animation duration in milliseconds */
  duration?: number
  /** Start the animation at provided time in milliseconds. Default: 0 */
  startAt?: number
  /** Reset elapsed time when the duration changes. Default: false */
  shouldResetOnDurationChange?: number
  /** On animation complete event handler. It can be used to restart/repeat the animation by returning an object */
  onComplete?: (totalElapsedTime: number) => void | OnComplete
}

export function useElapsedTime(
  isPlaying: boolean,
  options?: Options
): ElapsedTimeReturnValue
