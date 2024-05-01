import { Box } from "@mui/material";
import { useRef, useState } from "react";
import { Item } from "../types";
import { PollVote } from "../utils";

type Props = {
  votes: PollVote[];
  items: Item[];
};

export default function VotesLog({ votes, items }: Props) {
  // console.log("votes", votes);
  const [scrollAtBottom, setScrollAtBottom] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  if (bottomRef && bottomRef.current && scrollAtBottom) {
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }

  const itemNameMap = items.reduce(
    (acc, item) => {
      acc[item.id] = item.title;
      return acc;
    },
    {} as Record<string, string>,
  );

  const formatTime = (ts: number) => {
    const date = new Date(ts * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div>
      Лог голосования
      <Box
        sx={{ border: "1px solid", m: 1, overflow: "auto", height: "300px" }}
        onScroll={(e) => {
          e.stopPropagation();
          const obj = e.target as HTMLDivElement;
          const margin = 50;
          if (obj.scrollTop + margin > obj.scrollHeight - obj.offsetHeight) {
            setScrollAtBottom(true);
          } else {
            setScrollAtBottom(false);
          }
        }}
      >
        {votes.map((vote, index) => (
          <Box
            textAlign={"left"}
            key={index}
            component="span"
            sx={{
              display: "block",
              m: 1,
            }}
          >
            {formatTime(vote.ts)}: {vote.username} голосует против{" "}
            {vote.message} ({itemNameMap[vote.message]})
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>
    </div>
  );
}
