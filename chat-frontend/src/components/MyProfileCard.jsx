import { useState, useEffect } from "react";
import { Modal, Button, Form, Image, Spinner, ListGroup } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/axios";

export default function GroupInfoModal({ show, onHide, group, updateGroup }) {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [groupName, setGroupName] = useState("");
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (group?.chatName) {
      setGroupName(group.chatName);
    }
  }, [group]);

  if (!group) return null;

  const isAdmin = group?.groupAdmin?._id === user._id;

  const handleRename = async () => {
    if (!groupName.trim()) return;
    setRenaming(true);
    try {
      const { data } = await api.put("/chat/rename", {
        chatId: group._id,
        chatName: groupName,
      });
      updateGroup(data);
      onHide();
    } catch (err) {
      console.error("Rename failed", err);
      alert("Failed to rename group");
    } finally {
      setRenaming(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName={darkMode ? "bg-dark text-white" : ""}
    >
      <Modal.Header closeButton>
        <Modal.Title>Group Info</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <Image
          src="/group-avatar.png"
          alt="Group"
          roundedCircle
          width={100}
          height={100}
          className="mb-3"
        />

        <h5>{group.chatName}</h5>
        <p className="text-muted mb-3">
          Admin: {group?.groupAdmin?.firstName} {group?.groupAdmin?.lastName}
        </p>

        <ListGroup className="mb-3 text-start">
          {group.users.map((u) => (
            <ListGroup.Item
              key={u._id}
              className={darkMode ? "bg-dark text-white" : ""}
            >
              {u.firstName} {u.lastName} {u._id === user._id && "(You)"}
            </ListGroup.Item>
          ))}
        </ListGroup>

        {isAdmin && (
          <Form.Group className="text-start">
            <Form.Label>Rename Group</Form.Label>
            <Form.Control
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter new group name"
              className={darkMode ? "bg-dark text-white border-secondary" : ""}
            />
          </Form.Group>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {isAdmin && (
          <Button variant="primary" onClick={handleRename} disabled={renaming}>
            {renaming ? <Spinner size="sm" animation="border" /> : "Rename"}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
