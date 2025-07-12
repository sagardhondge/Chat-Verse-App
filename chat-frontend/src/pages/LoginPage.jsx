import { useTheme } from "../context/ThemeContext";
import LoginForm from "../components/Auth/LoginForm";
import loginBg from "./login.jpg"; // ✅ local background image
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { darkMode, toggleTheme } = useTheme();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100); // slight delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: darkMode
            ? "hsla(0, 17.10%, 40.20%, 0.60)"
            : "rgba(144, 177, 177, 0.79)",
          backdropFilter: "blur(15px)",
          borderRadius: "20px",
          padding: "2.5rem 2rem",
          width: "440px",
          boxShadow: "0 0 300px rgba(226, 30, 30, 0.3)",
          color: darkMode ? "#fff" : "#000",
          transform: animate ? "translateY(0)" : "translateY(40px)",
          opacity: animate ? 1 : 0,
          transition: "all 0.6s ease-in-out",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-0">
          <h4 className="fw-bold mb-0">
            ChatVerse App <span>✉</span>
          </h4>
          <button
            onClick={toggleTheme}
            className="text-decoration-none border-0 bg-transparent text-white"
            title="Toggle theme"
            style={{ fontSize: "1.2rem" }}
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>

        {/* Subtitle */}
        <h5 className="text-center mb-4 mt-2">Login to your account</h5>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}
