import { useState, useRef, useCallback } from 'react'
import { useIsomorphicEffect } from './useIsomorphicEffect'

type MayBe<T> = T | null

export interface ReturnValue {
  /** Current elapsed time in seconds */
  elapsedTime: number
  /** Reset method to reset the elapsed time and start over. startAt value can be changed by passing newStartAt value */
  reset: (newStartAt?: number) => void
}

export interface OnComplete {
  /** Indicates if the loop should start over. Default: false */
  shouldRepeat?: boolean
  /** Delay in seconds before looping again. Default: 0 */
  delay?: number
  /** Change the startAt value before looping again. Default: startAt value */
  newStartAt?: number
}

export interface Props {
  /** Indicates if the loop to get the elapsed time is running or it is paused */
  isPlaying: boolean
  /** Animation duration in seconds */
  duration?: number
  /** Start the animation at provided time in seconds. Default: 0 */
  startAt?: number
  /** Update interval in seconds. Determines how often the elapsed time value will change. When set to 0 the value will update on each key frame. Default: 0 */
  updateInterval?: number
  /** On animation complete event handler. It can be used to restart/repeat the animation by returning an object */
  onComplete?: (totalElapsedTime: number) => OnComplete | void
  /** On time update event handler. It receives the current elapsedTime time in seconds */
  onUpdate?: (elapsedTime: number) => void
}

export const useElapsedTime = ({
  isPlaying,
  duration,
  startAt = 0,
  updateInterval = 0,
  onComplete,
  onUpdate,
}: Props): ReturnValue => {
  const [elapsedTime, setElapsedTime] = useState(startAt)
  const totalElapsedTimeRef = useRef(startAt * -1000) // keep in milliseconds to avoid summing up floating point numbers
  const requestRef = useRef<MayBe<number>>(null)
  const previousTimeRef = useRef<MayBe<number>>(null)
  const repeatTimeoutRef = useRef<MayBe<NodeJS.Timeout>>(null)
  const loopRef = useRef({
    elapsedTimeRef: 0,
    startAtRef: startAt,
    durationRef: duration,
    updateIntervalRef: updateInterval,
  })
  // keep duration and updateInterval up to date in the loop in case they change while the loop is running
  loopRef.current = {
    ...loopRef.current,
    durationRef: duration,
    updateIntervalRef: updateInterval,
  }

  const loop = (time: number) => {
    const timeSec = time / 1000
    if (previousTimeRef.current === null) {
      previousTimeRef.current = timeSec
      requestRef.current = requestAnimationFrame(loop)
      return
    }

    // get current elapsed time
    const { durationRef, elapsedTimeRef, updateIntervalRef, startAtRef } =
      loopRef.current
    const deltaTime = timeSec - previousTimeRef.current
    const currentElapsedTime = elapsedTimeRef + deltaTime

    // update refs with the current elapsed time
    previousTimeRef.current = timeSec
    loopRef.current = { ...loopRef.current, elapsedTimeRef: currentElapsedTime }

    // set current display time
    const currentDisplayTime =
      startAtRef +
      (updateIntervalRef === 0
        ? currentElapsedTime
        : ((currentElapsedTime / updateIntervalRef) | 0) * updateIntervalRef)

    const totalTime = startAtRef + currentElapsedTime
    const isCompleted =
      typeof durationRef === 'number' && totalTime >= durationRef
    setElapsedTime(isCompleted ? durationRef! : currentDisplayTime)

    // repeat animation if not completed
    if (!isCompleted) {
      requestRef.current = requestAnimationFrame(loop)
    }
  }

  const cleanup = () => {
    requestRef.current && cancelAnimationFrame(requestRef.current)
    repeatTimeoutRef.current && clearTimeout(repeatTimeoutRef.current)
    previousTimeRef.current = null
  }

  const reset = useCallback(
    (newStartAt: number = startAt) => {
      cleanup()
      loopRef.current = {
        ...loopRef.current,
        elapsedTimeRef: 0,
        startAtRef: newStartAt,
      }
      setElapsedTime(newStartAt)

      if (isPlaying) {
        requestRef.current = requestAnimationFrame(loop)
      }
    },
    [isPlaying, startAt]
  )

  useIsomorphicEffect(() => {
    onUpdate?.(elapsedTime)

    if (duration && elapsedTime >= duration) {
      totalElapsedTimeRef.current += duration * 1000

      const {
        shouldRepeat = false,
        delay = 0,
        newStartAt,
      } = onComplete?.(totalElapsedTimeRef.current / 1000) || {}

      if (shouldRepeat) {
        repeatTimeoutRef.current = setTimeout(
          () => reset(newStartAt),
          delay * 1000
        )
      }
    }
  }, [elapsedTime, duration])

  useIsomorphicEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(loop)
    }

    return cleanup
  }, [isPlaying])

  return { elapsedTime, reset }
}
