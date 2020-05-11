import { useLayoutEffect, useState, useRef, useCallback } from 'react'

const useElapsedTime = (isPlaying, options = {}) => {
  const {
    duration,
    onComplete,
    startAt = 0,
    shouldResetOnDurationChange = false,
  } = options

  const [elapsedTime, setElapsedTime] = useState(startAt)
  const totalElapsedTime = useRef(startAt * -1)
  const requestRef = useRef(null)
  const previousTimeRef = useRef(null)
  const repeatTimeoutRef = useRef(null)
  const didMountRef = useRef(true)

  const reset = useCallback(
    (newStartAt = startAt) => {
      setElapsedTime(newStartAt)
    },
    [startAt]
  )

  const loop = (time) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(loop)
      return
    }

    setElapsedTime((prevTime) => {
      const deltaTime = time - previousTimeRef.current
      const currentElapsedTime = prevTime + deltaTime

      if (typeof duration !== 'number' || currentElapsedTime < duration) {
        previousTimeRef.current = time
        requestRef.current = requestAnimationFrame(loop)
        return currentElapsedTime
      }

      if (typeof onComplete === 'function') {
        totalElapsedTime.current += duration

        const { shouldRepeat = false, delay = 0, newStartAt } =
          onComplete(totalElapsedTime.current) || {}

        if (shouldRepeat) {
          repeatTimeoutRef.current = setTimeout(() => {
            reset(newStartAt)
            previousTimeRef.current = null
            requestRef.current = requestAnimationFrame(loop)
          }, delay)
        }
      }

      return duration
    })
  }

  // only for internal use
  const cleanup = () => {
    cancelAnimationFrame(requestRef.current)
    clearTimeout(repeatTimeoutRef.current)
    previousTimeRef.current = null
  }

  useLayoutEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(loop)
    }

    // this will ALSO clear the loop before unmounting
    return cleanup
  }, [isPlaying])

  // update on duration change
  useLayoutEffect(() => {
    if (didMountRef.current) {
      didMountRef.current = false
      return
    }

    // stop requestAnimationFrame if it is running and restart loop
    // thus the new duration can be taken in the new loop
    if (isPlaying) {
      cleanup()
      requestRef.current = requestAnimationFrame(loop)
    }

    // reset elapsed time when duration changes
    if (shouldResetOnDurationChange) {
      reset()
    }
  }, [duration])

  return { elapsedTime, reset }
}

export { useElapsedTime }
