# Change Log

## 2.0.0 (May 11nd, 2020)

**Breaking Changes:**

- The hook now returns an object with `elapsedTime` in seconds and `reset` method, like so `{ elapsedTime, reset }`
- `durationSeconds` is renamed to just `duration`. The duration is now set in **seconds**
- `startAt` now expects value in **seconds**
- `onComplete` will receive as an argument the `totalElapsedTime` in **seconds**. The animation can now be repeated by returning an object instead of an array. The object may have the following params: `shouldRepeat` indicates if the loop should start over; `delay` - delay before looping again in seconds; `newStartAt` set new start at value. |
- Changing the `duration` while the loop is running will update the duration - if the new duration is more than the previous one, the measurement of the elapsed time will continue to the new duration; if the duration is less than the previous one, the `onComplete` callback will be fired. This behaviour can now be changed by passing `shouldResetOnDurationChange: true` so when a new duration is provided the animation loop will start over.

**Implemented enhancements:**

- `options.shouldResetOnDurationChange` can be set to reset elapsed time when the duration changes
- the hook now returns `reset` method, which can be used to reset the elapsed time

## 1.1.5 (December 22nd, 2019)

**Implemented enhancements:**

- Refactor internals
- Add test coverage

## 1.1.4 (December 19th, 2019)

**Implemented enhancements:**

- Add a new config option "startAt" to change the start time of the animation. Defaults to 0 if not provided

## 1.1.3 (November 27th, 2019)

**Implemented enhancements:**

- Add TypeScript type definitions

## 1.1.2 (November 16th, 2019)

**Implemented enhancements:**

- Add CHANGELOG.md to repo

## 1.1.0 (November 16th, 2019)

**Implemented enhancements:**

- `config.isRepeated` is deprecated due to an issue to toggle it while the animation loop is running
- Animation now can be repeated by returning an array `[shouldRepeat: boolean, delay: number]` from `config.onComplete`
- Code samples are removed from ReadMe and replaced with buttons to edit on CodeSandbox
