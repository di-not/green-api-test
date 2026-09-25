import styles from "./Chat.module.scss";

export function MessageInput() {
  return (
    <div className={styles.composer}>
      <div className={styles.composerInner}>
        <input
          aria-label="Сообщение"
          className={styles.messageField}
          placeholder="Сообщение"
          type="text"
        />
        <button
          aria-label="Отправить сообщение"
          className={styles.sendButton}
          disabled
          type="button"
        >
          Отправить
        </button>
      </div>
    </div>
  );
}
