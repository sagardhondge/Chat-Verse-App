import { useEffect } from "react";
import RegisterForm from "../components/Auth/RegisterForm";
import { useTheme } from "../context/ThemeContext";
import registerBg from "./register.jpg";

export default function RegisterPage() {
  const { darkMode, toggleTheme } = useTheme();

  // ⬇ Force dark mode once on mount
  useEffect(() => {
    if (!darkMode) toggleTheme(); // switch to dark mode if not already
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${registerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: darkMode
            ? "rgba(20, 20, 20, 0.7)"
            : "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "2rem",
          width: "400px",
          boxShadow: darkMode
            ? "0 0 25px rgba(0, 0, 0, 0.7)"
            : "0 0 30px rgba(255, 255, 255, 0.5)",
          color: darkMode ? "#fff" : "#000",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="fw-bold mb-0">
            ChatVerse App <span>✉</span>
          </h4>
          <button
            onClick={toggleTheme}
            className="text-decoration-none border-0 bg-transparent fs-5"
            title="Toggle theme"
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>

        {/* Subtitle */}
        <h5 className="text-center mb-4 mt-1">Create your account</h5>

        {/* Register Form */}
        <RegisterForm />
      </div>
    </div>
  );
}
