import type { MessageListProps } from "../model/types";
import { EmptyState } from "./EmptyState";
import styles from "./Chat.module.scss";

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className={styles.messageArea} aria-label="Сообщения">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={styles.messageContent}>
          <div className={styles.dateLabel}>Пятница</div>
          <ol className={styles.messageList}>
            {messages.map((message) => (
              <li
                className={`${styles.message} ${styles[message.direction]}`}
                key={message.id}
              >
                <p>{message.text}</p>
                <time>{message.time}</time>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
