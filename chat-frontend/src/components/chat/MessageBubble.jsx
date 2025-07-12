import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Image } from "react-bootstrap";
import "./MessageBubble.css";

export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const isSender = message.sender._id === user._id;

  const firstName = message.sender?.firstName ?? "";
  const lastName = message.sender?.lastName ?? "";
  const fallbackName = message.sender?.name ?? "Unknown";
  const fullName = `${firstName} ${lastName}`.trim() || fallbackName;

  const isImage = (file) =>
    file?.endsWith(".jpg") ||
    file?.endsWith(".jpeg") ||
    file?.endsWith(".png") ||
    file?.endsWith(".gif") ||
    file?.endsWith(".webp");

  const BASE_URL = "https://chatverse-backend-0c8u.onrender.com";

  const getFileName = (path) => path?.split("/").pop();
  const getReadableSize = (bytes) => {
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
  };

  return (
    <div className={`d-flex ${isSender ? "justify-content-end" : "justify-content-start"} mb-3`}>
      <div
        className={`message-bubble ${isSender ? "sender" : darkMode ? "receiver-dark" : "receiver-light"}`}
        style={{
          color: isSender ? "#fff" : darkMode ? "#eee" : "#111",
          backgroundColor: isSender ? "#0d6efd" : darkMode ? "#2c2c2c" : "#f1f1f1",
        }}
      >
        {!isSender && (
          <div
            className="sender-name"
            style={{
              color: darkMode ? "#fff" : "#000",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "2px",
            }}
          >
            {fullName}
          </div>
        )}

        <div className="message-content">{message.content}</div>

        {message.file && (
          <div className="message-file mt-2">
            {isImage(message.file) ? (
              <img
                src={`${BASE_URL}${message.file}`}
                alt="Sent File"
                style={{ maxWidth: "200px", borderRadius: "8px", marginBottom: "5px" }}
              />
            ) : (
              <a
                href={`${BASE_URL}${message.file}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  textDecoration: "underline",
                  color: isSender ? "#fff" : darkMode ? "#ddd" : "#007bff",
                }}
              >
                📎 View File
              </a>
            )}
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "2px",
                color: darkMode ? "#bbb" : "#555",
              }}
            >
              {getFileName(message.file)}
              {message.fileSize ? ` • ${getReadableSize(message.fileSize)}` : ""}
            </div>
          </div>
        )}

        <div
          className="message-time"
          style={{
            textAlign: "right",
            fontSize: "0.75rem",
            marginTop: "4px",
            color: darkMode ? "#ccc" : "#666",
          }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
