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
  expect(result.current.elapsedTime).toBe(500)

  addFrame()
  expect(result.current.elapsedTime).toBe(1000)

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
    const options = { startAt: 2000 }
    const { result } = renderHook(() => useElapsedTime(isPlaying, options))
    expect(result.current.elapsedTime).toBe(2000)
  })

  it('should return the elapsed time for duration of 1400 milliseconds starting at 400', () => {
    const isPlaying = true
    const duration = 1200
    const options = { duration, startAt: 400 }
    const { result } = renderHook(() => useElapsedTime(isPlaying, options))

    expect(result.current.elapsedTime).toBe(400)

    addFrame()
    expect(result.current.elapsedTime).toBe(400)

    addFrame()
    expect(result.current.elapsedTime).toBe(900)

    addFrame()
    expect(result.current.elapsedTime).toBe(1200)
  })

  it('should return the elapsed time for duration of 1400 milliseconds', () => {
    const isPlaying = true
    const duration = 1400
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
    expect(result.current.elapsedTime).toBe(500)

    addFrame()
    expect(result.current.elapsedTime).toBe(1000)

    addFrame()
    addFrame()
    addFrame()
    addFrame()

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete when duration is reached', () => {
    const onComplete = jest.fn()
    const isPlaying = true
    const duration = 1350
    const options = { onComplete, duration }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))
    testElapsedTime(result, duration)

    expect(onComplete).toHaveBeenCalled()

    addFrame()
    expect(result.current.elapsedTime).toBe(duration)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenCalledTimes(0)
  })

  it('should reset timer and start over if onComplete returns [shouldRepeat = true]', () => {
    const shouldRepeat = true
    const onComplete = jest.fn(() => [shouldRepeat])
    const isPlaying = true
    const duration = 1000
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
    const delay = 300
    const onComplete = jest.fn(() => [shouldRepeat, delay])
    const isPlaying = true
    const duration = 1000
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
    const delay = 0
    const newStartAt = 200
    const onComplete = jest.fn(() => [shouldRepeat, delay, newStartAt])
    const isPlaying = true
    const duration = 1000
    const options = { onComplete, duration, startAt: 500 }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))
    expect(result.current.elapsedTime).toBe(500)
    addFrame()
    addFrame()
    addFrame()
    addFrame()

    expect(onComplete).toHaveBeenCalled()
    runTimers()

    expect(result.current.elapsedTime).toBe(200)
  })

  it('should start and stop animation loop by toggling isPlaying', () => {
    let isPlaying = true
    const duration = 1400
    const options = { duration }
    const { result, rerender } = renderHook(() =>
      useElapsedTime(isPlaying, options)
    )

    addFrame()
    addFrame()
    expect(result.current.elapsedTime).toBe(500)

    isPlaying = false
    rerender()

    addFrame()
    expect(result.current.elapsedTime).toBe(500)

    addFrame()
    expect(result.current.elapsedTime).toBe(500)

    isPlaying = true
    rerender()

    addFrame()
    expect(result.current.elapsedTime).toBe(500)

    addFrame()
    expect(result.current.elapsedTime).toBe(1000)
  })

  it('should pass the total elapsed time to the onComplete callback', () => {
    const isPlaying = true
    const duration = 1200
    const shouldRepeat = true
    const onComplete = jest.fn(() => [shouldRepeat])
    const options = { duration, startAt: 500, onComplete }

    renderHook(() => useElapsedTime(isPlaying, options))

    addFrame()
    addFrame()
    addFrame()

    expect(onComplete).toHaveBeenLastCalledWith(700)

    runTimers()

    addFrame()
    addFrame()
    addFrame()
    addFrame()
    expect(onComplete).toHaveBeenLastCalledWith(1900)

    runTimers()

    addFrame()
    addFrame()
    addFrame()
    addFrame()
    expect(onComplete).toHaveBeenLastCalledWith(3100)
  })

  it('should reset elapsed time to the startAt value when reset is fired', () => {
    const isPlaying = true
    const startAt = 250
    const duration = 1000
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
    const startAt = 250
    const duration = 1000
    const options = { duration, startAt }

    const { result } = renderHook(() => useElapsedTime(isPlaying, options))

    addFrame()
    addFrame()
    addFrame()
    addFrame()
    act(() => {
      result.current.reset(123)
    })

    expect(result.current.elapsedTime).toBe(123)
  })

  it('should run the elapsed time to the new duration when it changes while the timer is playing', () => {
    const isPlaying = true
    let duration = 1000
    let options = { duration }

    const { result, rerender } = renderHook(() =>
      useElapsedTime(isPlaying, options)
    )

    addFrame()
    addFrame()

    options = { duration: 1600 }
    rerender()

    addFrame()
    addFrame()
    addFrame()
    addFrame()

    expect(result.current.elapsedTime).toBe(1600)
  })

  it('should reset elapsed time when duration changes and shouldResetOnDurationChange is set to true', () => {
    const isPlaying = true
    let duration = 1000
    let options = { duration, shouldResetOnDurationChange: true }

    const { result, rerender } = renderHook(() =>
      useElapsedTime(isPlaying, options)
    )

    addFrame()
    addFrame()

    expect(result.current.elapsedTime).toBe(500)
    options = { duration: 1600, shouldResetOnDurationChange: true }
    rerender()

    expect(result.current.elapsedTime).toBe(0)
  })

  it('should clear loop and timeout when the component is unmounted', () => {
    const isPlaying = true
    const options = { duration: 1000 }

    const clearTimeoutMock = jest.fn()
    const cancelAnimationFrameMock = jest.fn()

    window.clearTimeout = clearTimeoutMock
    window.cancelAnimationFrame = cancelAnimationFrameMock

    const { unmount } = renderHook(() => useElapsedTime(isPlaying, options))

    unmount()

    expect(clearTimeoutMock).toHaveBeenCalled()
    expect(cancelAnimationFrameMock).toHaveBeenCalled()
  })
})
