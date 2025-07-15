// import React from "react";
// import { useEffect, useState, useRef } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { Button, Spinner, Form, InputGroup, ListGroup } from "react-bootstrap";
// import { useSocket } from "../../context/SocketContext";
// import { useTheme } from "../../context/ThemeContext";
// import MessageBubble from "./MessageBubble";
// import MessageInput from "./MessageInput";
// import Sidebar from "../Sidebar";
// import GroupInfoModal from "../modals/GroupInfoModal";
// import { useNavigate } from "react-router-dom";
// import api from "../../utils/axios";
// import { BiTrash } from "react-icons/bi";

// export default function ChatLayout() {
//   const { user, logout } = useAuth();
//   const socket = useSocket();
//   const navigate = useNavigate();
//   const { theme } = useTheme();

//   const [chats, setChats] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [showGroupInfo, setShowGroupInfo] = useState(false);
//   const [sidebarWidth, setSidebarWidth] = useState(300);
//   const resizerRef = useRef(null);
//   const chatEndRef = useRef(null);

//   const [search, setSearch] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [unreadCounts, setUnreadCounts] = useState({});
//   const [typingUsers, setTypingUsers] = useState({});

//   const typingTimeoutRef = useRef(null);
//   const isTyping = useRef(false);

//   useEffect(() => {
//     if (user) fetchChats();
//   }, [user]);

//   const fetchChats = async () => {
//     try {
//       const { data } = await api.get("/chat");
//       const sorted = data.sort((a, b) =>
//         new Date(b.latestMessage?.createdAt || 0) - new Date(a.latestMessage?.createdAt || 0)
//       );
//       setChats(sorted);
//     } catch (err) {
//       if (["jwt expired", "jwt malformed"].includes(err.response?.data?.message)) {
//         alert("Session expired. Please login again.");
//         logout();
//         navigate("/login");
//       } else {
//         alert("Failed to load chats");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!selectedChat?._id) return;
//     (async () => {
//       try {
//         const { data } = await api.get(`/message/${selectedChat._id}`);
//         setMessages(data);
//         socket?.emit("join-chat", selectedChat._id);
//         // Clear unread count when chat opened
//         setUnreadCounts((prev) => {
//           const updated = { ...prev };
//           delete updated[selectedChat._id];
//           return updated;
//         });
//       } catch {
//         alert("Failed to load messages");
//       }
//     })();
//   }, [selectedChat]);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     if (!socket) return;

//     const handleMessageReceived = (msg) => {
//       const chatId = typeof msg.chat === "string" ? msg.chat : msg.chat?._id;
//       if (!chatId) return;

//       if (selectedChat?._id === chatId) {
//         setMessages((prev) => [...prev, msg]);
//       } else {
//         setUnreadCounts((prev) => ({
//           ...prev,
//           [chatId]: (prev[chatId] || 0) + 1,
//         }));
//       }

//       setChats((prev) => {
//         const index = prev.findIndex((c) => c._id === chatId);
//         if (index === -1) return prev;
//         const updated = { ...prev[index], latestMessage: msg };
//         const newList = [...prev];
//         newList.splice(index, 1);
//         return [updated, ...newList];
//       });
//     };

//     const handleTyping = (chatId, user) => {
//       if (chatId !== selectedChat?._id || user._id === user._id) return;
//       setTypingUsers((prev) => ({ ...prev, [user._id]: user }));
//     };

//     const handleStopTyping = (chatId) => {
//       if (chatId !== selectedChat?._id) return;
//       setTypingUsers({});
//     };

//     socket.on("messageReceived", handleMessageReceived);
//     socket.on("typing", handleTyping);
//     socket.on("stop typing", handleStopTyping);

//     return () => {
//       socket.off("messageReceived", handleMessageReceived);
//       socket.off("typing", handleTyping);
//       socket.off("stop typing", handleStopTyping);
//     };
//   }, [socket, selectedChat]);

//   const getChatDisplayName = (chat) => {
//     if (!chat.isGroupChat) {
//       const other = chat.users.find((u) => u._id !== user._id);
//       return other ? `${other.firstName} ${other.lastName}` : "Unknown";
//     }
//     return chat.chatName || "Unnamed Group";
//   };

//   const handleSendMessage = async () => {
//     if (!newMessage.trim() || !selectedChat?._id) return;
//     try {
//       const { data } = await api.post("/message", {
//         content: newMessage,
//         chatId: selectedChat._id,
//       });
//       setMessages((prev) => [...prev, data]);
//       setNewMessage("");
//       updateLatestMessage(data);
//       socket?.emit("newMessage", data);
//       socket?.emit("stop typing", selectedChat._id);
//       isTyping.current = false;
//     } catch {
//       alert("Failed to send message");
//     }
//   };

