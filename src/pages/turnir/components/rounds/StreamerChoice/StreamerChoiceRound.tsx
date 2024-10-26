import { isNull } from 'lodash'
import { useContext, useEffect, useReducer, useState } from 'react'
import { MusicContext } from 'common/hooks/MusicContext'
import { Item, MusicType } from 'pages/turnir/types'
import ListChoice from '../shared/ListChoice'

type Props = {
  items: Item[]
  onItemElimination: (index: string) => void
}

const selectionReducer = (
  state: string | null,
  value: string | null
): string | null => {
  if (!isNull(state) && !isNull(value)) {
    return state
  }
  return value
}

export default function StreamerChoiceRound({
  items,
  onItemElimination,
}: Props) {
  const { setMusicPlaying } = useContext(MusicContext)

  const [selectedItemId, selectionDispatch] = useReducer(selectionReducer, null)

  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    const randomEvent = Math.random() >= 0.5
    setMusicPlaying(randomEvent ? MusicType.Thinking : MusicType.Light)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  useEffect(() => {
    if (selectedItemId) {
      const failureEvent = Math.random() > 0.7
      if (failureEvent) {
        setBlinking(true)
        setMusicPlaying(MusicType.WrongAnswer)
        setTimeout(() => {
          selectionDispatch(null)
          setBlinking(false)
          onItemElimination(selectedItemId)
        }, 2500)
      } else {
        selectionDispatch(null)
        onItemElimination(selectedItemId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemId])

  const handleSelect = (id: string) => {
    onItemElimination(id)
  }

  return <ListChoice items={items} onSelect={handleSelect} />
}
