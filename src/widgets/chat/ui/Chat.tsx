import type { ChatMessage } from "../model/types";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import styles from "./Chat.module.scss";

const messages: ChatMessage[] = [
  {
    id: 1,
    direction: "incoming",
    text: "Hello, world!",
    time: "12:41",
  },
  {
    id: 2,
    direction: "outgoing",
    text: "Hello, world!",
    time: "12:42",
  },
];

export function Chat() {
  return (
    <main className={styles.page}>
      <section className={styles.chat} aria-label="Telegram-чат">
        <ChatHeader title="Анна" />
        <MessageList messages={messages} />
        <MessageInput />
      </section>
    </main>
  );
}
