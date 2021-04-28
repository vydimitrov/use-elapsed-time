import { renderHook, act } from '@testing-library/react-hooks'
import { useElapsedTime } from './useElapsedTime'
import type { Props } from './types'

jest.setTimeout(5000)

const setupHook = (props: Props) => renderHook(() => useElapsedTime(props))

describe('useElapsedTime', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns 0 the first time it renders', () => {
    const props = { isPlaying: false }
    const { result } = setupHook(props)

    expect(result.current.elapsedTime).toBe(0)
  })

  it('returns the value provided to startAt the first time it renders', () => {
    const props = { isPlaying: true, startAt: 2 }
    const { result } = setupHook(props)

    expect(result.current.elapsedTime).toBe(props.startAt)
  })

  it('returns the elapsed time for duration of 1.2 seconds starting at 0.4 seconds', async () => {
    const props = { isPlaying: true, duration: 1.2, startAt: 0.4 }
    const { result, waitFor } = setupHook(props)

    expect(result.current.elapsedTime).toBe(props.startAt)
    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))
  })

  it('returns the elapsed time for duration of 1.4 seconds starting at 0', async () => {
    const props = { isPlaying: true, duration: 1.4, startAt: 0 }
    const { result, waitFor } = setupHook(props)

    expect(result.current.elapsedTime).toBe(props.startAt)

    await waitFor(
      () => expect(result.current.elapsedTime).toBe(props.duration),
      {
        timeout: 2000,
      }
    )
  })

  it('does not call onComplete if there is no duration provided', async () => {
    const props = { isPlaying: true, onComplete: jest.fn() }
    const { result, waitFor } = setupHook(props)

    expect(result.current.elapsedTime).toBe(0)

    await waitFor(
      () => expect(result.current.elapsedTime).toBeGreaterThan(2.5),
      {
        timeout: 3000,
      }
    )

    expect(props.onComplete).not.toHaveBeenCalled()
  })

  it('fires onComplete when duration is reached', async () => {
    const props = { isPlaying: true, onComplete: jest.fn(), duration: 0.65 }
    const { result, waitFor } = setupHook(props)

    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))
    expect(props.onComplete).toHaveBeenCalledTimes(1)
  })

  it('resets timer and start over when onComplete returns shouldRepeat = true', async () => {
    const onComplete = jest.fn(() => ({ shouldRepeat: true }))
    const props = { isPlaying: true, duration: 0.48, onComplete }
    const { result, waitFor } = setupHook(props)

    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))
    expect(onComplete).toHaveBeenCalledTimes(1)

    await waitFor(() => expect(result.current.elapsedTime).toBe(0))

    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))
    expect(onComplete).toHaveBeenCalledTimes(2)
  })

  it('resets timer and start over in 0.3 seconds when onComplete returns shouldRepeat = true and delay = 0.3', async () => {
    jest.useFakeTimers()

    const setTimeoutSpy = jest.spyOn(window, 'setTimeout')
    const onComplete = jest.fn(() => ({ shouldRepeat: true, delay: 0.3 }))
    const props = { isPlaying: true, duration: 0.24, onComplete }
    const { result, waitFor } = setupHook(props)

    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))
    expect(onComplete).toHaveBeenCalledTimes(1)

    act(() => {
      jest.runOnlyPendingTimers()
    })

    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))
    expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 300)
    expect(onComplete).toHaveBeenCalledTimes(2)

    jest.useRealTimers()
  })

  it('resets timer and start over using the new startAt when onComplete shouldRepeat = true, newStartAt = 0.2', async () => {
    const newStartAt = 0.2
    const onComplete = jest.fn(() => ({ shouldRepeat: true, newStartAt }))
    const props = { isPlaying: true, duration: 1, startAt: 0.5, onComplete }
    const { result, waitFor } = setupHook(props)

    expect(result.current.elapsedTime).toBe(props.startAt)
    await waitFor(() => expect(result.current.elapsedTime).toBe(newStartAt))
  })

  it('starts and stops animation loop by toggling isPlaying', async () => {
    const props = { isPlaying: true, duration: 4 }
    const { result, rerender, waitFor } = setupHook(props)

    await waitFor(() => expect(result.current.elapsedTime).toBeGreaterThan(0.1))
    const currentTime = result.current.elapsedTime

    props.isPlaying = false
    rerender()
    expect(result.current.elapsedTime).toBe(currentTime)

    props.isPlaying = true
    rerender(props)
    expect(result.current.elapsedTime).toBe(currentTime)

    await waitFor(() =>
      expect(result.current.elapsedTime).toBeGreaterThan(0.37)
    )
  })

  it('should pass the total elapsed time to the onComplete callback', async () => {
    const onComplete = jest.fn(() => ({ shouldRepeat: true }))
    const props = {
      isPlaying: true,
      duration: 1.2,
      startAt: 0.5,
      onComplete,
    }
    const { waitFor } = setupHook(props)

    await waitFor(() => expect(onComplete).toHaveBeenLastCalledWith(0.7))
    await waitFor(() => expect(onComplete).toHaveBeenLastCalledWith(1.9))
    await waitFor(() => expect(onComplete).toHaveBeenLastCalledWith(3.1))
  })

  it('resets elapsed time to the startAt value when reset is fired', () => {
    const props = { isPlaying: true, duration: 1, startAt: 0.25 }
    const { result } = setupHook(props)

    act(() => {
      result.current.reset()
    })

    expect(result.current.elapsedTime).toBe(props.startAt)
  })

  it('reset elapsed time to the new startAt value passed in the reset method when it is fired', () => {
    const newStartAt = 0.123
    const props = { isPlaying: true, duration: 1, startAt: 0.25 }
    const { result } = setupHook(props)

    act(() => {
      result.current.reset(newStartAt)
    })

    expect(result.current.elapsedTime).toBe(newStartAt)
  })

  it('returns the new duration when it changes while the timer is playing', async () => {
    const props = { isPlaying: true, duration: 0.3 }
    const { result, rerender, waitFor } = setupHook(props)

    await waitFor(() => expect(result.current.elapsedTime).toBeGreaterThan(0.1))

    props.duration = 0.65
    rerender()

    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))
  })

  it('resets elapsed time when autoResetKey changes', async () => {
    const props = { isPlaying: true, duration: 0.46, autoResetKey: 'one' }
    const { result, rerender, waitFor } = setupHook(props)

    await waitFor(() => expect(result.current.elapsedTime).toBeGreaterThan(0.1))

    props.autoResetKey = 'two'
    rerender()

    expect(result.current.elapsedTime).toBe(0)
  })

  it('clears animation loop when the component is unmounted', () => {
    const cancelAnimationFrameMock = jest.spyOn(window, 'cancelAnimationFrame')
    const props = { isPlaying: true, duration: 1 }
    const { unmount } = setupHook(props)

    unmount()

    expect(cancelAnimationFrameMock).toHaveBeenCalled()
  })

  it('clears animation loop and timeout when isPlaying is false after the duration is reached', async () => {
    const clearTimeoutMock = jest.spyOn(window, 'clearTimeout')
    const cancelAnimationFrameMock = jest.spyOn(window, 'cancelAnimationFrame')
    const props = {
      isPlaying: true,
      duration: 0.37,
      onComplete: jest.fn(() => ({ shouldRepeat: true })),
    }
    const { rerender, waitFor } = setupHook(props)

    await waitFor(() => expect(props.onComplete).toHaveBeenCalled())

    props.isPlaying = false
    rerender()

    expect(clearTimeoutMock).toHaveBeenCalled()
    expect(cancelAnimationFrameMock).toHaveBeenCalled()
  })

  it('starts playing again if reset is triggered after the duration is reached and isPlaying is still true', async () => {
    const props = { isPlaying: true, duration: 0.89, startAt: 0.25 }
    const { result, rerender, waitFor } = setupHook(props)

    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))

    act(() => {
      result.current.reset(0)
    })

    await waitFor(() => expect(result.current.elapsedTime).toBe(0))
    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))
  })

  it('starts playing when the animation is paused after it is completed, reset is triggered and the animation starts again ', async () => {
    const props = { isPlaying: true, duration: 0.67 }
    const { result, rerender, waitFor } = setupHook(props)

    // animation is completed
    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))

    // stop animation
    props.isPlaying = false
    rerender()

    act(() => {
      result.current.reset()
    })

    // start animation
    props.isPlaying = true
    rerender()

    await waitFor(() => expect(result.current.elapsedTime).toBe(0))
    await waitFor(() => expect(result.current.elapsedTime).toBe(props.duration))
  })
})
