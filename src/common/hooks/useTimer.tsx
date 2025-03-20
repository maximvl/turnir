import { useRef, useState } from 'react'

export default function useTimer(initialValue: number) {
  const [value, setValue] = useState<number>(initialValue)
  const valueRef = useRef(value)
  const [mode, setMode] = useState<'idle' | 'coundown'>('idle')

  const updateValue = (newValue: number) => {
    valueRef.current = newValue
    setValue(newValue)
  }

  const decrement = () => {
    updateValue(valueRef.current - 1)
  }

  const increment = () => {
    updateValue(valueRef.current + 1)
  }

  const startCountdown = () => {
    if (mode === 'coundown') {
      return
    }
    setMode('coundown')
    const intervalId = setInterval(() => {
      if (valueRef.current === 0) {
        setMode('idle')
        clearInterval(intervalId)
      } else {
        decrement()
      }
    }, 1000)
    return intervalId
  }

  return {
    value: valueRef,
    setValue: updateValue,
    reset: () => updateValue(initialValue),
    startCountdown,
    increment,
    decrement,
    mode,
  }
}