//   const handleTyping = () => {
//     if (!socket || !selectedChat?._id) return;

//     if (!isTyping.current) {
//       isTyping.current = true;
//       socket.emit("typing", selectedChat._id);
//     }

//     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

//     typingTimeoutRef.current = setTimeout(() => {
//       socket.emit("stop typing", selectedChat._id);
//       isTyping.current = false;
//     }, 3000);
//   };

//   const updateLatestMessage = (message) => {
//     setChats((prev) => {
//       const index = prev.findIndex((c) => c._id === selectedChat._id);
//       if (index === -1) return prev;
//       const updated = { ...prev[index], latestMessage: message };
//       const newList = [...prev];
//       newList.splice(index, 1);
//       return [updated, ...newList];
//     });
//   };

//   const handleFileUpload = async (file) => {
//     if (!file || !selectedChat?._id) return;
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("chatId", selectedChat._id);
//       const { data } = await api.post("/message/upload", formData);
//       setMessages((prev) => [...prev, data]);
//       updateLatestMessage(data);
//       socket?.emit("newMessage", data);
//     } catch {
//       alert("Failed to upload file");
//     }
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!search.trim()) return;
//     setSearchLoading(true);
//     try {
//       const { data } = await api.get(`/user/search?search=${search}`);
//       setSearchResults(data);
//     } catch {
//       alert("Search failed");
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   const startNewChat = async (userId) => {
//     try {
//       const { data } = await api.post("/chat", { userId });
//       setSelectedChat(data);
//       setSearch("");
//       setSearchResults([]);
//       fetchChats();
//     } catch {
//       alert("Failed to start chat");
//     }
//   };

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       const newWidth = e.clientX;
//       if (newWidth >= 200 && newWidth <= 600) setSidebarWidth(newWidth);
//     };
//     const stopResizing = () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", stopResizing);
//     };
//     const startResizing = () => {
//       document.addEventListener("mousemove", handleMouseMove);
//       document.addEventListener("mouseup", stopResizing);
//     };
//     const resizer = resizerRef.current;
//     if (resizer) resizer.addEventListener("mousedown", startResizing);
//     return () => {
//       if (resizer) resizer.removeEventListener("mousedown", startResizing);
//     };
//   }, []);

//   return (
//     <div style={{ display: "flex", width: "100vw", height: "100dvh", backgroundColor: theme.background }}>
//       <div style={{ display: "flex", flex: 1, height: "100%" }}>
//         <div style={{ width: `${sidebarWidth}px`, minWidth: "300px", maxWidth: "600px", overflowY: "auto", borderRight: `2px solid ${theme.border}` }}>
//           <Sidebar
//             chats={chats}
//             selectedChat={selectedChat}
//             setSelectedChat={setSelectedChat}
//             getChatDisplayName={getChatDisplayName}
//             loading={loading}
//             unreadCounts={unreadCounts}
//           />
//         </div>

//         <div ref={resizerRef} style={{ width: "5px", cursor: "col-resize", backgroundColor: theme.border }} />

//         <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", backgroundColor: theme.surface, borderLeft: `2px solid ${theme.border}`, borderRight: "2px solid var(--secondary)", borderTop: "3px solid var(--secondary)", borderBottom: "2px solid var(--secondary)", height: "100%", marginRight: "20px" }}>
//           <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: theme.card, borderBottom: "2px solid var(--secondary)" }}>
//             <h5 className="mb-0 text-truncate">
//               {selectedChat
//                 ? selectedChat.isGroupChat
//                   ? selectedChat.chatName
//                   : getChatDisplayName(selectedChat)
//                 : "Select a chat to start messaging"}
//             </h5>
//             <div className="d-flex gap-2 align-items-center">
//               {selectedChat?.isGroupChat && (
//                 <Button variant="outline-secondary" size="sm" onClick={() => setShowGroupInfo(true)}>⚙️</Button>
//               )}
//               {selectedChat && (
//                 <Button variant="outline-danger" size="sm" onClick={() => setSelectedChat(null)}>×</Button>
//               )}
//             </div>
//           </div>

//           <Form onSubmit={handleSearch} className="px-4 py-2" style={{ backgroundColor: theme.card, borderBottom: "2px solid var(--secondary)" }}>
//             <InputGroup>
//               <Form.Control
//                 placeholder="Search users..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 style={{ backgroundColor: theme.input, color: theme.text, borderColor: theme.border }}
//               />
//               <Button type="submit" variant="secondary">
//                 {searchLoading ? <Spinner size="sm" animation="border" /> : "Search"}
//               </Button>
//             </InputGroup>
//           </Form>

//           {searchResults.length > 0 && (
//             <div className="px-4 py-2" style={{ backgroundColor: theme.card }}>
//               <ListGroup>
//                 {searchResults.map((u) => (
//                   <ListGroup.Item key={u._id} action className="d-flex align-items-center gap-2" onClick={() => startNewChat(u._id)} style={{ backgroundColor: theme.surface, color: theme.text }}>
//                     <div>
//                       <div>{u.firstName} {u.lastName}</div>
//                       <div style={{ fontSize: "0.8rem", color: theme.subtext }}>{u.email}</div>
//                     </div>
//                   </ListGroup.Item>
//                 ))}
//               </ListGroup>
//             </div>
//           )}

//           <div className="flex-grow-1 px-4" style={{ overflowY: "auto", backgroundColor: theme.surface, paddingTop: "1rem", paddingBottom: "1rem", minHeight: 0 }}>
//             {selectedChat && messages.length > 0 && (
//               <div className="text-end mb-2">
//                 <Button
//                   variant="outline-danger"
//                   size="sm"
//                   onClick={async () => {
//                     if (window.confirm("Delete all your messages in this chat?")) {
//                       try {
//                         await api.delete(`/message/chat/${selectedChat._id}`);
//                         const { data } = await api.get(`/message/${selectedChat._id}`);
//                         setMessages(data);
//                         alert("Messages deleted.");
//                       } catch {
//                         alert("Failed to delete messages.");
//                       }
//                     }
//                   }}
//                 >
//                   <BiTrash size={18} />
//                 </Button>
//               </div>
//             )}
//             {selectedChat ? (
//               messages.map((msg) => <MessageBubble key={msg._id} message={msg} />)
//             ) : (
//               <div className="text-center mt-5">Please select a chat.</div>
//             )}
//             {Object.keys(typingUsers).length > 0 && (
//               <div className="text-muted fst-italic mb-2">Someone is typing...</div>
//             )}
//             <div ref={chatEndRef} />
//           </div>

//           <div style={{ backgroundColor: theme.card, borderTop: "2px solid var(--secondary)", padding: "1rem" }}>
//             <MessageInput
//               newMessage={newMessage}
//               setNewMessage={(val) => {
//                 setNewMessage(val);
//                 handleTyping();
//               }}
//               onSend={handleSendMessage}
//               onFileSelect={handleFileUpload}
//             />
//           </div>
//         </div>
//       </div>

//       {selectedChat?.isGroupChat && (
//         <GroupInfoModal
//           show={showGroupInfo}
//           onHide={() => setShowGroupInfo(false)}
//           chat={selectedChat}
//           onUpdate={(updatedChat) => {
//             setSelectedChat(updatedChat);
//             setChats((prev) => {
//               const others = prev.filter((c) => c._id !== updatedChat._id);
//               return [updatedChat, ...others];
//             });
//           }}
//           onLeave={async (chatId, isDelete = false) => {
//             try {
//               if (isDelete) {
//                 await api.delete(`/chat/${chatId}`);
//               } else {
//                 await api.put(`/chat/leave`, { chatId });
//               }
//               setSelectedChat(null);
//               setShowGroupInfo(false);
//               fetchChats();
//             } catch {
//               alert("Failed to leave group.");
//             }
//           }}
//         />
//       )}
//     </div>
//   );
// }


import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button, Spinner, Form, InputGroup, ListGroup } from "react-bootstrap";
import { useSocket } from "../../context/SocketContext";
import { useTheme } from "../../context/ThemeContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import Sidebar from "../Sidebar";
import GroupInfoModal from "../modals/GroupInfoModal";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import { BiTrash } from "react-icons/bi";

