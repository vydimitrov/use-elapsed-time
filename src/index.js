import { useLayoutEffect, useState, useRef } from 'react';

const useElapsedTime = (isPlaying, config = {}) => {
  const { durationMilliseconds, onComplete, startAt } = config;
  const hasDuration = typeof durationMilliseconds === 'number';

  const [elapsedTime, setElapsedTime] = useState(startAt || 0);
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);

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

      if (typeof onComplete === 'function') {
        const [shouldRepeat = false, delay = 0] = onComplete() || [];

        if (shouldRepeat) {
          setTimeout(() => {
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