import { Box, Button } from "@mui/material";
import { blue, blueGrey, brown, green, indigo, orange, pink, purple, teal } from "@mui/material/colors";
import { useContext, useEffect, useRef, useState } from "react";
import { MusicContext } from "contexts/MusicContext";
import { Item, MusicType } from "types";
import ItemTitle from "components/ItemTitle";

enum WheelState {
  Start,
  Acceleration,
  ConstantSpeed,
  Deceleration,
  Stop,
}

type Props = {
  items: Item[];
  onItemWinning: (index: string) => void;
  ButtonComponent?: (props: React.ComponentProps<typeof Button>) => JSX.Element;
};

export default function Wheel({ items, onItemWinning, ButtonComponent }: Props) {
  const animationRef = useRef<number>();
  const timeRef = useRef<number>();
  const rotationRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speedRef = useRef<number>(0);
  const wheelState = useRef<WheelState>(WheelState.Start);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [hasBacktrack, setHasBacktrack] = useState<boolean>(() => Math.random() > 0.5);

  useEffect(() => {
    if (isFinished) {
      setMusicPlaying(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const { setMusicPlaying } = useContext(MusicContext);
  const amountOfItems = items.length;

  const size = 400;
  const sizeOffset = 10;
  const diameter = size - sizeOffset;
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

  const [currentItemIndex, setCurrentItemIndex] = useState<number>(() => getSelectedItemId(rotationRef.current));

  useEffect(() => {
    rotationRef.current = 0;
    speedRef.current = 0;
    wheelState.current = WheelState.Start;
    setIsFinished(false);
    setHasBacktrack(Math.random() > 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const currentItem: Item | undefined = items[currentItemIndex];

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
      context.translate(sizeOffset / 2, sizeOffset / 2);
      context.translate(centerX, centerY);
      context.rotate(rotation);

      context.font = "15px Arial";
      const textOffsetFromCenter = 40;
      for (let i = 0; i < amountOfItems; i++) {
        const color = colors[i % colors.length];

        context.fillStyle = color;
        context.fill(piece);
        context.strokeStyle = "white";
        context.lineWidth = 2;
        context.stroke(piece);

        context.save();
        context.rotate(angleHalf);
        let text = items[i].title;
        const textWidth = context.measureText(text).width;
        // console.log("radius", radius);
        // console.log("text", text, textWidth);
        if (textWidth + textOffsetFromCenter > radius) {
          // console.log("replacing", text);
          text = text.slice(0, 18) + "...";
        }

        context.fillStyle = "white";
        context.fillText(text, textOffsetFromCenter, 5);
        context.restore();

        context.rotate(pieceAngle);
      }
      context.fillStyle = "white";
      context.beginPath();
      context.arc(0, 0, 20, 0, 2 * Math.PI);
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = "white";
      context.stroke();
      context.restore();
    }
  };

  const onRefChange = (canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  };

  const startSpeed = 0.00009;
  const slowestSpeed = 0.0006;
  const fastestSpeed = 0.2;
  const acceleration = 0.0005;

  const decelerationSteps: Array<Array<number>> = [];
  const decelerationPercent = 20;
  let currentStep = fastestSpeed;
  while (currentStep > slowestSpeed) {
    currentStep = (currentStep / 100) * (100 - decelerationPercent);
    decelerationSteps.push([currentStep, 500]);
  }

  const backtrackSpeed = -0.001;
  const backtrackTime = 2000 + 1000 * Math.random();

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
              const randomTime = Math.random() * 1500 + Math.random() * 1000 + 1500;
              setTimeout(() => {
                wheelState.current = WheelState.Deceleration;
              }, randomTime);
            }
            break;
          case WheelState.Deceleration:
            let timer = 0;
            for (const item of decelerationSteps) {
              if (speedRef.current > item[0]) {
                speedRef.current = item[0];
                timer = item[1];
                break;
              }
            }
            if (speedRef.current <= slowestSpeed) {
              if (hasBacktrack) {
                speedRef.current = backtrackSpeed;
                wheelState.current = WheelState.ConstantSpeed;
                // console.log("start backtracking", speedRef.current);
                setTimeout(() => {
                  setIsFinished(true);
                  speedRef.current = 0;
                  wheelState.current = WheelState.Stop;
                }, backtrackTime);
              } else {
                setIsFinished(true);
                speedRef.current = 0;
                wheelState.current = WheelState.Stop;
              }
            } else {
              setTimeout(() => {
                wheelState.current = WheelState.Deceleration;
              }, timer);
              // console.log("setting timer", timer, "for speed", speedRef.current);
              wheelState.current = WheelState.ConstantSpeed;
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
          // console.log("new index", newSelectedIndex);
          if (newSelectedIndex !== old) {
            //console.log(rotationPiece % pieces);
            // console.log("setting new index", newSelectedIndex, old);
            return newSelectedIndex;
          }
          return old;
          // return newSelectedIndex;
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
      speedRef.current = startSpeed;
    }
  };

  const onClick = () => {
    setIsFinished(false);
    rotationRef.current = 0;
    speedRef.current = 0;
    wheelState.current = WheelState.Start;
    onItemWinning(currentItem.id);
  };

  const defaultButtonProps: React.ComponentProps<typeof Button> = {
    sx: { margin: 1 },
    color: "error",
    variant: "contained",
    onClick: onClick,
  };

  const DefaultButton = (props: React.ComponentProps<typeof Button>) => (
    <Button {...props}>{currentItem.isProtected ? "Снять защиту" : "Удалить"}</Button>
  );

  const FinalButton = ButtonComponent ? ButtonComponent : DefaultButton;

  return (
    <Box justifyContent={"center"}>
      {currentItem ? (
        <Box alignItems={"center"} display="flex" justifyContent={"center"}>
          <h2 style={{ margin: 0 }}>
            <ItemTitle item={currentItem} />
          </h2>
        </Box>
      ) : null}
      {isFinished && <FinalButton {...defaultButtonProps} />}
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
      <canvas ref={onRefChange} width={size} height={size} onClick={startSpinning} />
    </Box>
  );
}
