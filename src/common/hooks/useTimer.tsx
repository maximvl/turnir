import { useRef, useState } from 'react'

export default function useTimer(initialValue: number) {
  const [value, setValue] = useState<number>(initialValue)
  const valueRef = useRef(value)

  const updateValue = (newValue: number) => {
    valueRef.current = newValue
    setValue(newValue)
  }

  return {
    value: valueRef,
    setValue: updateValue,
    reset: () => updateValue(initialValue),
  }
}
