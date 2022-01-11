import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useElapsedTime } from '../src/index'

const ElapsedTime = () => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [duration, setDuration] = useState(10)
  const { elapsedTime, reset } = useElapsedTime({
    isPlaying,
    duration,
    startAt: 4.2,
    onComplete: (time) => {
      console.log('Total time', time)
      return { shouldRepeat: true, delay: 2, newStartAt: 0 }
    },
    onUpdate: (value) => {
      // console.log(`Current elapsed time is ${value} seconds`)
    },
  })

  return (
    <div>
      <span>{elapsedTime}</span>
      <br />
      <button onClick={() => reset()}>Reset</button>
      <button onClick={() => setIsPlaying((prev) => !prev)}>
        Toggle Playing
      </button>
      <button onClick={() => setDuration((prev) => prev + 5)}>
        Change Duration
      </button>
    </div>
  )
}

ReactDOM.render(<ElapsedTime />, document.querySelector('#root'))
