import { Box } from "@mui/material";
import { Item } from "../types";
import fireworks from "../images/fireworks.gif";
import { useEffect, useState } from "react";

type Props = {
  winner: Item;
};

export default function Victory({ winner }: Props) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => setShow(true), 500);
  }, []);
  return (
    <Box>
      <h1>Победитель</h1>
      <Box paddingLeft={6} paddingRight={6}>
        <Box sx={{ backgroundColor: "black" }}>
          <Box
            display="flex"
            justifyContent={"center"}
            sx={{
              zIndex: 1,
              backgroundColor: "black",
              visibility: show ? "visible" : "hidden",
            }}
            width={"100%"}
            className="raising"
          >
            <div
              className="neon"
              style={{ textAlign: "center", backgroundColor: "black" }}
            >
              <span
                className="text"
                data-text={winner.title.toLocaleUpperCase()}
              >
                {winner.title.toLocaleUpperCase()}
              </span>
              <span className="gradient"></span>
              <span className="spotlight"></span>
            </div>
          </Box>
        </Box>
        <img
          src={fireworks}
          alt=""
          width={"100%"}
          style={{ zIndex: 10, position: "relative" }}
        />
      </Box>
    </Box>
  );
}
