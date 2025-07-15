import { useAuth } from "../../context/AuthContext";
import { themes } from "../../theme";
import { Image } from "react-bootstrap";
import "./MessageBubble.css";
import api from "../../utils/axios";

export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const themeName = localStorage.getItem("chat-theme") || "light";
  const theme = themes[themeName] || themes.light;

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

  const BASE_API = import.meta.env.VITE_API_URL;

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

  const bubbleStyle = {
    backgroundColor: isSender ? theme.secondary : "#5a6f71ff",
    color: "#fff",
    borderRadius: "1rem",
    padding: "0.6rem 1rem",
    maxWidth: "75%",
    wordWrap: "break-word",
    boxShadow: "0 1px 3px rgba(174, 168, 168, 0.1)",
  };

  const senderNameStyle = {
    color: theme.subtext,
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "2px",
  };

  const timeStyle = {
    textAlign: "right",
    fontSize: "0.75rem",
    marginTop: "4px",
    color: theme.subtext,
  };

  return (
    <div className={`d-flex ${isSender ? "justify-content-end" : "justify-content-start"} mb-3`}>
      <div className="message-bubble" style={bubbleStyle}>
        {!isSender && (
          <div className="sender-name" style={senderNameStyle}>
            {}
          </div>
        )}

        {message.content && (
          <div className="message-content">{message.content}</div>
        )}

        {message.file && (
          <div className="message-file mt-2">
            {isImage(message.file) ? (
              <img
                src={`${BASE_API}${message.file}`}
                alt="Sent File"
                style={{
                  maxWidth: "200px",
                  borderRadius: "8px",
                  marginTop: "5px",
                }}
              />
            ) : (
              <a
                href={`${BASE_API}${message.file}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  textDecoration: "underline",
                  color: isSender ? "#fff" : theme.link,
                }}
              >
                📎 View File
              </a>
            )}

            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "2px",
                color: theme.subtext,
              }}
            >
              {getFileName(message.file)}
              {message.fileSize ? ` • ${getReadableSize(message.fileSize)}` : ""}
            </div>
          </div>
        )}

        <div className="message-time" style={timeStyle}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
