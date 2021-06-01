import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useElapsedTime } from '../src/index'

const ElapsedTime = () => {
  const [isPlaying, setIsPlaying] = useState(true)
  const { elapsedTime, reset } = useElapsedTime({
    isPlaying,
    startAt: 4,
    updateInterval: 3,
    onComplete: () => ({ shouldRepeat: true, delay: 2 }),
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
