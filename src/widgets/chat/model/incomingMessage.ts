import type { GreenApiNotification } from "@/shared/api/greenApi";

import type { ChatMessage } from "./types";

type IncomingBody = {
  typeWebhook?: string;
  idMessage?: string;
  timestamp?: number;
  senderData?: { chatId?: string };
  messageData?: {
    typeMessage?: string;
    textMessageData?: { textMessage?: string };
  };
};

export function toIncomingMessage(
  notification: GreenApiNotification,
  chatId: string,
): ChatMessage | null {
  const body = notification.body as IncomingBody;

  if (
    body.typeWebhook !== "incomingMessageReceived" ||
    body.senderData?.chatId !== chatId ||
    body.messageData?.typeMessage !== "textMessage" ||
    typeof body.idMessage !== "string" ||
    typeof body.messageData.textMessageData?.textMessage !== "string"
  ) {
    return null;
  }

  const date = typeof body.timestamp === "number"
    ? new Date(body.timestamp * 1000)
    : new Date();
  const time = Number.isNaN(date.getTime()) ? new Date() : date;

  return {
    id: body.idMessage,
    direction: "incoming",
    text: body.messageData.textMessageData.textMessage,
    time: time.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
