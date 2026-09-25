import styles from "./Chat.module.scss";

export function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <h2>Пока нет сообщений</h2>
    </div>
  );
}
