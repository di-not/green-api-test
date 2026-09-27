import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { ConnectionData } from "@/features/connect-chat";
import {
  checkAccount,
  deleteNotification,
  GreenApiError,
  receiveNotification,
} from "@/shared/api/greenApi";

import { toIncomingMessage } from "./incomingMessage";
import { addMessage } from "./message";
import type { ChatMessage } from "./types";

function shouldStopPolling(error: unknown) {
  if (!(error instanceof GreenApiError)) {
    return false;
  }

  if (error.status === 401 || error.status === 403) {
    return true;
  }

  if (error.endpoint !== "receiveNotification") {
    return false;
  }

  return (
    error.status === 404 ||
    (error.status === 400 &&
      !error.reason?.toLowerCase().includes("instance in starting process"))
  );
}

export function useIncomingMessages(
  connection: ConnectionData,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
) {
  const [receiveError, setReceiveError] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const chatId = useRef<string | null>(null);
  const chatIdRequest = useRef<Promise<string> | null>(null);

  const getChatId = useCallback(() => {
    if (chatId.current) {
      return Promise.resolve(chatId.current);
    }

    if (!chatIdRequest.current) {
      chatIdRequest.current = checkAccount(connection, connection.phoneNumber)
        .then((id) => {
          chatId.current = id;
          return id;
        })
        .finally(() => {
          chatIdRequest.current = null;
        });
    }

    return chatIdRequest.current;
  }, [connection]);

  useEffect(() => {
    let active = true;

    void getChatId()
      .then((id) => {
        if (active) {
          setActiveChatId(id);
          setReceiveError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setReceiveError(
            cause instanceof Error
              ? cause.message
              : "Не удалось подключиться к чату.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [getChatId]);

  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    const currentChatId = activeChatId;
    const controller = new AbortController();
    let timer: number | undefined;
    let failures = 0;

    async function poll() {
      let delay = 1000;

      try {
        const notification = await receiveNotification(
          connection,
          controller.signal,
        );

        if (controller.signal.aborted) {
          return;
        }

        if (notification) {
          const message = toIncomingMessage(notification, currentChatId);

          if (message) {
            setMessages((current) => addMessage(current, message));
          }

          await deleteNotification(
            connection,
            notification.receiptId,
            controller.signal,
          );
        }

        if (!controller.signal.aborted) {
          failures = 0;
          setReceiveError(null);
        }
      } catch (cause) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          cause instanceof Error
            ? cause.message
            : "Не удалось получить сообщения.";

        if (shouldStopPolling(cause)) {
          setReceiveError(
            `${message} Опрос остановлен. Проверьте настройки чата.`,
          );
          return;
        }

        setReceiveError(message);
        failures += 1;
        delay = Math.min(5000 * 2 ** (failures - 1), 30000);
      }

      if (!controller.signal.aborted) {
        timer = window.setTimeout(() => {
          void poll();
        }, delay);
      }
    }

    void poll();

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activeChatId, connection, setMessages]);

  return { getChatId, receiveError, startReceiving: setActiveChatId };
}
