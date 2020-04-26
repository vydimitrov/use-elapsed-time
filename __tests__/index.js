import { renderHook, act } from "@testing-library/react-hooks";
import { replaceRaf } from "raf-stub";
import { useElapsedTime } from "../src";

const addFrame = () => {
  act(() => {
    requestAnimationFrame.step();
  });
};

const runTimers = () => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
};

const testElapsedTime = (result, expectedEndValue) => {
  expect(result.current).toBe(0);

  addFrame();
  expect(result.current).toBe(0);

  addFrame();
  expect(result.current).toBe(500);

  addFrame();
  expect(result.current).toBe(1000);

  addFrame();
  expect(result.current).toBe(expectedEndValue);
};

describe("useElapsedTime", () => {
  replaceRaf([window], {
    frameDuration: 500,
    startTime: 3000
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    requestAnimationFrame.reset();
  });

  it("should return 0 the first time it renders", () => {
    const isPlaying = false;
    const { result } = renderHook(() => useElapsedTime(isPlaying));
    expect(result.current).toBe(0);
  });

  it("should return the value provided to startAt the first time it renders", () => {
    const isPlaying = false;
    const config = { startAt: 2000 };
    const { result } = renderHook(() => useElapsedTime(isPlaying, config));
    expect(result.current).toBe(2000);
  });

  it("should return the elapsed time for duration of 1400 milliseconds starting at 400", () => {
    const isPlaying = true;
    const durationMilliseconds = 1200;
    const config = { durationMilliseconds, startAt: 400 };
    const { result } = renderHook(() => useElapsedTime(isPlaying, config));

    expect(result.current).toBe(400);

    addFrame();
    expect(result.current).toBe(400);

    addFrame();
    expect(result.current).toBe(900);

    addFrame();
    expect(result.current).toBe(1200);
  });

  it("should return the elapsed time for duration of 1400 milliseconds", () => {
    const isPlaying = true;
    const durationMilliseconds = 1400;
    const config = { durationMilliseconds };
    const { result } = renderHook(() => useElapsedTime(isPlaying, config));
    testElapsedTime(result, durationMilliseconds);
  });

  it("should not call onComplete if there is no duration provided", () => {
    const isPlaying = true;
    const onComplete = jest.fn();
    const config = { onComplete };
    const { result } = renderHook(() => useElapsedTime(isPlaying, config));

    expect(result.current).toBe(0);

    addFrame();
    expect(result.current).toBe(0);

    addFrame();
    expect(result.current).toBe(500);

    addFrame();
    expect(result.current).toBe(1000);

    addFrame();
    addFrame();
    addFrame();
    addFrame();

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("should call onComplete when duration is reached", () => {
    const onComplete = jest.fn();
    const isPlaying = true;
    const durationMilliseconds = 1350;
    const config = { onComplete, durationMilliseconds };

    const { result } = renderHook(() => useElapsedTime(isPlaying, config));
    testElapsedTime(result, durationMilliseconds);

    expect(onComplete).toHaveBeenCalled();

    addFrame();
    expect(result.current).toBe(durationMilliseconds);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledTimes(0);
  });

  it("should reset timer and start over if onComplete returns [shouldRepeat = true]", () => {
    const shouldRepeat = true;
    const onComplete = jest.fn(() => [shouldRepeat]);
    const isPlaying = true;
    const durationMilliseconds = 1000;
    const config = { onComplete, durationMilliseconds };

    const { result } = renderHook(() => useElapsedTime(isPlaying, config));
    testElapsedTime(result, durationMilliseconds);

    expect(onComplete).toHaveBeenCalled();

    runTimers();

    testElapsedTime(result, durationMilliseconds);

    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("should reset timer and start over in 300 milliseconds if onComplete returns [shouldRepeat = true, delay = 300]", () => {
    const shouldRepeat = true;
    const delay = 300;
    const onComplete = jest.fn(() => [shouldRepeat, delay]);
    const isPlaying = true;
    const durationMilliseconds = 1000;
    const config = { onComplete, durationMilliseconds };

    const { result } = renderHook(() => useElapsedTime(isPlaying, config));
    testElapsedTime(result, durationMilliseconds);

    expect(onComplete).toHaveBeenCalled();

    runTimers();

    testElapsedTime(result, durationMilliseconds);

    expect(setTimeout).toHaveBeenCalledTimes(2);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("should start and stop animation loop by toggling isPlaying", () => {
    let isPlaying = true;
    const durationMilliseconds = 1400;
    const config = { durationMilliseconds };
    const { result, rerender } = renderHook(() =>
      useElapsedTime(isPlaying, config)
    );

    addFrame();
    addFrame();
    expect(result.current).toBe(500);

    isPlaying = false;
    rerender();

    addFrame();
    expect(result.current).toBe(500);

    addFrame();
    expect(result.current).toBe(500);

    isPlaying = true;
    rerender();

    addFrame();
    expect(result.current).toBe(500);

    addFrame();
    expect(result.current).toBe(1000);
  });

  it("should pass the total elapsed time to the onComplete callback", () => {
    const isPlaying = true;
    const durationMilliseconds = 1200;
    const shouldRepeat = true;
    const onComplete = jest.fn(() => [shouldRepeat]);
    const config = { durationMilliseconds, startAt: 500, onComplete };

    renderHook(() => useElapsedTime(isPlaying, config));

    addFrame();
    addFrame();
    addFrame();

    expect(onComplete).toHaveBeenLastCalledWith(700);

    runTimers();

    addFrame();
    addFrame();
    addFrame();
    addFrame();
    expect(onComplete).toHaveBeenLastCalledWith(1900);

    runTimers();

    addFrame();
    addFrame();
    addFrame();
    addFrame();
    expect(onComplete).toHaveBeenLastCalledWith(3100);
  });
});
