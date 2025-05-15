import { motion } from 'framer-motion'

type DigitProps = {
  digit: number
  rollCount?: number // how many times to roll through the digits
}

const digitHeight = 42 // height of the digit in pixels

function RollingDigit({ digit, rollCount = 3 }: DigitProps) {
  const totalSteps = rollCount * 10 + digit
  const totalDigits = totalSteps + 1
  const digits = Array.from({ length: totalDigits })

  const spacing = 5
  const digitTotalHeight = digitHeight + spacing
  const offset = digitTotalHeight * totalSteps - digitHeight * 0.3

  return (
    <div
      style={{
        overflow: 'hidden',
        // height: `${digitHeight}px`,
        display: 'inline-block',
        height: '100%',
        width: '1ch',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: `-${offset}px` }}
        // animate={{ y: `-${totalSteps * digitHeight - 13}px` }}
        transition={{
          duration: 1.2, // longer duration
          ease: [0.25, 1, 0.5, 1], // easeOutExpo-ish
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${spacing}px`,
        }}
      >
        {digits.map((_, i) => (
          <div
            key={i}
            style={{
              // height: `${digitHeight}px`,
              // lineHeight: `${digitHeight}px`,
              height: '100%',
              lineHeight: '100%',
              textAlign: 'center',
              fontSize: 'inherit',
            }}
          >
            {i % 10}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

type RollProps = {
  value: string
  height: number // height of the digit
  digits?: number // force digit count (e.g., 2 for 01, 10)
  rollCount?: number // how many times to roll through the digits
}

export default function RollingNumber({
  value,
  height,
  digits = 2,
  rollCount = 3,
}: RollProps) {
  const padded = value.toString().padStart(digits, '0')

  return (
    <div style={{ display: 'flex', fontSize: 'inherit' }}>
      {padded.split('').map((char, i) => (
        <div key={`${value}-${i}`} style={{ height }}>
          <RollingDigit
            key={`${value}-${i}`}
            digit={parseInt(char)}
            rollCount={rollCount + i}
          />
        </div>
        // +i staggers rolls to make it feel slot-machine-like
      ))}
    </div>
  )
}
