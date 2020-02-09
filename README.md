# useElapsedTime React hook
![npm bundle size](https://img.shields.io/bundlephobia/min/use-elapsed-time)
![Codecov](https://img.shields.io/codecov/c/github/vydimitrov/use-elapsed-time)
![npm](https://img.shields.io/npm/v/use-elapsed-time)

The only hook you need to perform JavaScript animations in React.

* Toggle play/pause
* Combine with [any easing function](http://www.gizma.com/easing/#l) to get the right animation
* Built-in and ready-to-use TypeScript type definitions.

## Installation
```
yarn add use-elapsed-time
```
or
```
npm install use-elapsed-time
```

## Basic usage
```jsx
import { useElapsedTime } from 'use-elapsed-time';

const MyComponent = () => {
  const isPlaying = true;
  const elapsedTime = useElapsedTime(isPlaying);
  
  return elapsedTime;
};
```
[Basic usage demo](https://codesandbox.io/s/epic-dream-hn62k)

## Function signature
```js
  function useElapsedTime(
    isPlaying: boolean,
    config?: {
      startAt: number,
      durationMilliseconds: number,
      onComplete?: () => undefined | [shouldRepeat: boolean, delay: number]
    }
  ): number;
```

The first argument `isPlaying` indicates if the loop to get the elapsed time is running or it is paused.
The second argument `config` is optional. `durationMilliseconds` option set the animation duration in milliseconds. `onComplete` callback will be fired when the duration is reached. `onComplete` can be used to restart the elapsed time loop by returning an array where the first element `shouldRepeat` indicates if the loop should start over and second element `delay` specifies the delay before looping again in milliseconds. `startAt` option can shift the start time to a different value than 0. `{ durationMilliseconds: 5000, startAt: 2000 }` will return the elapsed time from 2000 to 5000 milliseconds. 

The hook returns elapsed time in milliseconds.  

## Use cases
Countdown timer  
[![Edit priceless-hill-2tbiq](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/priceless-hill-2tbiq?fontsize=14&hidenavigation=1&theme=dark)


Count up animation  
[![Edit hungry-cray-hl6wn](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/hungry-cray-hl6wn?fontsize=14&hidenavigation=1&theme=dark)


Non-liner path animation  
[![Edit inspiring-austin-d6ol6](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/inspiring-austin-d6ol6?fontsize=14&hidenavigation=1&theme=dark)

Trigger workflow
