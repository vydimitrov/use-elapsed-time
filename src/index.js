import { useLayoutEffect, useState, useRef, useCallback } from 'react'

const useElapsedTime = (isPlaying, config = {}) => {
  const { durationMilliseconds, onComplete, startAt = 0 } = config

  const [elapsedTime, setElapsedTime] = useState(startAt)
  const totalElapsedTime = useRef(startAt * -1)
  const requestRef = useRef(null)
  const previousTimeRef = useRef(null)
  const repeatTimeoutRef = useRef(null)

  const loop = (time) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(loop)
      return
    }

    setElapsedTime((prevTime) => {
      const deltaTime = time - previousTimeRef.current
      const currentElapsedTime = prevTime + deltaTime

      if (
        typeof durationMilliseconds !== 'number' ||
        currentElapsedTime < durationMilliseconds
      ) {
        previousTimeRef.current = time
        requestRef.current = requestAnimationFrame(loop)
        return currentElapsedTime
      }

      if (typeof onComplete === 'function') {
        totalElapsedTime.current += durationMilliseconds

        const [shouldRepeat = false, delay = 0] =
          onComplete(totalElapsedTime.current) || []

        if (shouldRepeat) {
          repeatTimeoutRef.current = setTimeout(() => {
            setElapsedTime(0)
            previousTimeRef.current = null
            requestRef.current = requestAnimationFrame(loop)
          }, delay)
        }
      }

      return durationMilliseconds
    })
  }

  useLayoutEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(requestRef.current)
      clearTimeout(repeatTimeoutRef.current)
      previousTimeRef.current = null
    }
  }, [isPlaying])

  const reset = useCallback(() => {
    setElapsedTime(startAt)
  }, [startAt])

  return { elapsedTime, reset }
}

export { useElapsedTime }
