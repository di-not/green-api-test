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
    !body.idMessage ||
    typeof body.messageData.textMessageData?.textMessage !== "string"
  ) {
    return null;
  }

  const date = new Date(
    typeof body.timestamp === "number" ? body.timestamp * 1000 : NaN,
  );

  return {
    id: body.idMessage,
    direction: "incoming",
    text: body.messageData.textMessageData.textMessage,
    timestamp: Number.isNaN(date.getTime()) ? Date.now() : date.getTime(),
  };
}
