import { useRef, useState, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Button } from "react-bootstrap";
import { BsEmojiSmile, BsPaperclip, BsChevronDown } from "react-icons/bs";
import { useTheme } from "../../context/ThemeContext";

export default function MessageInput({ newMessage, setNewMessage, onSend, onFileSelect }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { darkMode } = useTheme();

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji.native);
    // 👇 Do not close emoji picker after selecting
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Close emoji picker on outside click
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
    <div className="d-flex align-items-center position-relative gap-2 w-100 px-2 py-2 border-top bg-white">
      {/* Emoji Toggle */}
      <Button
        variant="light"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="emoji-btn"
        title="Emoji"
      >
        <BsEmojiSmile size={20} />
      </Button>

      {/* File Picker */}
      <Button
        variant="light"
        onClick={() => fileInputRef.current.click()}
        className="file-btn"
        title="Attach file"
      >
        <BsPaperclip size={20} />
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Text Input */}
      <textarea
        className="form-control flex-grow-1"
        rows={1}
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ resize: "none" }}
      />

      <Button onClick={() => {
        onSend();
      }} disabled={!newMessage.trim()}>
        Send
      </Button>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="position-absolute bottom-100 start-0 mb-2 zindex-tooltip shadow-sm"
        >
          <div className="d-flex justify-content-end px-1">
            <Button
              variant="light"
              size="sm"
              onClick={() => setShowEmojiPicker(false)}
              title="Close emoji picker"
            >
              <BsChevronDown />
            </Button>
          </div>
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme={darkMode ? "dark" : "light"} />
        </div>
      )}
    </div>
  );
}
