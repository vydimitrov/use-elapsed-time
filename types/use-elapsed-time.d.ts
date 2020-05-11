export interface ElapsedTimeReturnValue {
  /** Current elapsed time in seconds */
  elapsedTime: number
  /** Reset method to reset the elapsed time and start over from the "startAt" value */
  reset: (newStartAt: number) => void
}

/** Optional configuration object */
export interface Options {
  /** Animation duration in milliseconds */
  duration?: number
  /** Start the animation at provided time in milliseconds. Default: 0 */
  startAt?: number
  /** Reset elapsed time when the duration changes. Default: false */
  shouldResetOnDurationChange?: number
  /**
   * On animation complete event handler. It can be used to restart the animation by returning an array
   * where the first argument "shouldRepeat" indicates if the loop should start over
   * and second argument "delay" specifies the delay before looping again in milliseconds. The third argument set new startAt value
   * Default: [false, 0, 0]
   *
   */
  onComplete?: (totalElapsedTime: number) => void | [boolean, number] // [shouldRepeat: boolean, delay: number]
}

export function useElapsedTime(
  isPlaying: boolean,
  options?: Options
): ElapsedTimeReturnValue
