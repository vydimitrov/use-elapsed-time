import React from 'react'
import ReactDOM from 'react-dom'
import { useElapsedTime } from '../src/index'

const ElapsedTime = () => {
  const isPlaying = true
  const { elapsedTime } = useElapsedTime({ isPlaying, duration: 5 })

  return <span>{elapsedTime}</span>
}

ReactDOM.render(<ElapsedTime />, document.querySelector('#root'))
