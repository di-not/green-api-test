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

async function post<T extends ApiResponse>(
  config: GreenApiConfig,
  method: string,
  body: object,
): Promise<T> {
  const baseUrl = config.apiUrl.replace(/\/+$/, "");
  const url = `${baseUrl}/waInstance${encodeURIComponent(config.idInstance)}/${method}/${encodeURIComponent(config.apiTokenInstance)}`;

  let response: Response;
  let responseText: string;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    responseText = await response.text();
  } catch (cause) {
    const message =
      cause instanceof Error && cause.name === "TimeoutError"
        ? "GREEN-API не ответил за 30 секунд."
        : "Не удалось связаться с GREEN-API. Проверьте API URL и сеть.";

    throw new Error(method === "sendMessage" ? `${message}` : message, {
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
    const message = getErrorMessage(response.status, getReason(result));
    const uncertain =
      method === "sendMessage" &&
      (response.status === 499 || response.status >= 500);

    throw new Error(
      uncertain
        ? `${message} Проверьте Telegram перед повторной отправкой.`
        : message,
    );
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
  const data = await post<ApiResponse & { exist?: boolean; chatId?: string }>(
    config,
    "checkAccount",
    { phoneNumber: Number(phoneNumber.replace(/\D/g, "")) },
  );

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
  const data = await post<ApiResponse & { idMessage?: string }>(
    config,
    "sendMessage",
    { chatId, message },
  );

  if (typeof data.idMessage !== "string" || !data.idMessage) {
    throw new Error("GREEN-API вернул ответ в неожиданном формате.");
  }

  return data.idMessage;
}
