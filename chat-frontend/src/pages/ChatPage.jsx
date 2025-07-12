import React, { useState, useEffect } from "react";
import ChatLayout from "../components/chat/ChatLayout";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

export default function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chat");
      setChats(data);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  const getChatDisplayName = (chat) => {
    if (!chat) return "";
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users?.find((u) => u._id !== user?._id);
    return `${otherUser?.firstName} ${otherUser?.lastName}`;
  };

  return (
    <div className="chat-container">
      <div className="chat-layout">
        <ChatLayout
          chats={chats}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          loading={loading}
          getChatDisplayName={getChatDisplayName}
        />
      </div>
    </div>
  );
}
