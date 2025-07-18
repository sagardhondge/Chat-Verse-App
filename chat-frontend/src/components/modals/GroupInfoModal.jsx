import { useState } from "react";
import {
  Modal,
  Button,
  ListGroup,
  Image,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/axios";

export default function GroupInfoModal({
  show,
  onHide,
  chat,
  onUpdate,
  onLeave,
}) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const isAdmin = chat?.groupAdmin?._id === user._id;

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null); // "leave" or "delete"
  const [targetUser, setTargetUser] = useState(null);

  if (!chat) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      const { data } = await api.get(`/user/search?search=${search}`);
      const filtered = data.filter((u) => !chat.users.some((cu) => cu._id === u._id));
      setSearchResults(filtered);
    } catch {
      alert("Failed to search users.");
    } finally {
      setSearching(false);
    }
  };

  const handleAddUser = async (userId) => {
    try {
      const { data } = await api.put("/chat/group/add", {
        chatId: chat._id,
        userId,
      });
      onUpdate(data);
      setSearch("");
      setSearchResults([]);
    } catch {
      alert("Failed to add user.");
    }
  };

  const handleKick = async (userId) => {
    try {
      const { data } = await api.put("/chat/group/remove", {
        chatId: chat._id,
        userId,
      });
      onUpdate(data);
    } catch {
      alert("Failed to remove user.");
    }
  };

  const handlePromote = async (userId) => {
    try {
      const { data } = await api.put("/chat/group/promote", {
        chatId: chat._id,
        userId,
      });
      onUpdate(data);
    } catch {
      alert("Failed to promote user.");
    }
  };

  const confirmAndLeave = () => {
    setConfirmAction("leave");
  };

  const confirmAndDelete = () => {
    setConfirmAction("delete");
  };

  const executeConfirmAction = () => {
    if (confirmAction === "leave") onLeave(chat._id, false);
    if (confirmAction === "delete") onLeave(chat._id, true);
    setConfirmAction(null);
  };

  const modalStyle = {
    backgroundColor: theme.surface,
    color: theme.text,
  };

  const inputStyle = {
    backgroundColor: theme.input,
    color: theme.text,
    borderColor: theme.border,
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton style={modalStyle}>
          <Modal.Title>Group Info</Modal.Title>
        </Modal.Header>

        <Modal.Body style={modalStyle}>
          <p><strong>Group Name:</strong> {chat.chatName}</p>
          <p><strong>Admin:</strong> {chat.groupAdmin?.firstName} {chat.groupAdmin?.lastName}</p>

          <hr />
          <h6>Members ({chat.users.length}):</h6>
          <ListGroup>
            {chat.users.map((u) => (
              <ListGroup.Item
                key={u._id}
                className="d-flex justify-content-between align-items-center"
                style={{ backgroundColor: theme.background, color: theme.text }}
              >
                <div>
                  {u.firstName} {u.lastName}
                  {chat.groupAdmin?._id === u._id && (
                    <span className="ms-2 text-muted" style={{ fontSize: "0.85rem" }}>
                      (admin)
                    </span>
                  )}
                </div>
                {isAdmin && user._id !== u._id && (
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-warning"
                      onClick={() => handlePromote(u._id)}
                    >
                      Promote
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleKick(u._id)}
                    >
                      Kick
                    </Button>
                  </div>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>

          <hr />
          <h6>Add Members</h6>
          <Form onSubmit={handleSearch} className="mb-3">
            <InputGroup>
              <Form.Control
                placeholder="Search users"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />
              <Button type="submit" variant="secondary">
                {searching ? <Spinner size="sm" animation="border" /> : "Search"}
              </Button>
            </InputGroup>
          </Form>
          {searchResults.map((u) => (
            <Button
              key={u._id}
              variant="light"
              className="w-100 mb-2 text-start"
              onClick={() => handleAddUser(u._id)}
              style={{ backgroundColor: theme.card, color: theme.text }}
            >
              {u.firstName} {u.lastName}
            </Button>
          ))}
        </Modal.Body>

<Modal.Footer style={modalStyle}>
  {isAdmin && (
    <Button variant="danger" onClick={confirmAndDelete}>
      Delete Group
    </Button>
  )}
  <Button variant="outline-danger" onClick={confirmAndLeave}>
    Leave Group
  </Button>
  <Button variant="secondary" onClick={onHide}>
    Close
  </Button>
</Modal.Footer>
      </Modal>

      {/* Confirm Modal */}
      <Modal show={!!confirmAction} onHide={() => setConfirmAction(null)} centered>
        <Modal.Header closeButton style={modalStyle}>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body style={modalStyle}>
          {confirmAction === "leave" && "Are you sure you want to leave this group?"}
          {confirmAction === "delete" && "This will delete the group permanently. Continue?"}
        </Modal.Body>
        <Modal.Footer style={modalStyle}>
          <Button variant="secondary" onClick={() => setConfirmAction(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={executeConfirmAction}>
            Yes, Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
