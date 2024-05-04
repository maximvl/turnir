import { Box, Button } from "@mui/material";
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
} from "@mui/material/colors";
import { useContext, useEffect, useRef, useState } from "react";
import { MusicContext } from "../contexts/MusicContext";
import { Item, MusicType } from "../types";

enum WheelState {
  Start,
  Acceleration,
  ConstantSpeed,
  Deceleration,
  Stop,
}

type Props = {
  items: Item[];
  onItemElimination: (index: string) => void;
};

export default function Wheel({ items, onItemElimination }: Props) {
  const animationRef = useRef<number>();
  const timeRef = useRef<number>();
  const rotationRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speedRef = useRef<number>(0);
  const wheelState = useRef<WheelState>(WheelState.Start);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (isFinished) {
      setMusicPlaying(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  useEffect(() => {
    rotationRef.current = 0;
    speedRef.current = 0;
    wheelState.current = WheelState.Start;
    setIsFinished(false);
  }, [items.length]);

  const { setMusicPlaying } = useContext(MusicContext);

  const slowestSpeed = 0.00009;
  const fastestSpeed = 0.09;
  const acceleration = 0.0003;

  const decelerationSteps = [
    [0.01, 0.0002],
    [0.001, 0.00005],
    [0.0001, 0.00001],
    [0, 0.000002],
  ];

  const amountOfItems = items.length;

  const size = 400;
  const diameter = size;
  const radius = diameter / 2;
  const centerX = diameter / 2;
  const centerY = diameter / 2;
  const pieceAngle = (2 * Math.PI) / amountOfItems;
  const angleHalf = pieceAngle / 2;

  const getSelectedItemId = (rotation: number) => {
    const initialAngle = angleHalf + (90 * Math.PI) / 180;
    const initialIndex = Math.round((initialAngle + rotation) / pieceAngle) - 1;
    return amountOfItems - 1 - (initialIndex % amountOfItems);
  };

  const [currentItemIndex, setCurrentItemIndex] = useState<number>(() =>
    getSelectedItemId(rotationRef.current),
  );

  const currentItem = items[currentItemIndex];

  const piece = new Path2D();
  piece.moveTo(0, 0);
  piece.arc(0, 0, radius, 0, pieceAngle);
  piece.lineTo(0, 0);

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
  ];

  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    // console.log(canvas, context, rotation);
    if (context) {
      context.save();
      context.translate(centerX, centerY);
      context.rotate(rotation);

      context.font = "15px Arial";
      const textOffset = 40;
      for (let i = 0; i < amountOfItems; i++) {
        const color = colors[i % colors.length];

        context.fillStyle = color;
        context.strokeStyle = color;
        context.fill(piece);

        context.save();
        context.rotate(angleHalf);
        let text = items[i].title;
        const textWidth = context.measureText(text).width;
        // console.log("radius", radius);
        // console.log("text", text, textWidth);
        if (textWidth + textOffset > radius) {
          // console.log("replacing", text);
          text = text.slice(0, 15) + "...";
        }

        context.fillStyle = "white";
        context.fillText(text, textOffset, 5);
        context.restore();

        context.rotate(pieceAngle);
      }
      context.restore();
    }
  };

  const onRefChange = (canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  };

  const animate = (time: number) => {
    if (timeRef.current) {
      const delta = time - timeRef.current;

      if (delta > 5) {
        // console.log(wheelState.current, speedRef.current, rotationRef.current);
        switch (wheelState.current) {
          case WheelState.Acceleration:
            speedRef.current += acceleration;
            if (speedRef.current >= fastestSpeed) {
              wheelState.current = WheelState.ConstantSpeed;
              const randomTime = Math.random() * 3000 + 2000;
              setTimeout(() => {
                wheelState.current = WheelState.Deceleration;
              }, randomTime);
            }
            break;
          case WheelState.Deceleration:
            let deceleration = 0;
            for (const step of decelerationSteps) {
              if (speedRef.current >= step[0]) {
                deceleration = step[1];
                break;
              }
            }
            speedRef.current -= deceleration;
            if (speedRef.current <= slowestSpeed) {
              console.log(speedRef.current, slowestSpeed, deceleration);
              setIsFinished(true);
              speedRef.current = 0;
              wheelState.current = WheelState.Stop;
            }
            break;
          default:
            break;
        }
        rotationRef.current = rotationRef.current + speedRef.current;
        if (rotationRef.current > 2 * Math.PI) {
          rotationRef.current = 0;
        }
        drawWheel(rotationRef.current);
        timeRef.current = time;
        const newSelectedIndex = getSelectedItemId(rotationRef.current);
        setCurrentItemIndex((old: number) => {
          if (newSelectedIndex !== old) {
            //console.log(rotationPiece % pieces);
            // console.log("setting new index", newSelectedIndex, old);
            return newSelectedIndex;
          }
          return old;
        });
      }
    } else {
      timeRef.current = time;
      // animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const startSpinning = () => {
    if (wheelState.current === WheelState.Start) {
      setMusicPlaying(MusicType.Wheel);
      wheelState.current = WheelState.Acceleration;
      speedRef.current = slowestSpeed;
    }
  };

  return (
    <Box justifyContent={"center"}>
      {currentItem ? (
        <h2 style={{ marginBottom: 0 }}>{currentItem.title}</h2>
      ) : null}
      {isFinished && (
        <Button
          sx={{ margin: 1 }}
          color="error"
          variant="outlined"
          onClick={() => onItemElimination(currentItem.id)}
        >
          Удалить
        </Button>
      )}
      <div style={{ width: "100%", justifyContent: "center", display: "flex" }}>
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "40px solid white",
            borderLeft: "40px solid transparent",
            borderRight: "40px solid transparent",
          }}
        />
      </div>
      <canvas
        ref={onRefChange}
        width={size}
        height={size}
        onClick={startSpinning}
      />
    </Box>
  );
}
