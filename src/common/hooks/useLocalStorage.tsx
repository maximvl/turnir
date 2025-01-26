import { useEffect, useState } from 'react'

type Props = {
  key: string
}

const localState: { [k: string]: string | null } = {}
const localStateChangeListeners: { [k: string]: (() => void)[] } = {}
const syncIntervalRef = setInterval(syncLocalState, 1000)

export default function useLocalStorage({ key }: Props) {
  const [refreshState, setRefreshState] = useState(false)

  const onChange = () => {
    setRefreshState((prev) => !prev)
  }

  useEffect(() => {
    addToLocalState(key)
    addLocalStateChangeListener(key, onChange)
    return () => {
      removeLocalStateChangeListener(key, onChange)
    }
  }, [key])

  const save = (value: any) => {
    saveToLocalState(key, JSON.stringify(value))
  }

  const valueRaw = getFromLocalState(key)
  let currentValue = null
  if (valueRaw !== null) {
    currentValue = JSON.parse(valueRaw)
  }

  return {
    save,
    value: currentValue,
  }
}

function addToLocalState(key: string) {
  if (!(key in localState)) {
    localState[key] = null
  }
}

function getFromLocalState(key: string) {
  const value = localState[key]
  if (value === undefined) {
    return null
  }
  return value
}

function saveToLocalState(key: string, value: string) {
  localStorage.setItem(key, value)
  syncLocalState()
}

function addLocalStateChangeListener(key: string, listener: () => void) {
  localStateChangeListeners[key] = localStateChangeListeners[key] || []
  localStateChangeListeners[key].push(listener)
}

function removeLocalStateChangeListener(key: string, listener: () => void) {
  const listeners = localStateChangeListeners[key]
  if (listeners) {
    const index = listeners.indexOf(listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }
}

function syncLocalState() {
  for (const key in localState) {
    const localValue = localState[key]
    const newValue = localStorage.getItem(key)
    if (localValue !== newValue) {
      localState[key] = newValue
      localStateChangeListeners[key].forEach((listener) => listener())
    }
  }
}
