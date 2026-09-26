import { useEffect, useRef } from "react";

import type { MessageListProps } from "../model/types";
import { EmptyState } from "./EmptyState";
import styles from "./Chat.module.scss";

export function MessageList({ messages }: MessageListProps) {
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (areaRef.current) {
      areaRef.current.scrollTop = areaRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className={styles.messageArea} aria-label="Сообщения" ref={areaRef}>
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={styles.messageContent}>
          <div className={styles.dateLabel}>Сегодня</div>
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
