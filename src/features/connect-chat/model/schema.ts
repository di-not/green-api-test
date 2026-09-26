import { z } from "zod";

import { normalizePhone } from "./phone";

export const connectionSchema = z.object({
  apiUrl: z
    .string()
    .trim()
    .url("Введите корректный API URL")
    .refine((value) => value.startsWith("https://"), "Укажите HTTPS-адрес API"),
  idInstance: z.string().trim().min(1, "Введите ID инстанса"),
  apiTokenInstance: z.string().trim().min(1, "Введите токен инстанса"),
  phoneNumber: z
    .string()
    .min(1, "Введите номер телефона")
    .refine((value) => Boolean(normalizePhone(value)), "Введите корректный номер телефона")
    .transform(normalizePhone),
});
