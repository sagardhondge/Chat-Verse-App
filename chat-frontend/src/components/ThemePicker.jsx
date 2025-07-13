// src/components/ThemePicker.jsx
import { useTheme } from "../context/ThemeContext";
import { Modal, Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FaPalette } from "react-icons/fa";
import { useState } from "react";

const themes = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave",
  "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua",
  "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula",
  "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
  "dim", "nord", "sunset"
];

export default function ThemePicker() {
  const { themeName, setThemeName } = useTheme();
  const [show, setShow] = useState(false);

  return (
    <>
      <OverlayTrigger overlay={<Tooltip>Choose Theme</Tooltip>}>
        <Button variant="outline-secondary" size="sm" onClick={() => setShow(true)}>
          <FaPalette />
        </Button>
      </OverlayTrigger>

      <Modal show={show} onHide={() => setShow(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🎨 Choose Theme</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            {themes.map((theme) => (
              <button
                key={theme}
                className={`btn btn-sm border rounded d-flex align-items-center ${
                  themeName === theme ? "border-primary" : ""
                }`}
                style={{
                  minWidth: 90,
                  flexDirection: "column",
                  gap: "0.3rem",
                  background: "none",
                }}
                onClick={() => setThemeName(theme)}
              >
                <div className="d-flex">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 20,
                        height: 20,
                        margin: "2px",
                        borderRadius: "4px",
                        backgroundColor: `hsl(${(i * 60 + themes.indexOf(theme) * 10) % 360}, 70%, 60%)`,
                      }}
                    />
                  ))}
                </div>
                <small className="text-capitalize">{theme}</small>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <h6>Preview</h6>
            <div
              className="p-3 rounded"
              style={{
                backgroundColor: "var(--bs-body-bg)",
                color: "var(--bs-body-color)",
                border: "1px solid var(--bs-border-color-translucent)",
              }}
            >
              <p><strong>John Doe:</strong> Hey! How’s it going?</p>
              <p style={{
                background: "#f3a847",
                padding: "6px",
                borderRadius: "6px",
                display: "inline-block"
              }}>
                I'm doing great! Just working on some new features.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
