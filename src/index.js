import { useLayoutEffect, useEffect, useState, useRef } from "react";

const useElapsedTime = (isPlaying, config = {}) => {
  const { durationMilliseconds, onComplete, startAt = 0 } = config;
  const hasDuration = typeof durationMilliseconds === "number";

  const [elapsedTime, setElapsedTime] = useState(startAt);
  const totalElapsedTime = useRef(startAt * -1);
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);
  const onCompleteTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (onCompleteTimeout.current !== null) {
        clearTimeout(onCompleteTimeout.current);
      }
    };
  }, []);

  const loop = time => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(loop);
      return;
    }

    setElapsedTime(prevTime => {
      const deltaTime = time - previousTimeRef.current;
      const currentElapsedTime = prevTime + deltaTime;

      if (!hasDuration || currentElapsedTime < durationMilliseconds) {
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
        return currentElapsedTime;
      }

      if (typeof onComplete === "function") {
        totalElapsedTime.current += durationMilliseconds;

        const [shouldRepeat = false, delay = 0] =
          onComplete(totalElapsedTime.current) || [];

        if (shouldRepeat) {
          onCompleteTimeout.current = setTimeout(() => {
            setElapsedTime(0);
            previousTimeRef.current = null;
            requestRef.current = requestAnimationFrame(loop);
          }, delay);
        }
      }

      return durationMilliseconds;
    });
  };

  useLayoutEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = null;
      requestRef.current = null;
    };
  }, [isPlaying]);

  return elapsedTime;
};

export { useElapsedTime };
