import { Box } from "@mui/material";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Item } from "types";
import { PollVote } from "utils";

type Props = {
  votes: PollVote[];
  items: Item[];
};

export default function VotesLog({ votes, items }: Props) {
  // console.log("votes", votes);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const automaticScroll = useRef(true);
  const lastScrollTime = useRef<number>(new Date().getTime());

  const scrollToBottom = () => {
    const scrollableElement = scrollableRef?.current;
    if (scrollableElement) {
      scrollableElement.scrollTop = scrollableElement.scrollHeight;
    }
  };

  useEffect(() => {
    const time = new Date().getTime();
    if (automaticScroll.current || time - lastScrollTime.current > 6000) {
      automaticScroll.current = true;
      scrollToBottom();
    }
  }, [votes.length]);

  const onScroll = (event: React.UIEvent) => {
    const time = new Date().getTime();
    const timeDiff = time - lastScrollTime.current;
    if (timeDiff < 1000) {
      automaticScroll.current = false;
    }
    lastScrollTime.current = time;
  };

  useLayoutEffect(() => {
    if (automaticScroll.current) {
      scrollToBottom();
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
    const pad = (num: number) => (num < 10 ? `0${num}` : num);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div>
      Лог голосования
      <Box
        sx={{ border: "1px solid", m: 1, overflow: "scroll", height: "300px" }}
        ref={scrollableRef}
        onScroll={onScroll}
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
            {formatTime(vote.ts)}: {vote.username} голосует против {vote.message} ({itemNameMap[vote.message]})
          </Box>
        ))}
      </Box>
    </div>
  );
}
