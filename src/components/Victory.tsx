import { Box } from "@mui/material";
import { Item } from "../types";
import fireworks from "../images/fireworks.gif";

type Props = {
  winner: Item;
};

export default function Victory({ winner }: Props) {
  return (
    <Box>
      <h1>Победитель</h1>
      <Box paddingLeft={6} paddingRight={6}>
        <Box
          display="flex"
          justifyContent={"center"}
          sx={{ backgroundColor: "black" }}
          width={"100%"}
        >
          <div
            className="neon"
            style={{ backgroundColor: "black", textAlign: "left" }}
          >
            <span className="text" data-text={winner.title.toLocaleUpperCase()}>
              {winner.title.toLocaleUpperCase()}
            </span>
            <span className="gradient"></span>
            <span className="spotlight"></span>
          </div>
        </Box>
        <img src={fireworks} alt="" width={"100%"} />
      </Box>
    </Box>
  );
}
