export type ChatMessage = {
  id: number;
  direction: "incoming" | "outgoing";
  text: string;
  time: string;
};

export type ChatHeaderProps = {
  title: string;
  onOpenSettings: () => void;
};

export type ChatProps = {
  recipient: string;
  onOpenSettings: () => void;
};

export type MessageListProps = {
  messages: ChatMessage[];
};
