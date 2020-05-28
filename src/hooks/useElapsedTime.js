import { useState, useRef, useCallback } from 'react'
import { useIsomorphicLayoutEffect } from '.'

const useElapsedTime = (isPlaying, options = {}) => {
  const { duration, onComplete, startAt = 0, autoResetKey } = options

  const [elapsedTime, setElapsedTime] = useState(startAt)
  const totalElapsedTime = useRef(startAt * -1000) // keep in milliseconds to avoid summing up floating point numbers
  const requestRef = useRef(null)
  const previousTimeRef = useRef(null)
  const repeatTimeoutRef = useRef(null)
  const didJustMountRef = useRef(true)
  const isCompletedRef = useRef(false)
  const resetDepRef = useRef(0)

  const reset = useCallback((newStartAt) => {
    resetDepRef.current += 1
    setElapsedTime(typeof newStartAt === 'number' ? newStartAt : startAt)
  }, [])

  const loop = (time) => {
    const timeSec = time / 1000
    if (previousTimeRef.current === null) {
      previousTimeRef.current = timeSec
      requestRef.current = requestAnimationFrame(loop)
      return
    }

    setElapsedTime((prevTime) => {
      const deltaTime = timeSec - previousTimeRef.current
      const currentElapsedTime = prevTime + deltaTime

      if (typeof duration !== 'number' || currentElapsedTime < duration) {
        previousTimeRef.current = timeSec
        requestRef.current = requestAnimationFrame(loop)
        return currentElapsedTime
      }

      // duration is reached, mark it as completed
      isCompletedRef.current = true

      if (typeof onComplete === 'function') {
        totalElapsedTime.current += duration * 1000
        // convert back to seconds
        const totalElapsedTimeSec = totalElapsedTime.current / 1000

        const { shouldRepeat = false, delay = 0, newStartAt } =
          onComplete(totalElapsedTimeSec) || {}

        if (shouldRepeat) {
          repeatTimeoutRef.current = setTimeout(() => {
            reset(newStartAt)
          }, delay * 1000)
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

  useIsomorphicLayoutEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(loop)
    }

    // this will ALSO clear the loop before unmounting
    return cleanup
  }, [isPlaying])

  // update on duration change
  useIsomorphicLayoutEffect(() => {
    // stop requestAnimationFrame if it is running and restart loop
    // thus the new duration can be taken in the new loop
    if (isPlaying && !didJustMountRef.current) {
      cleanup()
      requestRef.current = requestAnimationFrame(loop)
    }
  }, [duration])

  // auto reset the animation when the autoResetKey changes
  useIsomorphicLayoutEffect(() => {
    if (!didJustMountRef.current) {
      reset()
    }
  }, [autoResetKey])

  // target the case when reset is triggered after the duration is reached and playing is still set to true
  // then the animation is played again
  useIsomorphicLayoutEffect(() => {
    if (isPlaying && isCompletedRef.current) {
      isCompletedRef.current = false
      cleanup()
      requestRef.current = requestAnimationFrame(loop)
    }
  }, [resetDepRef.current])

  useIsomorphicLayoutEffect(() => {
    didJustMountRef.current = false
  }, [])

  return { elapsedTime, reset }
}

export { useElapsedTime }
