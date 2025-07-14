import LoginForm from "../components/Auth/LoginForm";
import loginBg from "./login.jpg";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
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
          background: "rgba(74, 148, 138, 0.48)", // brighter readable background
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          padding: "2.5rem 2rem",
          width: "440px",
          boxShadow: "0 0 300px rgba(177, 189, 190, 1)",
          color: "#000",
          transform: animate ? "translateY(0)" : "translateY(40px)",
          opacity: animate ? 1 : 0,
          transition: "all 0.6s ease-in-out",
        }}
      >
        {/* Header */}
        <div className="text-center mb-3">
          <h4 className="fw-bold mb-1">ChatVerse App ✉</h4>
          <h6 className="mb-4">Login to your account</h6>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}
