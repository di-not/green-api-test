import { useRef, useState } from "react";

import { checkAccount, sendMessage } from "@/shared/api/greenApi";

import type { ChatMessage, ChatProps } from "../model/types";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import styles from "./Chat.module.scss";

export function Chat({ connection, onOpenSettings }: ChatProps) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatId = useRef<string | null>(null);
  const sending = useRef(false);

  async function handleSend() {
    const message = text.trim();

    if (!message || sending.current) {
      return;
    }

    sending.current = true;
    setIsSending(true);
    setError(null);

    try {
      if (!chatId.current) {
        chatId.current = await checkAccount(connection, connection.phoneNumber);
      }

      const id = await sendMessage(connection, chatId.current, message);

      setMessages((current) => [
        ...current,
        {
          id,
          direction: "outgoing",
          text: message,
          time: new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setText("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Не удалось отправить сообщение.",
      );
    } finally {
      sending.current = false;
      setIsSending(false);
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
          error={error}
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
