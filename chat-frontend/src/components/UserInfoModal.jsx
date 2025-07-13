import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";
import ThemePicker from "./ThemePicker";
import api from "../utils/axios";
import {
  ListGroup,
  Button,
  Image,
  Modal,
  Badge,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { FaChevronDown, FaChevronUp, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Sidebar({
  chats,
  selectedChat,
  setSelectedChat,
  getChatDisplayName,
  loading,
}) {
  const { user, logout, onlineUsers = [] } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [showProfile, setShowProfile] = useState(false);
  const [isChatListOpen, setIsChatListOpen] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [unreadChats, setUnreadChats] = useState(new Set());

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isUserOnline = (chat) => {
    if (!chat.isGroupChat && Array.isArray(chat.users)) {
      const otherUser = chat.users.find((u) => u._id !== user._id);
      return onlineUsers.includes(otherUser?._id);
    }
    return false;
  };

  const openGroupModal = () => {
    setGroupName("");
    setSearchTerm("");
    setSearchResults([]);
    setSelectedMembers([]);
    setShowGroupModal(true);
  };

  const searchUsers = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try {
      const { data } = await api.get(`/user?search=${searchTerm}`);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
      alert("Search users failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleMember = (u) => {
    setSelectedMembers((prev) =>
      prev.find((m) => m._id === u._id)
        ? prev.filter((m) => m._id !== u._id)
        : [...prev, u]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length < 2) {
      return alert("Group name and at least 2 members required");
    }
    setCreating(true);
    try {
      const res = await api.post("/chat/group", {
        chatName: groupName,
        users: selectedMembers.map((m) => m._id),
      });
      setSelectedChat(res.data);
      chats.unshift(res.data);
      setShowGroupModal(false);
    } catch (err) {
      console.error(err);
      alert("Create group failed");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleUnread = ({ chatId }) => {
      setUnreadChats((prev) => new Set(prev).add(chatId));
    };
    socket.on("chatHasUnread", handleUnread);
    return () => socket.off("chatHasUnread", handleUnread);
  }, [socket]);

  useEffect(() => {
    if (selectedChat?._id) {
      setUnreadChats((prev) => {
        const updated = new Set(prev);
        updated.delete(selectedChat._id);
        return updated;
      });
    }
  }, [selectedChat]);

  return (
    <>
      <div style={{ display: "flex" }}>
        <div
          className="glow-border"
          style={{
            width: "4px",
            backgroundColor: "gray",
            height: "100vh",
            borderRadius: "0 4px 4px 0",
          }}
        />

        <div
          className={`d-flex flex-column justify-content-between ${
            theme.sidebar
          } border-start`}
          style={{
            width: "300px",
            height: "100vh",
            fontFamily: "Segoe UI, sans-serif",
            overflowY: "auto",
            transition: "all 0.3s ease",
          }}
        >
          <div>
            <div
              className="d-flex align-items-center justify-content-between gap-2 p-3 border-bottom"
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex align-items-center gap-2" onClick={() => setShowProfile(true)}>
                <Image
                  src={`${BASE_URL}${user?.avatar || "/default-avatar.png"}`}
                  roundedCircle
                  width={40}
                  height={40}
                  style={{ border: "2px solid #ccc" }}
                />
                <strong className="text-truncate">
                  {user?.firstName} {user?.lastName}
                </strong>
              </div>
              {/* Theme Picker Icon beside profile */}
              <ThemePicker iconOnly />
            </div>

            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
              <div
                onClick={() => setIsChatListOpen((prev) => !prev)}
                className="d-flex align-items-center"
                style={{ cursor: "pointer" }}
              >
                <span className="fw-semibold me-2">Chats</span>
                {isChatListOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              <Button variant="link" onClick={openGroupModal} title="Create Group Chat">
                <FaUsers />
              </Button>
            </div>

            {isChatListOpen && (
              <ListGroup
                variant="flush"
                className="chat-scroll"
                style={{ overflowY: "auto", maxHeight: "60vh" }}
              >
                {loading ? (
                  <ListGroup.Item className="text-center">Loading chats...</ListGroup.Item>
                ) : !Array.isArray(chats) || chats.length === 0 ? (
                  <ListGroup.Item>No chats yet</ListGroup.Item>
                ) : (
                  chats.map((chat) => {
                    const otherUser = chat.users.find((u) => u && u._id !== user._id);
                    const online = isUserOnline(chat);

                    return (
                      <ListGroup.Item
                        key={chat._id}
                        action
                        active={selectedChat?._id === chat._id}
                        onClick={() => setSelectedChat(chat)}
                        className={`d-flex justify-content-between align-items-center ${
                          theme.chatItem
                        }`}
                        style={{
                          fontWeight: selectedChat?._id === chat._id ? "bold" : "normal",
                          fontSize: "1rem",
                          padding: "0.75rem 1rem",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          {!chat.isGroupChat && otherUser && (
                            <div style={{ position: "relative" }}>
                              <Image
                                src={`${BASE_URL}${otherUser?.avatar || "/default-avatar.png"}`}
                                roundedCircle
                                width={45}
                                height={45}
                                style={{
                                  objectFit: "cover",
                                  border: "1px solid #ccc",
                                }}
                              />
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  right: 0,
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "50%",
                                  backgroundColor: online ? "blue" : "gray",
                                  border: "2px solid white",
                                }}
                              />
                            </div>
                          )}
                          <span className="text-truncate" style={{ maxWidth: "200px" }}>
                            {getChatDisplayName(chat)}
                          </span>
                        </div>
                        {unreadChats.has(chat._id) && <Badge bg="danger" pill>•</Badge>}
                      </ListGroup.Item>
                    );
                  })
                )}
              </ListGroup>
            )}
          </div>

          <div className="p-3 border-top d-flex flex-column gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              className="w-100"
              onClick={() => navigate("/account")}
            >
              Account
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="w-100"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Your Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image
            src={`${BASE_URL}${user?.avatar || "/default-avatar.png"}`}
            roundedCircle
            width={200}
            height={200}
            className="mb-3"
          />
          <h5>{user?.firstName} {user?.lastName}</h5>
          <p>{user?.email}</p>
          {user?.about && <p className="mb-3">{user.about}</p>}
        </Modal.Body>
      </Modal>

      {/* Group Create Modal */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Group Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Group Name</Form.Label>
            <Form.Control
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </Form.Group>
          <Form onSubmit={searchUsers} className="mb-3">
            <InputGroup>
              <Form.Control
                placeholder="Search users to add"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" variant="outline-secondary">
                {searchLoading ? <Spinner size="sm" animation="border" /> : "Search"}
              </Button>
            </InputGroup>
          </Form>

          {searchResults.map((u) => (
            <Button
              key={u._id}
              variant={
                selectedMembers.find((m) => m._id === u._id) ? "success" : "light"
              }
              className="w-100 mb-2 text-start"
              onClick={() => toggleMember(u)}
            >
              {u.firstName} {u.lastName}{" "}
              {selectedMembers.find((m) => m._id === u._id) ? "✔️" : ""}
            </Button>
          ))}

          {selectedMembers.length > 0 && (
            <div className="mb-2">
              <strong>Selected:</strong>{" "}
              {selectedMembers.map((m) => m.firstName).join(", ")}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGroupModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={creating} onClick={handleCreateGroup}>
            {creating ? "Creating..." : "Create Group"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
