import type { ChatHeaderProps } from "../model/types";
import styles from "./Chat.module.scss";

export function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.avatar} aria-hidden="true">
        {title.charAt(0)}
      </div>
      <div className={styles.headerText}>
        <h1>{title}</h1>
      </div>
      <button className={styles.connectButton} disabled type="button">
        Подключиться
      </button>
    </header>
  );
}
