import { useState } from 'react'
import { motion } from 'framer-motion'

type Props = {
  frontSide: React.ReactNode
  backSide: React.ReactNode
  disabled?: boolean
  onFlip?: () => void
}

export default function Flipper({
  frontSide,
  backSide,
  disabled,
  onFlip,
}: Props) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    if (disabled) return
    setIsFlipped(!isFlipped)
  }

  const handleAnimationComplete = () => {
    if (isFlipped && !disabled) {
      onFlip?.()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: '1000px', // Adds 3D perspective
      }}
    >
      <motion.div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: 10,
          cursor: disabled ? 'default' : 'pointer',
          position: 'relative',
          transformStyle: 'preserve-3d', // Ensures child elements are rendered in 3D space
        }}
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        onAnimationComplete={handleAnimationComplete}
      >
        {/* Front of the card */}
        <motion.div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden', // Hides the back of the card when flipped
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {frontSide}
        </motion.div>

        {/* Back of the card */}
        <motion.div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: 'rotateY(180deg)', // Initially flipped to the back
          }}
        >
          {backSide}
        </motion.div>
      </motion.div>
    </div>
  )
}
