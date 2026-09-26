import type { ConnectionData } from "@/features/connect-chat";

export type ChatMessage = {
  id: string;
  direction: "incoming" | "outgoing";
  text: string;
  time: string;
};

export type ChatHeaderProps = {
  title: string;
  onOpenSettings: () => void;
};

export type ChatProps = {
  connection: ConnectionData;
  onOpenSettings: () => void;
};

export type MessageInputProps = {
  value: string;
  isSending: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onSend: () => void;
};

export type MessageListProps = {
  messages: ChatMessage[];
};
