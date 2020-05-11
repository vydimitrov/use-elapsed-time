## Migrating from v1.x.x to v2.x.x?

The component API is updated in v2 to make it more robust and developer-friendly. Please consider the following changes before switching to v2.x.x:

- The hook now returns an object with `elapsedTime` in seconds and `reset` method, like so `{ elapsedTime, reset }`
- `durationSeconds` is renamed to just `duration`. The duration is now set in **seconds**
- `startAt` now expects value in **seconds**
- `onComplete` will receive as an argument the `totalElapsedTime` in **seconds**. The animation can now be repeated by returning an object instead of an array. The object may have the following params: `shouldRepeat` indicates if the loop should start over; `delay` - delay before looping again in seconds; `newStartAt` set new start at value. |
- Changing the `duration` while the loop is running will update the duration - if the new duration is more than the previous one, the measurement of the elapsed time will continue to the new duration; if the duration is less than the previous one, the `onComplete` callback will be fired. This behaviour can now be changed by passing `shouldResetOnDurationChange: true` so when a new duration is provided the animation loop will start over.
