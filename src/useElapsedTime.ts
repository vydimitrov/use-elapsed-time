import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react'
import type { Props, ReturnValue } from './types'

const useIsomorphicEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export const useElapsedTime = ({
  isPlaying,
  duration,
  onComplete,
  autoResetKey,
  startAt = 0,
}: Props): ReturnValue => {
  const [elapsedTime, setElapsedTime] = useState(startAt)
  const totalElapsedTime = useRef(startAt * -1000) // keep in milliseconds to avoid summing up floating point numbers
  const requestRef = useRef<number | null>(null)
  const previousTimeRef = useRef<number | null>(null)
  const repeatTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(false)
  const isCompletedRef = useRef(false)
  const resetDepRef = useRef(0)

  const reset = useCallback((newStartAt?: number) => {
    resetDepRef.current += 1
    setElapsedTime(typeof newStartAt === 'number' ? newStartAt : startAt)
  }, [])

  const loop = (time: number) => {
    const timeSec = time / 1000
    if (previousTimeRef.current === null) {
      previousTimeRef.current = timeSec
      requestRef.current = requestAnimationFrame(loop)
      return
    }

    const deltaTime = timeSec - previousTimeRef.current
    previousTimeRef.current = timeSec

    setElapsedTime((prevTime) => {
      const currentElapsedTime = prevTime + deltaTime

      if (typeof duration !== 'number' || currentElapsedTime < duration) {
        return currentElapsedTime
      }

      // duration is reached, mark it as completed
      isCompletedRef.current = true
      return duration
    })

    if (!isCompletedRef.current) {
      requestRef.current = requestAnimationFrame(loop)
    } else if (typeof onComplete === 'function' && duration) {
      totalElapsedTime.current += duration * 1000
      // convert back to seconds
      const totalElapsedTimeSec = totalElapsedTime.current / 1000

      const { shouldRepeat = false, delay = 0, newStartAt } =
        onComplete(totalElapsedTimeSec) || {}

      if (shouldRepeat && isMountedRef.current) {
        repeatTimeoutRef.current = setTimeout(() => {
          reset(newStartAt)
        }, delay * 1000)
      }
    }
  }

  // only for internal use
  const cleanup = () => {
    requestRef.current && cancelAnimationFrame(requestRef.current)
    repeatTimeoutRef.current && clearTimeout(repeatTimeoutRef.current)

    previousTimeRef.current = null
  }

  useIsomorphicEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(loop)
    }

    // this will ALSO clear the loop before unmounting
    return cleanup
  }, [isPlaying])

  // update on duration change
  useIsomorphicEffect(() => {
    // stop requestAnimationFrame if it is running and restart loop
    // thus the new duration can be taken in the new loop
    if (isPlaying && isMountedRef.current) {
      cleanup()
      requestRef.current = requestAnimationFrame(loop)
    }
  }, [duration])

  // auto reset the animation when the autoResetKey changes
  useIsomorphicEffect(() => {
    if (isMountedRef.current) {
      reset()
    }
  }, [autoResetKey])

  useIsomorphicEffect(() => {
    // target the case when reset is triggered after the duration is reached and playing is still set to true
    // then the animation is played again
    if (isPlaying && isCompletedRef.current) {
      cleanup()
      requestRef.current = requestAnimationFrame(loop)
    }

    // mark it as not completed when the animation is reset
    isCompletedRef.current = false
  }, [resetDepRef.current])

  // the last effect should set isMounted to true
  // keep this effect always last
  useIsomorphicEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return { elapsedTime, reset }
}
