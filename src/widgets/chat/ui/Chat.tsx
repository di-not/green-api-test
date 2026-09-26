import type { ChatProps } from "../model/types";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import styles from "./Chat.module.scss";

export function Chat({ recipient, onOpenSettings }: ChatProps) {
  return (
    <main className={styles.page}>
      <section className={styles.chat} aria-label="Telegram-чат">
        <ChatHeader onOpenSettings={onOpenSettings} title={recipient} />
        <MessageList messages={[]} />
        <MessageInput />
      </section>
    </main>
  );
}
