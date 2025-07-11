import { useState } from "react";
import {
  Modal,
  Button,
  ListGroup,
  Image
} from "react-bootstrap";
import { useTheme } from "../../context/ThemeContext";

export default function GroupInfoModal({
  show,
  onHide,
  chat,
  onUpdate,
  onLeave,
}) {
  const { darkMode } = useTheme();

  if (!chat) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header
        closeButton
        className={darkMode ? "bg-dark text-white" : "bg-light"}
      >
        <Modal.Title>Group Info</Modal.Title>
      </Modal.Header>

      <Modal.Body
        className={darkMode ? "bg-dark text-white" : "bg-white text-dark"}
      >
        <p><strong>Group Name:</strong> {chat.chatName}</p>
        <p><strong>Admin:</strong> {chat.groupAdmin?.firstName} {chat.groupAdmin?.lastName}</p>

        <hr />
        <h6>Members ({chat.users.length}):</h6>
        <ListGroup variant={darkMode ? "dark" : undefined}>
          {chat.users.map((user) => (
            <ListGroup.Item
              key={user._id}
              className="d-flex align-items-center gap-2"
            >
              
              <div>
                {user.firstName} {user.lastName}
                {chat.groupAdmin?._id === user._id && (
                  <span className="ms-2 text-muted" style={{ fontSize: "0.8rem" }}>
                    (admin)
                  </span>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer
        className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
      >
        <Button
          variant="danger"
          onClick={() => onLeave(chat._id, true)}
        >
          Delete Group
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
