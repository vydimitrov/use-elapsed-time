import React from 'react'
import ReactDOM from 'react-dom'
import { useElapsedTime } from '../src/index'

const ElapsedTime = () => {
  const { elapsedTime } = useElapsedTime({
    isPlaying: true,
    duration: 5,
    updateInterval: 1.5,
    onUpdate: () => console.log('yes'),
  })

  return <span>{elapsedTime}</span>
}

ReactDOM.render(<ElapsedTime />, document.querySelector('#root'))
