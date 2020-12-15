# useElapsedTime React hook

[![npm](https://img.shields.io/npm/v/use-elapsed-time)](https://www.npmjs.com/package/use-elapsed-time)
[![npm](https://img.shields.io/npm/dw/use-elapsed-time)](https://www.npmjs.com/package/use-elapsed-time)
![Codecov](https://img.shields.io/codecov/c/github/vydimitrov/use-elapsed-time)
[![npm bundle size](https://img.shields.io/bundlephobia/min/use-elapsed-time)](https://bundlephobia.com/result?p=use-elapsed-time)

React hook to measure elapsed time using `requestAnimationFrame`. The time measurement can be played and paused, additionally the start time and duration can be set. The primary use case of the hooks is in animations where the most important part of the animation is time.

- Toggle play/pause
- Set start time and duration
- Easily repeat the measurement
- Combine with [any easing function](http://www.gizma.com/easing/#l) to get the right animation
- Built-in and ready-to-use TypeScript type definitions.

## Installation

```
yarn add use-elapsed-time
```

## Basic usage

```jsx
import { useElapsedTime } from 'use-elapsed-time'

const MyComponent = () => {
  const isPlaying = true
  const { elapsedTime } = useElapsedTime(isPlaying)

  return elapsedTime
}
```

[Basic usage demo](https://codesandbox.io/s/epic-dream-hn62k)

## Function signature

```js
  function useElapsedTime(
    isPlaying: boolean,
    options?: {
      duration?: number,
      startAt?: number,
      autoResetKey?: string | number,
      onComplete?: (totalElapsedTime: number) => void | { shouldRepeat: boolean, delay: number, newStartAt: number }
    }
  ): {
    elapsedTime: number,
    reset?: (newStartAt: number) => void
  }
```

### 1st arg. `isPlaying: boolean`

> Default: `isPlaying = false`

Indicates if the loop to get the elapsed time is running or it is paused.

### 2nd arg. `options: object`

> Default: `options = {}`

| Prop Name    | Type                                                                                               | Default | Description                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| duration     | number                                                                                             | -       | Animation duration in seconds                                                                                                                                                                                                                                                                                                                                                                           |
| startAt      | number                                                                                             | 0       | Shift the start time to a different value than 0                                                                                                                                                                                                                                                                                                                                                        |
| autoResetKey | string \| number                                                                                   | -       | Auto reset animation when the key changes. It works similar to React's `key` prop                                                                                                                                                                                                                                                                                                                       |
| onComplete   | (totalElapsedTime: number) => void \| { shouldRepeat: boolean, delay: number, newStartAt: number } | -       | `onComplete` callback will be fired when the duration is reached. The callback will receive as an argument the `totalElapsedTime` in seconds. `onComplete` can be used to restart the elapsed time loop by returning an object with the following params: `shouldRepeat` indicates if the loop should start over; `delay` - delay before looping again in seconds; `newStartAt` set new start at value. |

### Return value `{ elapsedTime, reset }`

The hook returns an object with `elapsedTime` in seconds and `reset` method.

## Use cases

Countdown timer  
[![Edit priceless-hill-2tbiq](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/priceless-hill-2tbiq?fontsize=14&hidenavigation=1&theme=dark)

Count up animation  
[![Edit hungry-cray-hl6wn](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/hungry-cray-hl6wn?fontsize=14&hidenavigation=1&theme=dark)

Non-liner path animation  
[![Edit inspiring-austin-d6ol6](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/inspiring-austin-d6ol6?fontsize=14&hidenavigation=1&theme=dark)
