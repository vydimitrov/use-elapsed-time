import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useElapsedTime } from '../src/index'

const ElapsedTime = () => {
  const [isPlaying, setIsPlaying] = useState(true)
  const { elapsedTime, reset } = useElapsedTime({
    isPlaying,
    duration: 10,
    startAt: 4.2,
    updateInterval: 2.5,
    onComplete: () => ({ shouldRepeat: true, delay: 2 }),
    onUpdate: (value) => {
      console.log(`Current elapsed time is ${value} seconds`)
    },
  })

  return (
    <div>
      <span>{elapsedTime}</span>
      <br />
      <button onClick={reset}>Reset</button>
      <button onClick={() => setIsPlaying((prev) => !prev)}>
        Toggle Playing
      </button>
    </div>
  )
}

ReactDOM.render(<ElapsedTime />, document.querySelector('#root'))
