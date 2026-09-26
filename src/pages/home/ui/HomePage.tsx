import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  ConnectChatForm,
  selectConnection,
  setConnection,
  type ConnectionData,
} from "@/features/connect-chat";
import { Chat } from "@/widgets/chat";

export function HomePage() {
  const connection = useSelector(selectConnection);
  const dispatch = useDispatch();
  
  const [isEditing, setIsEditing] = useState(false);

  function handleConnect(data: ConnectionData) {
    dispatch(setConnection(data));
    setIsEditing(false);
  }

  if (!connection || isEditing) {
    return (
      <ConnectChatForm
        initialValues={connection}
        onCancel={() => setIsEditing(false)}
        onConnect={handleConnect}
      />
    );
  }

  return (
    <Chat
      onOpenSettings={() => setIsEditing(true)}
      recipient={connection.phoneNumber}
    />
  );
}
