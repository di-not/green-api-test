import { useEffect, useRef, useState } from "react";

import { sendMessage } from "@/shared/api/greenApi";

import { addMessage } from "../model/message";
import type { ChatMessage, ChatProps } from "../model/types";
import { useChatConnection } from "../model/useChatConnection";
import { useIncomingMessages } from "../model/useIncomingMessages";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import styles from "./Chat.module.scss";

export function Chat({ connection, onOpenSettings }: ChatProps) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sending = useRef(false);
  const mounted = useRef(false);

  const { chatId, isConnecting, connectionError, retryConnection } =
    useChatConnection(connection);
  const receiveError = useIncomingMessages(connection, chatId, setMessages);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  async function handleSend() {
    const message = text.trim();

    if (!message || !chatId || sending.current) {
      return;
    }

    const timestamp = Date.now();
    sending.current = true;
    setIsSending(true);
    setError(null);

    try {
      const idMessage = await sendMessage(connection, chatId, message);

      if (!mounted.current) {
        return;
      }

      setMessages((current) =>
        addMessage(current, {
          id: idMessage,
          direction: "outgoing",
          text: message,
          timestamp,
        }),
      );
      setText("");
    } catch (cause) {
      if (mounted.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Не удалось отправить сообщение.",
        );
      }
    } finally {
      sending.current = false;

      if (mounted.current) {
        setIsSending(false);
      }
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.chat}>
        <ChatHeader
          onOpenSettings={onOpenSettings}
          title={connection.phoneNumber}
        />
        {isConnecting ? (
          <div className={styles.connectionState}>Подключение к чату...</div>
        ) : connectionError ? (
          <div className={styles.connectionState}>
            <p>{connectionError}</p>
            <button onClick={retryConnection} type="button">
              Повторить
            </button>
          </div>
        ) : (
          <>
            <MessageList messages={messages} />
            <MessageInput
              error={error ?? receiveError}
              isSending={isSending}
              onChange={(value) => {
                setText(value);
                setError(null);
              }}
              onSend={handleSend}
              value={text}
            />
          </>
        )}
      </section>
    </main>
  );
}
