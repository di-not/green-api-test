import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { IconEye } from "@/shared/icons/eye";
import { IconEyeOff } from "@/shared/icons/eyeOff";

import { formatPhone } from "../model/phone";
import { connectionSchema } from "../model/schema";
import type {
  ConnectChatFormProps,
  ConnectionFormValues,
} from "../model/types";
import styles from "./ConnectChatForm.module.scss";

const emptyValues: ConnectionFormValues = {
  apiUrl: "",
  idInstance: "",
  apiTokenInstance: "",
  phoneNumber: "",
};

export function ConnectChatForm({
  initialValues,
  onConnect,
  onCancel,
}: ConnectChatFormProps) {
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnectionFormValues>({
    defaultValues: initialValues
      ? {
          ...initialValues,
          apiUrl: initialValues.apiUrl ?? "",
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
            <label htmlFor="api-url">API URL</label>
            <input
              autoComplete="url"
              id="api-url"
              placeholder="https://4100.api.green-api.com"
              type="url"
              {...register("apiUrl")}
            />
            {errors.apiUrl && (
              <span className={styles.error}>{errors.apiUrl.message}</span>
            )}
          </div>

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
            <div className={styles.tokenInput}>
              <input
                autoComplete="off"
                id="api-token-instance"
                type={isTokenVisible ? "text" : "password"}
                {...register("apiTokenInstance")}
              />
              <button
                aria-label={isTokenVisible ? "Скрыть токен" : "Показать токен"}
                className={styles.toggleToken}
                onClick={() => setIsTokenVisible((visible) => !visible)}
                type="button"
              >
                {isTokenVisible ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
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
          {initialValues?.apiUrl && (
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
