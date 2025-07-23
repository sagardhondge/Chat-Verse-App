import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  ListGroup,
  Form,
  InputGroup,
  Spinner,
  Image,
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
  const [confirmAction, setConfirmAction] = useState(null);
  const [groupImage, setGroupImage] = useState(null);
  const [updatingImage, setUpdatingImage] = useState(false);

  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty("--theme-surface", theme.surface);
      root.style.setProperty("--theme-text", theme.text);
      root.style.setProperty("--theme-border", theme.border);
      root.style.setProperty("--theme-shadow", theme.shadow);
      root.style.setProperty("--theme-input", theme.input || "#f5f5f5");
      root.style.setProperty("--theme-background", theme.background || "#ffffff");
      root.style.setProperty("--theme-card", theme.card || theme.surface);
    }
  }, [theme]);

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
      const { data } = await api.put(`/group/${chat._id}/add`, { userId });
      onUpdate(data);
      setSearch("");
      setSearchResults([]);
    } catch {
      alert("Failed to add user.");
    }
  };

  const handleKick = async (userId) => {
    try {
      const { data } = await api.put(`/group/${chat._id}/remove`, { userId });
      onUpdate(data);
    } catch {
      alert("Failed to remove user.");
    }
  };

  const handlePromote = async (userId) => {
    try {
      const { data } = await api.put(`/group/${chat._id}/promote`, { userId });
      onUpdate(data);
    } catch {
      alert("Failed to promote user.");
    }
  };

  const confirmAndLeave = () => setConfirmAction("leave");
  const confirmAndDelete = () => setConfirmAction("delete");

  const executeConfirmAction = () => {
    if (confirmAction === "leave") onLeave(chat._id, false);
    if (confirmAction === "delete") onLeave(chat._id, true);
    setConfirmAction(null);
  };

  const handleImageUpload = async () => {
    if (!groupImage) return;
    const formData = new FormData();
    formData.append("groupImage", groupImage);

    try {
      setUpdatingImage(true);
      const { data } = await api.put(`/group/${chat._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdate(data);
      setGroupImage(null);
    } catch {
      alert("Failed to update group image.");
    } finally {
      setUpdatingImage(false);
    }
  };

  const resolveImageSrc = () => {
    if (groupImage) return URL.createObjectURL(groupImage);
    if (chat.groupImage) {
      return chat.groupImage.startsWith("http")
        ? chat.groupImage
        : `${import.meta.env.VITE_API_URL}${chat.groupImage}`;
    }
    return "/default-group.png";
  };

  const modalStyle = {
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
  };

  const inputStyle = {
    backgroundColor: "var(--theme-input)",
    color: "var(--theme-text)",
    borderColor: "var(--theme-border)",
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton style={modalStyle}>
          <Modal.Title>Group Info</Modal.Title>
        </Modal.Header>

        <Modal.Body style={modalStyle}>
          <div className="text-center mb-3">
            <Image
              src={resolveImageSrc()}
              alt="Group Avatar"
              roundedCircle
              width={120}
              height={120}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-group.png";
              }}
              style={{
                objectFit: "cover",
                border: `2px solid var(--theme-border)`,
                backgroundColor: "var(--theme-surface)",
              }}
            />
          </div>

          {isAdmin && (
            <Form.Group className="mb-3 text-center">
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setGroupImage(e.target.files[0])}
                style={{ ...inputStyle, maxWidth: 300, margin: "0 auto" }}
              />
              <Button
                className="mt-2"
                variant="outline-success"
                size="sm"
                disabled={!groupImage || updatingImage}
                onClick={handleImageUpload}
              >
                {updatingImage ? <Spinner animation="border" size="sm" /> : "Upload Photo"}
              </Button>
            </Form.Group>
          )}

          <p><strong>Group Name:</strong> {chat.chatName}</p>
          <p><strong>Admin:</strong> {chat.groupAdmin?.firstName} {chat.groupAdmin?.lastName}</p>

          <hr />
          <h6>Members ({chat.users.length}):</h6>
          <ListGroup>
            {chat.users.map((u) => (
              <ListGroup.Item
                key={u._id}
                className="d-flex justify-content-between align-items-center"
                style={{ backgroundColor: "var(--theme-background)", color: "var(--theme-text)" }}
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
              style={{ backgroundColor: "var(--theme-card)", color: "var(--theme-text)" }}
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