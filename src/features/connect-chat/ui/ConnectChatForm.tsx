import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { formatPhone } from "../model/phone";
import { connectionSchema } from "../model/schema";
import type {
  ConnectChatFormProps,
  ConnectionFormValues,
} from "../model/types";
import styles from "./ConnectChatForm.module.scss";

const emptyValues: ConnectionFormValues = {
  idInstance: "",
  apiTokenInstance: "",
  phoneNumber: "",
};

export function ConnectChatForm({
  initialValues,
  onConnect,
  onCancel,
}: ConnectChatFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnectionFormValues>({
    defaultValues: initialValues
      ? {
          ...initialValues,
          phoneNumber: formatPhone(initialValues.phoneNumber),
        }
      : emptyValues,
    resolver: zodResolver(connectionSchema),
    mode: "onBlur",
  });

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>
          {initialValues ? "Настройки чата" : "Подключение к чату"}
        </h1>

        <form
          className={styles.form}
          noValidate
          onSubmit={handleSubmit(onConnect)}
        >
          <div className={styles.field}>
            <label htmlFor="id-instance">ID инстанса</label>
            <input
              autoComplete="off"
              id="id-instance"
              {...register("idInstance")}
            />
            {errors.idInstance && (
              <span className={styles.error}>{errors.idInstance.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="api-token-instance">Токен инстанса</label>
            <input
              autoComplete="off"
              id="api-token-instance"
              type="password"
              {...register("apiTokenInstance")}
            />
            {errors.apiTokenInstance && (
              <span className={styles.error}>
                {errors.apiTokenInstance.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="phone-number">Номер телефона собеседника</label>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field }) => (
                <input
                  autoComplete="tel"
                  id="phone-number"
                  inputMode="tel"
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(formatPhone(event.target.value))
                  }
                  placeholder="+7 (999) 123-45-67"
                  ref={field.ref}
                  type="tel"
                  value={field.value}
                />
              )}
            />
            {errors.phoneNumber && (
              <span className={styles.error}>{errors.phoneNumber.message}</span>
            )}
          </div>

          <button className={styles.submitButton} type="submit">
            {initialValues ? "Сохранить" : "Создать чат"}
          </button>
          {initialValues && (
            <button
              className={styles.cancelButton}
              onClick={onCancel}
              type="button"
            >
              Вернуться в чат
            </button>
          )}
        </form>
      </section>
    </main>
  );
}
