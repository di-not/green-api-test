import type { MessageInputProps } from "../model/types";
import styles from "./Chat.module.scss";

export function MessageInput({
  value,
  isSending,
  error,
  onChange,
  onSend,
}: MessageInputProps) {
  return (
    <form
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
    >
      <div className={styles.composerInner}>
        <input
          className={styles.messageField}
          disabled={isSending}
          maxLength={4096}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Сообщение"
          type="text"
          value={value}
        />
        <button
          className={styles.sendButton}
          disabled={isSending || !value.trim()}
          type="submit"
        >
          {isSending ? "Отправка..." : "Отправить"}
        </button>
      </div>
      {error && <span className={styles.composerError}>{error}</span>}
    </form>
  );
}
