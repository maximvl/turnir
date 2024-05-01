import { Box } from "@mui/material";
import { useLayoutEffect, useRef } from "react";
import { Item } from "../types";
import { PollVote } from "../utils";

type Props = {
  votes: PollVote[];
  items: Item[];
};

export default function VotesLog({ votes, items }: Props) {
  // console.log("votes", votes);
  const scrollableRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scrollableElement = scrollableRef?.current;
    if (scrollableElement) {
      let isScrollAtBottom = false;

      const margin = 50;
      if (
        scrollableElement.scrollTop + margin >
        scrollableElement.scrollHeight - scrollableElement.offsetHeight
      ) {
        isScrollAtBottom = true;
      } else {
        isScrollAtBottom = false;
      }

      if (isScrollAtBottom) {
        scrollableElement.scrollTop = scrollableElement.scrollHeight;
      }
    }
  }, [scrollableRef, votes.length]);

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
        ref={scrollableRef}
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
      </Box>
    </div>
  );
}
