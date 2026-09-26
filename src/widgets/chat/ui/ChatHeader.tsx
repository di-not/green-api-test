import { IconUser } from "@/shared/icons/user";

import type { ChatHeaderProps } from "../model/types";
import styles from "./Chat.module.scss";

export function ChatHeader({ title, onOpenSettings }: ChatHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.avatar} aria-hidden="true">
        <IconUser />
      </div>
      <div className={styles.headerText}>
        <h1>{title}</h1>
      </div>
      <button
        className={styles.connectButton}
        onClick={onOpenSettings}
        type="button"
      >
        Настройки
      </button>
    </header>
  );
}
