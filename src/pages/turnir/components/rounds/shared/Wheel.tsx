import React from 'react'
import { Box, Button } from '@mui/material'
import {
  blue,
  blueGrey,
  brown,
  green,
  indigo,
  orange,
  pink,
  purple,
  teal,
} from '@mui/material/colors'
import { useContext, useEffect, useRef, useState } from 'react'
import { MusicContext } from '@/common/hooks/MusicContext'
import { Item, MusicType } from '@/pages/turnir/types'
import ItemTitle from '../../ItemTitle'
import CatDance from '@/assets/cat_dance.webp'
import { random } from 'lodash'

enum WheelState {
  Start,
  Acceleration,
  ConstantSpeed,
  Deceleration,
  Stop,
}

type Props = {
  items: Item[]
  onItemWinning: (index: string) => void
  ButtonComponent?: (
    props: React.ComponentProps<typeof Button>
  ) => React.JSX.Element
  buttonGenerator?: (
    item: Item
  ) => (props: React.ComponentProps<typeof Button>) => React.JSX.Element
  centerImage?: string
  music?: MusicType
}

export default function Wheel({
  items,
  onItemWinning,
  ButtonComponent,
  centerImage,
  music,
  buttonGenerator,
}: Props) {
  const animationRef = useRef<number | null>(null)
  const timeRef = useRef<number | null>(null)
  const rotationRef = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const speedRef = useRef<number>(0)
  const wheelState = useRef<WheelState>(WheelState.Start)
  const [isFinished, setIsFinished] = useState<boolean>(false)
  const [hasBacktrack, setHasBacktrack] = useState<boolean>(
    () => Math.random() > 0.5
  )
  const [initialAngle, setInitialAngle] = useState<number>(() => random(0, 360))

  const { setMusicPlaying } = useContext(MusicContext)
  useEffect(() => {
    if (isFinished && !music) {
      setMusicPlaying(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, music])

  const amountOfItems = items.length

  const size = 400
  const sizeOffset = 0
  const diameter = size - sizeOffset
  const radius = diameter / 2 + 2
  const centerX = diameter / 2
  const centerY = diameter / 2
  const pieceAngle = (2 * Math.PI) / amountOfItems
  const angleHalf = pieceAngle / 2

  const getSelectedItemId = (rotation: number) => {
    const startingAngle = angleHalf + ((90 + initialAngle) * Math.PI) / 180
    const initialIndex = Math.round((startingAngle + rotation) / pieceAngle) - 1
    return amountOfItems - 1 - (initialIndex % amountOfItems)
  }

  const [currentItemIndex, setCurrentItemIndex] = useState<number>(() =>
    getSelectedItemId(rotationRef.current)
  )

  useEffect(() => {
    rotationRef.current = 0
    speedRef.current = 0
    wheelState.current = WheelState.Start
    setIsFinished(false)
    setHasBacktrack(Math.random() > 0.5)
    setInitialAngle(random(0, 360))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  const currentItem: Item | undefined = items[currentItemIndex]

  const piece = new Path2D()
  piece.moveTo(0, 0)
  piece.arc(0, 0, radius, 0, pieceAngle)
  piece.lineTo(0, 0)

  const colors = [
    indigo[500],
    teal[500],
    pink[500],
    orange[800],
    green[600],
    blue[500],
    purple[300],
    blueGrey[500],
    brown[500],
    purple[800],
  ]

  const centerRadius = 30

  const arrowPath = new Path2D()
  arrowPath.moveTo(centerX, centerY - radius + 30)
  arrowPath.lineTo(centerX - 30, centerY - radius)
  arrowPath.lineTo(centerX - 18, centerY - radius + 2)
  arrowPath.lineTo(centerX, centerY - radius + 20)
  arrowPath.lineTo(centerX + 18, centerY - radius + 2)
  arrowPath.lineTo(centerX + 30, centerY - radius)
  arrowPath.lineTo(centerX, centerY - radius + 30)

  const lineSeparator = new Path2D()
  lineSeparator.moveTo(0, 0)
  lineSeparator.lineTo(radius * Math.cos(0), radius * Math.sin(0))

  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const selectedIndex = getSelectedItemId(rotationRef.current)
    // console.log(canvas, context, rotation);
    if (context) {
      context.save()
      context.translate(sizeOffset / 2, sizeOffset / 2)
      context.translate(centerX, centerY)
      context.rotate(rotation + initialAngle * (Math.PI / 180))

      context.font = '15px Arial'
      const textOffsetFromCenter = 45
      for (let i = 0; i < amountOfItems; i++) {
        const color = colors[i % colors.length]

        context.fillStyle = color
        if (wheelState.current === WheelState.Stop && i !== selectedIndex) {
          context.fillStyle = '#36454F'
        }

        context.fill(piece)
        context.strokeStyle = 'white'
        context.lineWidth = 2
        context.stroke(lineSeparator)

        context.save()
        context.rotate(angleHalf)
        let text = items[i].title
        const textWidth = context.measureText(text).width
        // console.log("radius", radius);
        // console.log("text", text, textWidth);
        if (textWidth + textOffsetFromCenter > radius) {
          // console.log("replacing", text);
          text = text.slice(0, 18) + '...'
        }

        context.fillStyle = 'white'
        context.fillText(text, textOffsetFromCenter, 5)
        context.restore()

        context.rotate(pieceAngle)
      }
      context.strokeStyle = 'white'
      context.lineWidth = 2
      context.stroke(lineSeparator)

      context.restore()

      context.fillStyle = 'white'
      context.strokeStyle = 'black'
      context.lineWidth = 2
      context.fill(arrowPath)
      context.stroke(arrowPath)
    }
  }

  const onRefChange = (canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas
  }

  const startSpeed = 0.00009
  const slowestSpeed = 0.0006
  const fastestSpeed = 0.2
  const acceleration = 0.0005

  const decelerationSteps: Array<Array<number>> = []
  const decelerationPercent = 20
  let currentStep = fastestSpeed
  while (currentStep > slowestSpeed) {
    currentStep = (currentStep / 100) * (100 - decelerationPercent)
    decelerationSteps.push([currentStep, 500])
  }

  const backtrackSpeed = -0.001
  const backtrackTime = 2500 + 700 * Math.random()

  const animate = (time: number) => {
    if (timeRef.current) {
      const delta = time - timeRef.current

      if (delta > 5) {
        // console.log(wheelState.current, speedRef.current, rotationRef.current);
        switch (wheelState.current) {
          case WheelState.Acceleration:
            speedRef.current += acceleration
            if (speedRef.current >= fastestSpeed) {
              wheelState.current = WheelState.ConstantSpeed
              const randomTime =
                Math.random() * 1500 + Math.random() * 1000 + 1500
              setTimeout(() => {
                wheelState.current = WheelState.Deceleration
              }, randomTime)
            }
            break
          case WheelState.Deceleration:
            let timer = 0
            for (const item of decelerationSteps) {
              if (speedRef.current > item[0]) {
                speedRef.current = item[0]
                timer = item[1]
                break
              }
            }
            if (speedRef.current <= slowestSpeed) {
              if (hasBacktrack) {
                speedRef.current = backtrackSpeed
                wheelState.current = WheelState.ConstantSpeed
                // console.log("start backtracking", speedRef.current);
                setTimeout(() => {
                  setIsFinished(true)
                  speedRef.current = 0
                  wheelState.current = WheelState.Stop
                }, backtrackTime)
              } else {
                setIsFinished(true)
                speedRef.current = 0
                wheelState.current = WheelState.Stop
              }
            } else {
              setTimeout(() => {
                wheelState.current = WheelState.Deceleration
              }, timer)
              // console.log("setting timer", timer, "for speed", speedRef.current);
              wheelState.current = WheelState.ConstantSpeed
            }
            break
          default:
            break
        }
        rotationRef.current = rotationRef.current + speedRef.current
        if (rotationRef.current > 2 * Math.PI) {
          rotationRef.current = 0
        }
        drawWheel(rotationRef.current)
        timeRef.current = time
        const newSelectedIndex = getSelectedItemId(rotationRef.current)
        setCurrentItemIndex((old: number) => {
          // console.log("new index", newSelectedIndex);
          if (newSelectedIndex !== old) {
            //console.log(rotationPiece % pieces);
            // console.log("setting new index", newSelectedIndex, old);
            return newSelectedIndex
          }
          return old
          // return newSelectedIndex;
        })
      }
    } else {
      timeRef.current = time
      // animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  const startSpinning = () => {
    if (wheelState.current === WheelState.Start) {
      setMusicPlaying(music || MusicType.Wheel)
      wheelState.current = WheelState.Acceleration
      speedRef.current = startSpeed
    }
  }

  const onClick = () => {
    setIsFinished(false)
    rotationRef.current = 0
    speedRef.current = 0
    wheelState.current = WheelState.Start
    onItemWinning(currentItem.id)
  }

  const defaultButtonProps: React.ComponentProps<typeof Button> = {
    sx: { margin: 1 },
    color: 'error',
    variant: 'contained',
    onClick: onClick,
  }

  const DefaultButton = (props: React.ComponentProps<typeof Button>) => (
    <Button {...props}>Удалить</Button>
  )

  let FinalButton = DefaultButton

  if (isFinished && buttonGenerator) {
    FinalButton = buttonGenerator(currentItem)
  }

  if (isFinished && ButtonComponent) {
    FinalButton = ButtonComponent
  }

  const displayCenterImage = ![WheelState.Start, WheelState.Stop].includes(
    wheelState.current
  )

  return (
    <Box justifyContent={'center'}>
      {currentItem ? (
        <Box alignItems={'center'} display="flex" justifyContent={'center'}>
          <h2 style={{ margin: 0 }}>
            <ItemTitle item={currentItem} />
          </h2>
        </Box>
      ) : null}
      {isFinished && <FinalButton {...defaultButtonProps} />}
      <div style={{ justifyContent: 'center', display: 'flex', marginTop: 10 }}>
        <div
          style={{
            position: 'relative',
            margin: 0,
            padding: 0,
            width: `${size + 8}px`,
            height: `${size + 8}px`,
            borderWidth: '4px',
            borderStyle: 'solid',
            borderRadius: '50%',
            borderColor: 'white',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <canvas
            ref={onRefChange}
            width={size}
            height={size}
            onClick={startSpinning}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: 1,
              opacity: wheelState.current === WheelState.Start ? 0.5 : 1,
            }}
          />
          <div
            onClick={startSpinning}
            style={{
              position: 'absolute',
              top: -6,
              left: -6,
              zIndex: 2,
              width: `${size + 12}px`,
              height: `${size + 12}px`,
              borderRadius: '50%',
              borderColor: 'white',
              borderWidth: '6px',
              borderStyle: 'solid',
            }}
          />
          <div
            onClick={startSpinning}
            style={{
              position: 'absolute',
              top: -2,
              left: -2,
              zIndex: 2,
              width: `${size + 4}px`,
              height: `${size + 4}px`,
              borderRadius: '50%',
              borderColor: 'black',
              borderWidth: '2px',
              borderStyle: 'solid',
            }}
          />

          {wheelState.current === WheelState.Start && (
            <Button
              onClick={startSpinning}
              variant="contained"
              style={{
                zIndex: 10,
              }}
            >
              Запуск
            </Button>
          )}

          <img
            src={centerImage || CatDance}
            alt=""
            style={{
              position: 'absolute',
              display: displayCenterImage ? 'block' : 'none',
              top: `${size / 2 - centerRadius}px`,
              left: `${size / 2 - centerRadius}px`,
              width: centerRadius * 2,
              height: centerRadius * 2,
              zIndex: 5,
            }}
            onClick={startSpinning}
          />
        </div>
      </div>
    </Box>
  )
}
