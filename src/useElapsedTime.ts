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
  const durationRef = useRef(duration)
  durationRef.current = duration

  const loop = (time: number) => {
    const timeSec = time / 1000
    if (previousTimeRef.current === null) {
      previousTimeRef.current = timeSec
      requestRef.current = requestAnimationFrame(loop)
      return
    }

    let isCompleted = false
    const deltaTime = timeSec - previousTimeRef.current
    previousTimeRef.current = timeSec

    setElapsedTime((prevTime) => {
      const currentElapsedTime = prevTime + deltaTime
      isCompleted =
        typeof durationRef.current === 'number' &&
        currentElapsedTime >= durationRef.current

      return isCompleted ? durationRef.current! : currentElapsedTime
    })

    if (!isCompleted) {
      requestRef.current = requestAnimationFrame(loop)
    }
  }

  // only for internal use
  const cleanup = () => {
    requestRef.current && cancelAnimationFrame(requestRef.current)
    repeatTimeoutRef.current && clearTimeout(repeatTimeoutRef.current)
    previousTimeRef.current = null
  }

  const reset = useCallback(
    (newStartAt?: number) => {
      setElapsedTime(typeof newStartAt === 'number' ? newStartAt : startAt)
      if (isPlaying) {
        cleanup()
        requestRef.current = requestAnimationFrame(loop)
      }
    },
    [isPlaying]
  )
  useIsomorphicEffect(() => {
    if (duration && elapsedTime >= duration) {
      totalElapsedTime.current += duration * 1000

      const { shouldRepeat = false, delay = 0, newStartAt } =
        onComplete?.(totalElapsedTime.current / 1000) || {}

      if (shouldRepeat) {
        repeatTimeoutRef.current = setTimeout(() => {
          reset(newStartAt)
        }, delay * 1000)
      }
    }
  }, [elapsedTime, duration])

  useIsomorphicEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(loop)
    }

    return cleanup
  }, [isPlaying])

  // auto reset the animation when the autoResetKey changes
  useIsomorphicEffect(() => {
    isMountedRef.current && reset()
    // set isMounted in the last effect
    isMountedRef.current = true
  }, [autoResetKey])

  return { elapsedTime, reset }
}
