import { useRef, useState, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Button } from "react-bootstrap";
import { BsEmojiSmile, BsPaperclip, BsChevronDown } from "react-icons/bs";
import { themes } from "../../theme";

export default function MessageInput({
  newMessage,
  setNewMessage,
  onSend,
  onFileSelect,
  onTyping,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const themeName = localStorage.getItem("chat-theme") || "light";
  const theme = themes[themeName] || themes.light;

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji.native);
    onTyping?.();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    } else {
      onTyping?.();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest(".emoji-btn")
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="d-flex align-items-center position-relative gap-2 w-100 px-2 py-2 border-top"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      {/* Emoji Button */}
      <Button
        style={{
          backgroundColor: theme.surface,
          color: theme.text,
          border: `1px solid ${theme.border}`,
        }}
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="emoji-btn"
        title="Emoji"
      >
        <BsEmojiSmile size={20} />
      </Button>

      {/* File Attach Button */}
      <Button
        style={{
          backgroundColor: theme.surface,
          color: theme.text,
          border: `1px solid ${theme.border}`,
        }}
        onClick={() => fileInputRef.current.click()}
        className="file-btn"
        title="Attach file"
      >
        <BsPaperclip size={20} />
      </Button>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Text Area */}
      <textarea
        className="form-control flex-grow-1 rounded"
        rows={1}
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
          onTyping?.();
        }}
        onKeyDown={handleKeyDown}
        style={{
          resize: "none",
          backgroundColor: theme.input,
          color: theme.text,
          borderColor: theme.border,
        }}
      />

      {/* Send Button */}
      <Button
        variant="primary"
        onClick={onSend}
        disabled={!newMessage.trim()}
        className="fw-semibold"
      >
        Send
      </Button>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="position-absolute bottom-100 start-0 mb-2 zindex-tooltip shadow rounded"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
            zIndex: 100,
          }}
        >
          <div className="d-flex justify-content-end px-1 pt-1">
            <Button
              size="sm"
              variant="light"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
              onClick={() => setShowEmojiPicker(false)}
              title="Close emoji picker"
            >
              <BsChevronDown />
            </Button>
          </div>
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme={themeName === "dark" ? "dark" : "light"}
            previewPosition="none"
          />
        </div>
      )}
    </div>
  );
}
