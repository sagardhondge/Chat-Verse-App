import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button, Spinner, Form, InputGroup, ListGroup } from "react-bootstrap";
import { useSocket } from "../../context/SocketContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import Sidebar from "../Sidebar";
import GroupInfoModal from "../modals/GroupInfoModal";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { BiTrash } from "react-icons/bi"; // ✅ Modern trash icon
import { themes } from "../../theme";

export default function ChatLayout() {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [themeName, setThemeName] = useState(localStorage.getItem("chat-theme") || "light");
  const [theme, setTheme] = useState(themes[themeName] || themes.light);

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

  // 🟢 Real-time theme update
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = localStorage.getItem("chat-theme") || "light";
      setThemeName(current);
      setTheme(themes[current] || themes.light);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chat");
      const sorted = data.sort((a, b) => new Date(b.latestMessage?.createdAt || 0) - new Date(a.latestMessage?.createdAt || 0));
      setChats(sorted);
    } catch (err) {
      if (["jwt expired", "jwt malformed"].includes(err.response?.data?.message)) {
        alert("Session expired. Please login again.");
        logout();
        navigate("/login");
      } else {
        alert("Failed to load chats");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  useEffect(() => {
    if (!selectedChat?._id) return;
    (async () => {
      try {
        const { data } = await api.get(`/message/${selectedChat._id}`);
        setMessages(data);
        socket?.emit("join-chat", selectedChat._id);
      } catch {
        alert("Failed to load messages");
      }
    })();
  }, [selectedChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (msg) => {
      const chatId = typeof msg.chat === "string" ? msg.chat : msg.chat?._id;
      if (!chatId) return;

      if (selectedChat?._id === chatId) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnreadCounts((prev) => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }));
      }

      setChats((prev) => {
        const index = prev.findIndex((c) => c._id === chatId);
        if (index === -1) return prev;
        const updated = { ...prev[index], latestMessage: msg };
        const newList = [...prev];
        newList.splice(index, 1);
        return [updated, ...newList];
      });
    };

    const handleUnread = ({ chatId }) => {
      if (selectedChat?._id !== chatId) {
        setUnreadCounts((prev) => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }));
      }
    };

    socket.on("messageReceived", handleMessageReceived);
    socket.on("chatHasUnread", handleUnread);

    return () => {
      socket.off("messageReceived", handleMessageReceived);
      socket.off("chatHasUnread", handleUnread);
    };
  }, [socket, selectedChat]);

  const getChatDisplayName = (chat) => {
    if (!chat.isGroupChat) {
      const other = chat.users.find((u) => u._id !== user._id);
      return other ? `${other.firstName} ${other.lastName}` : "Unknown";
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
      updateLatestMessage(data);
      socket?.emit("newMessage", data);
    } catch {
      alert("Failed to send message");
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !selectedChat?._id) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chatId", selectedChat._id);

      const { data } = await api.post("/message/upload", formData);
      setMessages((prev) => [...prev, data]);
      updateLatestMessage(data);
      socket?.emit("newMessage", data);
    } catch {
      alert("Failed to upload file");
    }
  };

  const updateLatestMessage = (message) => {
    setChats((prev) => {
      const index = prev.findIndex((c) => c._id === selectedChat._id);
      if (index === -1) return prev;
      const updated = { ...prev[index], latestMessage: message };
      const newList = [...prev];
      newList.splice(index, 1);
      return [updated, ...newList];
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearchLoading(true);
    try {
      const { data } = await api.get(`/user?search=${search}`);
      setSearchResults(data);
    } catch {
      alert("Search failed");
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
    } catch {
      alert("Failed to start chat");
    }
  };

  return (
    <div style={{ backgroundColor: theme.background, color: theme.text }} className="d-flex vh-100">
      <Sidebar
        chats={chats}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        getChatDisplayName={getChatDisplayName}
        loading={loading}
      />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: "60%" }}>
        <div
          style={{
            backgroundColor: theme.card,
            borderBottom: `1px solid ${theme.border}`,
            padding: "1rem",
          }}
          className="d-flex justify-content-between align-items-center"
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
              <Button variant="outline-secondary" size="sm" onClick={() => setShowGroupInfo(true)}>
                ⚙️
              </Button>
            )}

            {selectedChat && (
              <Button variant="outline-danger" size="sm" onClick={() => setSelectedChat(null)}>
                ×
              </Button>
            )}
          </div>
        </div>

        <Form onSubmit={handleSearch} style={{ backgroundColor: theme.card, borderBottom: `1px solid ${theme.border}`, padding: "0.5rem 1rem" }}>
          <InputGroup>
            <Form.Control
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ backgroundColor: theme.input, color: theme.text, borderColor: theme.border }}
            />
            <Button type="submit" variant="secondary">
              {searchLoading ? <Spinner size="sm" animation="border" /> : "Search"}
            </Button>
          </InputGroup>
        </Form>

        {searchResults.length > 0 && (
          <div style={{ backgroundColor: theme.card, borderBottom: `1px solid ${theme.border}`, padding: "0.5rem 1rem" }}>
            <ListGroup>
              {searchResults.map((u) => (
                <ListGroup.Item
                  key={u._id}
                  action
                  className="d-flex align-items-center gap-2"
                  onClick={() => startNewChat(u._id)}
                  style={{ backgroundColor: theme.surface, color: theme.text }}
                >
                  <div>
                    <div>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: "0.8rem", color: theme.subtext }}>{u.email}</div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        <div className="flex-grow-1 px-3 py-2 overflow-auto" style={{ backgroundColor: theme.surface }}>
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
                      alert("Messages deleted.");
                    } catch {
                      alert("Failed to delete messages.");
                    }
                  }
                }}
              >
                <BiTrash size={18} />
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

        <div style={{ backgroundColor: theme.card, borderTop: `1px solid ${theme.border}`, padding: "1rem" }}>
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
            } catch {
              alert("Failed to leave group.");
            }
          }}
        />
      )}
    </div>
  );
}