export default function ChatLayout() {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const resizerRef = useRef(null);
  const chatEndRef = useRef(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  const typingTimeoutRef = useRef(null);
  const isTyping = useRef(false);

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chat");
      const sorted = data.sort((a, b) =>
        new Date(b.latestMessage?.createdAt || 0) - new Date(a.latestMessage?.createdAt || 0)
      );
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
    if (!selectedChat?._id) return;
    (async () => {
      try {
        const { data } = await api.get(`/message/${selectedChat._id}`);
        setMessages(data);
        socket?.emit("join-chat", selectedChat._id);
        setUnreadCounts((prev) => {
          const updated = { ...prev };
          delete updated[selectedChat._id];
          return updated;
        });
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
        setUnreadCounts((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || 0) + 1,
        }));
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

    const handleTyping = (chatId, userTyping) => {
      if (chatId !== selectedChat?._id || userTyping._id === user._id) return;
      setTypingUsers((prev) => ({ ...prev, [userTyping._id]: userTyping }));
    };

    const handleStopTyping = (chatId) => {
      if (chatId !== selectedChat?._id) return;
      setTypingUsers({});
    };

    socket.on("messageReceived", handleMessageReceived);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);

    return () => {
      socket.off("messageReceived", handleMessageReceived);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
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
      socket?.emit("stop typing", selectedChat._id);
      isTyping.current = false;
    } catch {
      alert("Failed to send message");
    }
  };

const handleTyping = () => {
  if (!socket || !selectedChat?._id) return;

  if (!isTyping.current) {
    isTyping.current = true;
    console.log("✍️ Emitting 'typing' for chat:", selectedChat._id);
    socket.emit("typing", selectedChat._id);
  }

  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

  typingTimeoutRef.current = setTimeout(() => {
    console.log("🛑 Emitting 'stop typing' for chat:", selectedChat._id);
    socket.emit("stop typing", selectedChat._id);
    isTyping.current = false;
  }, 3000);
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearchLoading(true);
    try {
      const { data } = await api.get(`/user/search?search=${search}`);
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 600) setSidebarWidth(newWidth);
    };
    const stopResizing = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
    };
    const startResizing = () => {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopResizing);
    };
    const resizer = resizerRef.current;
    if (resizer) resizer.addEventListener("mousedown", startResizing);
    return () => {
      if (resizer) resizer.removeEventListener("mousedown", startResizing);
    };
  }, []);

  return (
    <div style={{ display: "flex", width: "100vw", height: "100dvh", backgroundColor: theme.background }}>
      <div style={{ display: "flex", flex: 1, height: "100%" }}>
        <div style={{ width: `${sidebarWidth}px`, minWidth: "300px", maxWidth: "600px", overflowY: "auto", borderRight: `2px solid ${theme.border}` }}>
          <Sidebar
            chats={chats}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            getChatDisplayName={getChatDisplayName}
            loading={loading}
            unreadCounts={unreadCounts}
          />
        </div>

        <div ref={resizerRef} style={{ width: "5px", cursor: "col-resize", backgroundColor: theme.border }} />

        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", backgroundColor: theme.surface, borderLeft: `2px solid ${theme.border}`, borderRight: "2px solid var(--secondary)", borderTop: "3px solid var(--secondary)", borderBottom: "2px solid var(--secondary)", height: "100%", marginRight: "20px" }}>
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: theme.card, borderBottom: "2px solid var(--secondary)" }}>
            <h5 className="mb-0 text-truncate">
              {selectedChat
                ? selectedChat.isGroupChat
                  ? selectedChat.chatName
                  : getChatDisplayName(selectedChat)
                : "Select a chat to start messaging"}
            </h5>
            <div className="d-flex gap-2 align-items-center">
              {selectedChat?.isGroupChat && (
                <Button variant="outline-secondary" size="sm" onClick={() => setShowGroupInfo(true)}>⚙️</Button>
              )}
              {selectedChat && (
                <Button variant="outline-danger" size="sm" onClick={() => setSelectedChat(null)}>×</Button>
              )}
            </div>
          </div>

          <Form onSubmit={handleSearch} className="px-4 py-2" style={{ backgroundColor: theme.card, borderBottom: "2px solid var(--secondary)" }}>
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
            <div className="px-4 py-2" style={{ backgroundColor: theme.card }}>
              <ListGroup>
                {searchResults.map((u) => (
                  <ListGroup.Item key={u._id} action className="d-flex align-items-center gap-2" onClick={() => startNewChat(u._id)} style={{ backgroundColor: theme.surface, color: theme.text }}>
                    <div>
                      <div>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: "0.8rem", color: theme.subtext }}>{u.email}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          <div className="flex-grow-1 px-4" style={{ overflowY: "auto", backgroundColor: theme.surface, paddingTop: "1rem", paddingBottom: "1rem", minHeight: 0 }}>
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
          
            {/* ✅ Typing Indicator */}
           {Object.values(typingUsers)
  .filter((u) => u._id !== user._id)
  .length > 0 && (
    <div className="text-muted fst-italic mb-2">
      {Object.values(typingUsers)
        .filter((u) => u._id !== user._id)
        .map((u) => (
          <span key={u._id} className="typing-indicator">
  {u.firstName} is typing<span className="typing-dots"><span>.</span><span>.</span><span>.</span></span>
</span>

        ))}
    </div>
)}

          
            <div ref={chatEndRef} />
          </div>


          <div style={{ backgroundColor: theme.card, borderTop: "2px solid var(--secondary)", padding: "1rem" }}>
           <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSend={handleSendMessage}
            onFileSelect={handleFileUpload}
            onTyping={handleTyping} // ✅ Pass here
          />

          </div>
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
