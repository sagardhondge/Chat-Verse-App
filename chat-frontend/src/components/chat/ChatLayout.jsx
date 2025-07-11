import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Button, Spinner, Form, InputGroup, ListGroup } from "react-bootstrap";
import api from "../../utils/axios";
import { useSocket } from "../../context/SocketContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import Sidebar from "../Sidebar";
import GroupInfoModal from "../modals/GroupInfoModal";
import { useNavigate } from "react-router-dom";

export default function ChatLayout() {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const socket = useSocket();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const chatEndRef = useRef(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chat");
      const sortedChats = data.sort((a, b) => {
        const aTime = new Date(a.latestMessage?.createdAt || 0).getTime();
        const bTime = new Date(b.latestMessage?.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setChats(sortedChats);
    } catch (err) {
      if (
        err.response?.data?.message === "jwt expired" ||
        err.response?.data?.message === "jwt malformed"
      ) {
        alert("Session expired. Please login again.");
        logout();
        navigate("/login");
      } else {
        console.error("Failed to load chats", err);
        alert("Error loading chats");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat || !selectedChat._id) return;
      try {
        const { data } = await api.get(`/message/${selectedChat._id}`);
        setMessages(data);
        socket?.emit("join-chat", selectedChat._id);
      } catch (error) {
        console.error("Failed to load messages", error);
        alert("Failed to load messages");
      }
    };
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
useEffect(() => {
  if (!socket) return;

  const handleMessageReceived = (message) => {
    const chatId = typeof message.chat === "string" ? message.chat : message.chat?._id;
    if (!chatId) return;

    // Push message if user is in chat
    if (selectedChat && chatId === selectedChat._id) {
      setMessages((prev) => [...prev, message]);
    } else {
      // Increment unread count
      setUnreadCounts((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || 0) + 1,
      }));
    }

    setChats((prevChats) => {
      const chatIndex = prevChats.findIndex((c) => c._id === chatId);
      if (chatIndex === -1) return prevChats;
      const updatedChat = { ...prevChats[chatIndex], latestMessage: message };
      const newChats = [...prevChats];
      newChats.splice(chatIndex, 1);
      return [updatedChat, ...newChats];
    });
  };

  const handleChatHasUnread = ({ chatId }) => {
    if (selectedChat && selectedChat._id === chatId) return;
    setUnreadCounts((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] || 0) + 1,
    }));
  };

  socket.on("messageReceived", handleMessageReceived);
  socket.on("chatHasUnread", handleChatHasUnread);

  return () => {
    socket.off("messageReceived", handleMessageReceived);
    socket.off("chatHasUnread", handleChatHasUnread);
  };
}, [socket, selectedChat]);

  const getChatDisplayName = (chat) => {
    if (!chat.isGroupChat) {
      const otherUser = chat.users?.find((u) => u._id !== user?._id);
      return otherUser
        ? `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim()
        : "Unknown";
    }
    return chat.chatName || "Unnamed Group";
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?._id) return;
    try {
      const { data } = await api.post("/message", {
        content: newMessage,
        chatId: selectedChat._id,
      });
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex((c) => c._id === selectedChat._id);
        if (chatIndex === -1) return prevChats;
        const updatedChat = { ...prevChats[chatIndex], latestMessage: data };
        const newChats = [...prevChats];
        newChats.splice(chatIndex, 1);
        return [updatedChat, ...newChats];
      });
      socket?.emit("newMessage", data);
    } catch (error) {
      console.error("Message send failed", error);
      alert("Failed to send message");
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !selectedChat?._id) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chatId", selectedChat._id);

      const { data } = await api.post("/message/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages((prev) => [...prev, data]);
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex((c) => c._id === selectedChat._id);
        if (chatIndex === -1) return prevChats;
        const updatedChat = { ...prevChats[chatIndex], latestMessage: data };
        const newChats = [...prevChats];
        newChats.splice(chatIndex, 1);
        return [updatedChat, ...newChats];
      });
      socket?.emit("newMessage", data);
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Failed to upload file");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearchLoading(true);
    try {
      const { data } = await api.get(`/user?search=${search}`);
      setSearchResults(data);
    } catch (err) {
      console.error("Search error", err);
      alert("Failed to search users");
    } finally {
      setSearchLoading(false);
    }
  };

  const startNewChat = async (userId) => {
    try {
      const { data } = await api.post("/chat", { userId });
      setSelectedChat(data);
      setSearch("");
      setSearchResults([]);
      fetchChats();
    } catch (err) {
      console.error("Start chat error", err);
      alert("Failed to start chat");
    }
  };

  return (
    <>
    
      <div
        className={`d-flex vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}
      >
        <Sidebar
          chats={chats}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          getChatDisplayName={getChatDisplayName}
          loading={loading}
        />

        <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: "60%" }}>
          <div
            className={`p-3 border-bottom d-flex justify-content-between align-items-center ${darkMode ? "bg-dark text-white" : "bg-white"}`}
          >
            <div className="d-flex align-items-center gap-3">
              <h5 className="mb-0">
                {selectedChat
                  ? selectedChat.isGroupChat
                    ? selectedChat.chatName
                    : getChatDisplayName(selectedChat)
                  : "Select a chat to start messaging"}
              </h5>

              {selectedChat?.isGroupChat && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowGroupInfo(true)}
                >
                  ⚙️
                </Button>
              )}

              {selectedChat && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setSelectedChat(null)}
                >
                  -
                </Button>
              )}
            </div>
          </div>

          <Form
            onSubmit={handleSearch}
            className={`px-3 py-2 border-bottom ${darkMode ? "bg-dark" : "bg-white"}`}
          >
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="secondary">
                {searchLoading ? <Spinner size="sm" animation="border" /> : "Search"}
              </Button>
            </InputGroup>
          </Form>

          {searchResults.length > 0 && (
            <div className={`px-3 py-2 border-bottom ${darkMode ? "bg-dark" : "bg-white"}`}>
              <ListGroup>
                {searchResults.map((u) => (
                  <ListGroup.Item
                    key={u._id}
                    action
                    className="d-flex align-items-center gap-2"
                    onClick={() => startNewChat(u._id)}
                  >
                    <div>
                      <div>{u.firstName} {u.lastName}</div>
                      <div className="text-muted" style={{ fontSize: "0.8rem" }}>{u.email}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          <div
            className={`flex-grow-1 px-3 py-2 overflow-auto ${darkMode ? "bg-secondary text-white" : "bg-light"}`}
          >
            {selectedChat && messages.length > 0 && (
              <div className="text-end mb-2">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={async () => {
                    if (window.confirm("Delete all your messages in this chat?")) {
                      try {
                        await api.delete(`/message/chat/${selectedChat._id}`);
                        const { data } = await api.get(`/message/${selectedChat._id}`);
                        setMessages(data);
                        alert("Your messages were deleted.");
                      } catch (err) {
                        alert("Failed to delete messages.");
                      }
                    }
                  }}
                >
                  🗑️
                </Button>
              </div>
            )}

            {selectedChat ? (
              messages.map((msg) => <MessageBubble key={msg._id} message={msg} />)
            ) : (
              <div className="text-center mt-5">Please select a chat.</div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={`p-3 border-top ${darkMode ? "bg-dark" : "bg-white"}`}>
            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSend={handleSendMessage}
              onFileSelect={handleFileUpload}
            />
          </div>
        </div>

        {selectedChat?.isGroupChat && (
          <GroupInfoModal
            show={showGroupInfo}
            onHide={() => setShowGroupInfo(false)}
            chat={selectedChat}
            onUpdate={(updatedChat) => {
              setSelectedChat(updatedChat);
              setChats((prev) => {
                const others = prev.filter((c) => c._id !== updatedChat._id);
                return [updatedChat, ...others];
              });
            }}
            onLeave={async (chatId, isDelete = false) => {
              try {
                if (isDelete) {
                  await api.delete(`/chat/${chatId}`);
                } else {
                  await api.put(`/chat/leave`, { chatId });
                }
                setSelectedChat(null);
                setShowGroupInfo(false);
                fetchChats();
              } catch (err) {
                console.error("Leave/Delete Group Failed", err);
                alert("Action failed");
              }
            }}
          />
        )}
      </div>
    </>
  );
}
