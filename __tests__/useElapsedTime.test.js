import { renderHook, act } from '@testing-library/react-hooks'
import { replaceRaf } from 'raf-stub'
import { useElapsedTime } from '../src'

const addFrame = () => {
  act(() => {
    requestAnimationFrame.step()
  })
}

const runTimers = () => {
  act(() => {
    jest.runOnlyPendingTimers()
  })
}

const testElapsedTime = (result, expectedEndValue) => {
  expect(result.current.elapsedTime).toBe(0)

  addFrame()
  expect(result.current.elapsedTime).toBe(0)

  addFrame()
  expect(result.current.elapsedTime).toBe(0.5)

  addFrame()
  expect(result.current.elapsedTime).toBe(1)

  addFrame()
  expect(result.current.elapsedTime).toBe(expectedEndValue)
}

describe('useElapsedTime', () => {
  replaceRaf([window], {
    frameDuration: 500,
    startTime: 3000,
  })

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    requestAnimationFrame.reset()
  })

  it('should return 0 the first time it renders', () => {
    const isPlaying = false
    const { result } = renderHook(() => useElapsedTime(isPlaying))
    expect(result.current.elapsedTime).toBe(0)
  })

  it('should return the value provided to startAt the first time it renders', () => {
    const isPlaying = false
    const options = { startAt: 2 }
    const { result } = renderHook(() => useElapsedTime(isPlaying, options))
    expect(result.current.elapsedTime).toBe(2)
  })

  it('should return the elapsed time for duration of 1400 milliseconds starting at 400', () => {
    const isPlaying = true
    const duration = 1.2
    const options = { duration, startAt: 0.4 }
    const { result } = renderHook(() => useElapsedTime(isPlaying, options))

    expect(result.current.elapsedTime).toBe(0.4)

    addFrame()
    expect(result.current.elapsedTime).toBe(0.4)

    addFrame()
    expect(result.current.elapsedTime).toBe(0.9)

    addFrame()
    expect(result.current.elapsedTime).toBe(1.2)
  })

  it('should return the elapsed time for duration of 1400 milliseconds', () => {
    const isPlaying = true
    const duration = 1.4
    const options = { duration }
    const { result } = renderHook(() => useElapsedTime(isPlaying, options))
    testElapsedTime(result, duration)
  })

  it('should not call onComplete if there is no duration provided', () => {
    const isPlaying = true
    const onComplete = jest.fn()
    const options = { onComplete }
    const { result } = renderHook(() => useElapsedTime(isPlaying, options))

    expect(result.current.elapsedTime).toBe(0)

    addFrame()
    expect(result.current.elapsedTime).toBe(0)

    addFrame()
    expect(result.current.elapsedTime).toBe(0.5)

    addFrame()
    expect(result.current.elapsedTime).toBe(1)

    addFrame()
    addFrame()
    addFrame()
    addFrame()

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete when duration is reached', () => {
    const onComplete = jest.fn()
    const isPlaying = true
    const duration = 1.35
    const options = { onComplete, duration }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))
    addFrame()
    addFrame()
    addFrame()
    addFrame()
    addFrame()

    expect(onComplete).toHaveBeenCalled()
    expect(result.current.elapsedTime).toBe(duration)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenCalledTimes(0)
  })

  it('should reset timer and start over if onComplete returns { shouldRepeat: true }', () => {
    const shouldRepeat = true
    const onComplete = jest.fn(() => ({ shouldRepeat }))
    const isPlaying = true
    const duration = 1
    const options = { onComplete, duration }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))
    testElapsedTime(result, duration)

    expect(onComplete).toHaveBeenCalled()

    runTimers()

    testElapsedTime(result, duration)

    expect(onComplete).toHaveBeenCalledTimes(2)
  })

  it('should reset timer and start over in 300 milliseconds if onComplete returns [shouldRepeat = true, delay = 300]', () => {
    const shouldRepeat = true
    const delay = 0.3
    const onComplete = jest.fn(() => ({ shouldRepeat, delay }))
    const isPlaying = true
    const duration = 1
    const options = { onComplete, duration }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))
    testElapsedTime(result, duration)

    expect(onComplete).toHaveBeenCalled()

    runTimers()

    testElapsedTime(result, duration)

    expect(setTimeout).toHaveBeenCalledTimes(2)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)
    expect(onComplete).toHaveBeenCalledTimes(2)
  })

  it('should reset timer and start over using new startAt when passed in the onComplete [shouldRepeat = true, delay = 0, newStartAt = 200]', () => {
    const shouldRepeat = true
    const newStartAt = 0.2
    const onComplete = jest.fn(() => ({ shouldRepeat, newStartAt }))
    const isPlaying = true
    const duration = 1
    const options = { onComplete, duration, startAt: 0.5 }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))
    expect(result.current.elapsedTime).toBe(0.5)
    addFrame()
    addFrame()
    addFrame()
    addFrame()

    expect(onComplete).toHaveBeenCalled()
    runTimers()

    expect(result.current.elapsedTime).toBe(0.2)
  })

  it('should start and stop animation loop by toggling isPlaying', () => {
    let isPlaying = true
    const duration = 1.4
    const options = { duration }
    const { result, rerender } = renderHook(() =>
      useElapsedTime(isPlaying, options)
    )

    addFrame()
    addFrame()
    expect(result.current.elapsedTime).toBe(0.5)

    isPlaying = false
    rerender()

    addFrame()
    expect(result.current.elapsedTime).toBe(0.5)

    addFrame()
    expect(result.current.elapsedTime).toBe(0.5)

    isPlaying = true
    rerender()

    addFrame()
    expect(result.current.elapsedTime).toBe(0.5)

    addFrame()
    expect(result.current.elapsedTime).toBe(1)
  })

  it('should pass the total elapsed time to the onComplete callback', () => {
    const isPlaying = true
    const duration = 1.2
    const shouldRepeat = true
    const onComplete = jest.fn(() => ({ shouldRepeat }))
    const options = { duration, startAt: 0.5, onComplete }

    renderHook(() => useElapsedTime(isPlaying, options))

    addFrame()
    addFrame()
    addFrame()
    addFrame()

    expect(onComplete).toHaveBeenLastCalledWith(0.7)

    runTimers()

    addFrame()
    addFrame()
    addFrame()
    addFrame()
    expect(onComplete).toHaveBeenLastCalledWith(1.9)

    runTimers()

    addFrame()
    addFrame()
    addFrame()
    addFrame()
    expect(onComplete).toHaveBeenLastCalledWith(3.1)
  })

  it('should reset elapsed time to the startAt value when reset is fired', () => {
    const isPlaying = true
    const startAt = 0.25
    const duration = 1
    const options = { duration, startAt }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))

    addFrame()
    addFrame()
    addFrame()
    addFrame()
    act(() => {
      result.current.reset()
    })

    expect(result.current.elapsedTime).toBe(startAt)
  })

  it('should reset elapsed time to the new startAt value passed in the reset method when it is fired', () => {
    const isPlaying = true
    const startAt = 0.25
    const duration = 1
    const options = { duration, startAt }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))

    addFrame()
    addFrame()
    addFrame()
    addFrame()
    act(() => {
      result.current.reset(0.123)
    })

    expect(result.current.elapsedTime).toBe(0.123)
  })

  it('should reset elapsed time to the previous startAt value if the new one passed to the reset method is not a number', () => {
    const isPlaying = true
    const startAt = 0.25
    const duration = 1
    const options = { duration, startAt }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))

    addFrame()
    addFrame()
    addFrame()
    addFrame()
    act(() => {
      result.current.reset({})
    })

    expect(result.current.elapsedTime).toBe(0.25)
  })

  it('should run the elapsed time to the new duration when it changes while the timer is playing', () => {
    const isPlaying = true
    let duration = 1
    let options = { duration }

    const { result, rerender } = renderHook(() =>
      useElapsedTime(isPlaying, options)
    )

    addFrame()
    addFrame()

    options = { duration: 1.6 }
    rerender()

    addFrame()
    addFrame()
    addFrame()
    addFrame()

    expect(result.current.elapsedTime).toBe(1.6)
  })

  it('should reset elapsed time when autoResetKey changes', () => {
    const isPlaying = true
    let duration = 1
    let options = {
      duration,
      shouldResetOnDurationChange: true,
      autoResetKey: duration,
    }

    const { result, rerender } = renderHook(() =>
      useElapsedTime(isPlaying, options)
    )

    addFrame()
    addFrame()

    expect(result.current.elapsedTime).toBe(0.5)
    options = { duration: 1600, shouldResetOnDurationChange: true }
    rerender()

    expect(result.current.elapsedTime).toBe(0)
  })

  it('should clear loop and timeout when the component is unmounted', () => {
    const isPlaying = true
    const options = { duration: 1 }

    const clearTimeoutMock = jest.fn()
    const cancelAnimationFrameMock = jest.fn()

    window.clearTimeout = clearTimeoutMock
    window.cancelAnimationFrame = cancelAnimationFrameMock

    const { unmount } = renderHook(() => useElapsedTime(isPlaying, options))

    unmount()

    expect(clearTimeoutMock).toHaveBeenCalled()
    expect(cancelAnimationFrameMock).toHaveBeenCalled()
  })

  it('should clear loop and timeout when isPlaying is set to true after the duration is reached', () => {
    let isPlaying = true
    const onComplete = jest.fn()
    const options = { duration: 1, onComplete }

    const clearTimeoutMock = jest.fn()
    const cancelAnimationFrameMock = jest.fn()

    window.clearTimeout = clearTimeoutMock
    window.cancelAnimationFrame = cancelAnimationFrameMock

    const { rerender } = renderHook(() => useElapsedTime(isPlaying, options))

    addFrame()
    addFrame()
    addFrame()
    addFrame()

    expect(onComplete).toHaveBeenCalled()

    isPlaying = false
    rerender()

    expect(clearTimeoutMock).toHaveBeenCalled()
    expect(cancelAnimationFrameMock).toHaveBeenCalled()
  })

  it('should start playing again if reset is triggered after the duration is reached and isPlaying is still true', () => {
    const isPlaying = true
    const startAt = 0.25
    const duration = 1.2
    const options = { duration, startAt }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))

    addFrame()
    addFrame()
    addFrame()
    addFrame()

    expect(result.current.elapsedTime).toBe(1.2)

    act(() => {
      result.current.reset(0)
    })

    runTimers()
    testElapsedTime(result, 1.2)
  })

  it('should start playing when the animation is paused once it is done, reset is triggered and the animation is started again ', () => {
    let isPlaying = true
    const duration = 1.2
    const options = { duration }

    const { result, rerender } = renderHook(() =>
      useElapsedTime(isPlaying, options)
    )

    addFrame()
    addFrame()
    addFrame()
    addFrame()

    // animation is completed
    expect(result.current.elapsedTime).toBe(1.2)

    // stop animation
    isPlaying = false
    rerender()

    act(() => {
      result.current.reset()
    })

    // start animation
    isPlaying = true
    rerender()

    runTimers()
    testElapsedTime(result, 1.2)
  })
})
