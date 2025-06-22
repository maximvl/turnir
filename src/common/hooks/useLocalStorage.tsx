import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

type Props<T> = {
  key: string
  defaultValue?: T | null
}

export default function useLocalStorage<T>(props: {
  key: string
  defaultValue: T
}): {
  save: (value: T) => void
  value: T
}
export default function useLocalStorage<T>(props: { key: string }): {
  save: (value: T) => void
  value: T | null
}

export default function useLocalStorage<T>({
  key,
  defaultValue = null,
}: Props<T>) {
  const eventKey = `local-storage-${key}`

  const [currentValue, setCurrentValue] = useState(defaultValue)
  const [currentValueRaw, setCurrentValueRaw] = useState<string | null>(null)

  const getSnapshot = useCallback(() => {
    return localStorage.getItem(key)
  }, [key])

  const subscribe = useCallback(
    (onChange: () => void) => {
      window.addEventListener(eventKey, onChange)
      return () => window.removeEventListener(eventKey, onChange)
    },
    [eventKey]
  )

  const valueRaw = useSyncExternalStore(subscribe, getSnapshot)

  const save = (value: T) => {
    const rawValue = JSON.stringify(value)
    localStorage.setItem(key, rawValue)
    setCurrentValue(value)
    setCurrentValueRaw(rawValue)
    window.dispatchEvent(new Event(eventKey))
  }

  useEffect(() => {
    if (valueRaw === currentValueRaw) {
      return
    }
    if (valueRaw === null) {
      setCurrentValue(defaultValue)
      setCurrentValueRaw(null)
      return
    }

    try {
      const parsedValue = JSON.parse(valueRaw) as T
      setCurrentValue(parsedValue)
      setCurrentValueRaw(valueRaw)
    } catch (error) {
      console.error(`Error parsing localStorage value for key "${key}":`, error)
    }
  }, [valueRaw])

  return {
    save,
    value: currentValue,
  }
}
