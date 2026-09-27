import { useEffect, useRef, useState } from "react";

import { sendMessage } from "@/shared/api/greenApi";

import { addMessage } from "../model/message";
import type { ChatMessage, ChatProps } from "../model/types";
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

  const { getChatId, receiveError, startReceiving } = useIncomingMessages(
    connection,
    setMessages,
  );

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  async function handleSend() {
    const message = text.trim();

    if (!message || sending.current) {
      return;
    }

    const timestamp = Date.now();
    sending.current = true;
    setIsSending(true);
    setError(null);

    try {
      const id = await getChatId();

      if (!mounted.current) {
        return;
      }

      startReceiving(id);

      const idMessage = await sendMessage(connection, id, message);

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
      <section className={styles.chat} aria-label="Telegram-чат">
        <ChatHeader
          onOpenSettings={onOpenSettings}
          title={connection.phoneNumber}
        />
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
      </section>
    </main>
  );
}
