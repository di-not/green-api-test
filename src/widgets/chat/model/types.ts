export type ChatMessage = {
  id: number;
  direction: "incoming" | "outgoing";
  text: string;
  time: string;
};

export type ChatHeaderProps = {
  title: string;
};

export type MessageListProps = {
  messages: ChatMessage[];
};
