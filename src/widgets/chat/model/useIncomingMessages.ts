import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { ConnectionData } from "@/features/connect-chat";
import {
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
  chatId: string | null,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
) {
  const [receiveError, setReceiveError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    const currentChatId = chatId;
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
          poll();
        }, delay);
      }
    }

    poll();

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [chatId, connection, setMessages]);

  return receiveError;
}
