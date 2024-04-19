import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { Item } from "../types";
import PollResults from "./PollResults";
import { isArray, isEmpty, isFinite, isObject, isString } from "lodash";

type Props = {
  items: Item[];
  onItemElimination: (index: string) => void;
};

type VkMessageType = {
  push: {
    channel: string;
    pub: {
      offset: number;
      data: {
        type: string;
        data: {
          author: {
            id: number;
          };
          id: number;
          createdAt: number;
          data: {
            type: string;
            content: string;
          }[];
        };
      };
    };
  };
};

const WS_URL =
  "wss://pubsub.live.vkplay.ru/connection/websocket?cf_protocol_version=v2";

type Vote = {
  optionId: number;
  voterId: number;
};

function jsonParseSafe(data: string) {
  try {
    return JSON.parse(data);
  } catch (ex) {
    return null;
  }
}

function getVoteFromMessage(jsonMessage: any): Vote | null {
  const vkMessage = jsonMessage as VkMessageType;
  if (isObject(vkMessage) && vkMessage.push?.pub?.data?.type === "message") {
    const messageData = vkMessage.push?.pub?.data?.data?.data;
    if (isArray(messageData)) {
      const textData = messageData.filter(
        (item) =>
          isObject(item) && item.type === "text" && !isEmpty(item.content),
      );
      if (textData.length > 0) {
        const authorId = vkMessage.push?.pub?.data?.data?.author.id;
        const message = jsonParseSafe(textData[0].content);
        if (isArray(message) && message.length > 0 && isString(message[0])) {
          const optionId = parseInt(message[0], 10);
          if (isFinite(optionId)) {
            return {
              voterId: authorId,
              optionId,
            };
          }
        }
      }
    }
  }
  return null;
}

type VotesDict = {
  [key: string]: number;
};

function initVotesMap(items: Item[]): VotesDict {
  return items.reduce((acc: VotesDict, item) => {
    acc[item.id] = 0;
    return acc;
  }, {});
}

const ReadyStateText = {
  [ReadyState.CONNECTING]: "Подключение",
  [ReadyState.OPEN]: "Открыто",
  [ReadyState.CLOSING]: "Закрытие",
  [ReadyState.CLOSED]: "Закрыто",
  [ReadyState.UNINSTANTIATED]: "Не инициализировано",
};

export default function ViewerChoiceRound({ items, onItemElimination }: Props) {
  const [votesMap, setVotesMap] = useState<{ [key: string]: number }>({});
  const [voters, setVoters] = useState<Set<number>>(new Set());

  useEffect(() => {
    setVotesMap(initVotesMap(items));
    setVoters(new Set());
  }, [items]);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  );

  useEffect(() => {
    if (isObject(lastJsonMessage) && isEmpty(lastJsonMessage)) {
      sendJsonMessage({});
    }

    const vote = getVoteFromMessage(lastJsonMessage);
    if (vote && !voters.has(vote.voterId) && vote.optionId in votesMap) {
      console.log(vote);
      voters.add(vote.voterId);
      setVoters(new Set(voters));
      const votesAmount = votesMap[vote.optionId] || 0;
      setVotesMap({
        ...votesMap,
        [vote.optionId]: votesAmount + 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        connect: {
          token:
            "eyJhbGciOiJIUzI1NiJ9.eyJpbmZvIjp7Imp3dF9nZXRfaXAiOiI0Ni42LjQyLjE3MiJ9LCJzdWIiOiJVTlJFRzpjNGYyNjZkYi1mYzYyLTQ1ZWEtYjFkMS1iMDEwY2M3YmMxNjYiLCJleHAiOjE3MTYwNjYwMzB9.5UqH6Z2oerDgLUvrVK6BPNsGbNeiW1F_zlG9Sqq4tUk",
          name: "js",
        },
        id: 1,
      });
      sendJsonMessage({
        subscribe: { channel: "channel-chat:8845069" },
        id: 2,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState]);

  if (readyState !== ReadyState.OPEN) {
    return (
      <div>
        <p>Подключение к чату: {ReadyStateText[readyState]}</p>
      </div>
    );
  }

  return (
    <div>
      <Box
        display="inline-block"
        alignItems="center"
        style={{ paddingLeft: 16 }}
      >
        <PollResults
          items={items}
          votes={votesMap}
          onItemElimination={onItemElimination}
        />
      </Box>
    </div>
  );
}
