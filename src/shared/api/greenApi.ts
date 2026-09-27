type GreenApiConfig = {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};

type ApiResponse = {
  status?: boolean;
  reason?: string;
  data?: { reason?: string };
};

export type GreenApiNotification = {
  receiptId: number;
  body: unknown;
};

export class GreenApiError extends Error {
  readonly endpoint: string;
  readonly status: number;
  readonly reason: string | null;

  constructor(
    message: string,
    endpoint: string,
    status: number,
    reason: string | null,
  ) {
    super(message);
    this.endpoint = endpoint;
    this.status = status;
    this.reason = reason;
  }
}

type RequestOptions = {
  method: "GET" | "POST" | "DELETE";
  body?: object;
  path?: string;
  signal?: AbortSignal;
  allowEmpty?: boolean;
};

function getReason(value: unknown): string | null {
  if (typeof value === "string") {
    const reason = value.trim();
    return reason && !reason.startsWith("<") && reason.length <= 200
      ? reason
      : null;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const response = value as ApiResponse;

  if (typeof response.reason === "string" && response.reason.trim()) {
    return response.reason.trim();
  }

  if (
    typeof response.data?.reason === "string" &&
    response.data.reason.trim()
  ) {
    return response.data.reason.trim();
  }

  return null;
}

function getErrorMessage(status: number, reason: string | null): string {
  const error = reason?.toLowerCase() ?? "";

  if (error.includes("instance in starting process")) {
    return "Инстанс запускается. Попробуйте отправить сообщение позже.";
  }

  if (error.includes("instance is starting or not authorized")) {
    return "Инстанс не авторизован или ещё запускается. Проверьте его состояние в GREEN-API.";
  }

  if (error.includes("instance account is expired")) {
    return "Срок действия инстанса истёк. Продлите его в GREEN-API.";
  }

  if (error.includes("instance is deleted")) {
    return "Инстанс удалён. Проверьте настройки чата в GREEN-API.";
  }

  if (error.includes("custom webhook url is set")) {
    return "Для получения сообщений очистите Webhook URL в настройках инстанса GREEN-API.";
  }

  if (
    error.includes("rate_limit_exceeded") ||
    status === 429 ||
    status === 469
  ) {
    return "Превышен лимит запросов. Попробуйте позже.";
  }

  if (status === 401) {
    return "Неверный токен инстанса. Проверьте настройки чата.";
  }

  if (status === 403) {
    return "Неверный ID инстанса или API URL. Проверьте настройки чата.";
  }

  if (status === 404) {
    return "Адрес API не найден. Проверьте API URL в настройках чата.";
  }

  if (status === 499) {
    return "Соединение прервалось до получения ответа от GREEN-API.";
  }

  if (status >= 500) {
    return "GREEN-API временно недоступен. Попробуйте позже.";
  }

  if (
    error.includes("bad request data") ||
    error.includes("validation failed")
  ) {
    return "GREEN-API отклонил данные запроса. Проверьте настройки чата.";
  }

  if (reason) {
    return status === 200
      ? `GREEN-API отклонил запрос: ${reason}`
      : `Ошибка GREEN-API (${status}): ${reason}`;
  }

  return status === 200
    ? "GREEN-API отклонил запрос."
    : `Ошибка GREEN-API (${status}).`;
}

async function request<T>(
  config: GreenApiConfig,
  endpoint: string,
  { method, body, path = "", signal, allowEmpty = false }: RequestOptions,
): Promise<T> {
  const baseUrl = config.apiUrl.replace(/\/+$/, "");
  const url = `${baseUrl}/waInstance${encodeURIComponent(config.idInstance)}/${endpoint}/${encodeURIComponent(config.apiTokenInstance)}${path}`;
  const requestSignal = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(30000)])
    : AbortSignal.timeout(30000);

  let response: Response;
  let responseText: string;

  try {
    response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: requestSignal,
    });

    responseText = await response.text();
  } catch (cause) {
    if (signal?.aborted) {
      throw cause;
    }

    const message =
      cause instanceof Error && cause.name === "TimeoutError"
        ? "GREEN-API не ответил за 30 секунд."
        : "Не удалось связаться с GREEN-API. Проверьте API URL и сеть.";

    throw new Error(endpoint === "sendMessage" ? `${message}` : message, {
      cause,
    });
  }

  let result: unknown;

  try {
    result = JSON.parse(responseText);
  } catch {
    result = responseText;
  }

  const failed =
    result !== null &&
    typeof result === "object" &&
    !Array.isArray(result) &&
    (result as ApiResponse).status === false;

  if (!response.ok || failed) {
    const reason = getReason(result);
    const message = getErrorMessage(response.status, reason);
    const uncertain =
      endpoint === "sendMessage" &&
      (response.status === 499 || response.status >= 500);

    throw new GreenApiError(
      uncertain
        ? `${message} Проверьте Telegram перед повторной отправкой.`
        : message,
      endpoint,
      response.status,
      reason,
    );
  }

  if (allowEmpty && (result === null || responseText.trim() === "")) {
    return null as T;
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error("GREEN-API вернул ответ в неожиданном формате.");
  }

  return result as T;
}

export async function checkAccount(
  config: GreenApiConfig,
  phoneNumber: string,
) {
  const data = await request<
    ApiResponse & { exist?: boolean; chatId?: string }
  >(config, "checkAccount", {
    method: "POST",
    body: { phoneNumber: Number(phoneNumber.replace(/\D/g, "")) },
  });

  if (data.exist === false) {
    throw new Error(
      "Аккаунт Telegram не найден или скрыт настройками приватности.",
    );
  }

  if (data.exist !== true || typeof data.chatId !== "string" || !data.chatId) {
    throw new Error("GREEN-API вернул ответ в неожиданном формате.");
  }

  return data.chatId;
}

export async function sendMessage(
  config: GreenApiConfig,
  chatId: string,
  message: string,
) {
  const data = await request<ApiResponse & { idMessage?: string }>(
    config,
    "sendMessage",
    { method: "POST", body: { chatId, message } },
  );

  if (typeof data.idMessage !== "string" || !data.idMessage) {
    throw new Error("GREEN-API вернул ответ в неожиданном формате.");
  }

  return data.idMessage;
}

export async function receiveNotification(
  config: GreenApiConfig,
  signal: AbortSignal,
): Promise<GreenApiNotification | null> {
  const data = await request<unknown>(config, "receiveNotification", {
    method: "GET",
    path: "?receiveTimeout=5",
    signal,
    allowEmpty: true,
  });

  if (data === null) {
    return null;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("GREEN-API вернул ответ в неожиданном формате.");
  }

  const notification = data as GreenApiNotification;

  if (
    !Number.isInteger(notification.receiptId) ||
    notification.receiptId <= 0 ||
    !notification.body ||
    typeof notification.body !== "object" ||
    Array.isArray(notification.body)
  ) {
    throw new Error("GREEN-API вернул ответ в неожиданном формате.");
  }

  return notification;
}

export async function deleteNotification(
  config: GreenApiConfig,
  receiptId: number,
  signal: AbortSignal,
) {
  const data = await request<{ result?: boolean; reason?: string }>(
    config,
    "deleteNotification",
    { method: "DELETE", path: `/${receiptId}`, signal },
  );

  if (data.result !== true) {
    throw new Error(
      data.reason || "Не удалось подтвердить получение сообщения.",
    );
  }
}
