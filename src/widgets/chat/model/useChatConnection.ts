import { useEffect, useRef, useState } from "react";

import type { ConnectionData } from "@/features/connect-chat";
import { checkAccount } from "@/shared/api/greenApi";

export function useChatConnection(connection: ConnectionData) {
  const [result, setResult] = useState<{
    connection: ConnectionData;
    attempt: number;
    chatId: string | null;
    error: string | null;
  } | null>(null);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const chatIdRequest = useRef<{
    connection: ConnectionData;
    attempt: number;
    promise: Promise<string>;
  } | null>(null);

  const currentResult =
    result?.connection === connection && result.attempt === connectionAttempt
      ? result
      : null;
  const chatId = currentResult?.chatId ?? null;
  const connectionError = currentResult?.error ?? null;
  const isConnecting = currentResult === null;

  useEffect(() => {
    let active = true;

    if (
      chatIdRequest.current?.connection !== connection ||
      chatIdRequest.current.attempt !== connectionAttempt
    ) {
      const promise = checkAccount(connection, connection.phoneNumber).finally(
        () => {
          if (chatIdRequest.current?.promise === promise) {
            chatIdRequest.current = null;
          }
        },
      );

      chatIdRequest.current = {
        connection,
        attempt: connectionAttempt,
        promise,
      };
    }

    chatIdRequest.current.promise
      .then((id) => {
        if (active) {
          setResult({
            connection,
            attempt: connectionAttempt,
            chatId: id,
            error: null,
          });
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setResult({
            connection,
            attempt: connectionAttempt,
            chatId: null,
            error:
              cause instanceof Error
                ? cause.message
                : "Не удалось подключиться к чату.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [connection, connectionAttempt]);

  function retryConnection() {
    setConnectionAttempt((attempt) => attempt + 1);
  }

  return { chatId, isConnecting, connectionError, retryConnection };
}
