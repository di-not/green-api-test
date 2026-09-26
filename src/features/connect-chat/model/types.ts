import type { z } from "zod";

import type { connectionSchema } from "./schema";

export type ConnectionFormValues = z.input<typeof connectionSchema>;
export type ConnectionData = z.output<typeof connectionSchema>;

export type ConnectChatFormProps = {
  initialValues: ConnectionData | null;
  onConnect: (data: ConnectionData) => void;
  onCancel: () => void;
};
