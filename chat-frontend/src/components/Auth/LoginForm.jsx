import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import api from "../../utils/axios"; // ✅ Using configured Axios
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function LoginForm() {
  const { setUser } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/user/login", { email, password });

      const fullUser = { ...data.user, token: data.token };
      setUser(fullUser);
      localStorage.setItem("chat-user", JSON.stringify(fullUser));
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      style={{
        borderRadius: "1.5rem",
        background: darkMode
          ? "rgba(69, 13, 13, 0.2)"
          : "rgba(94, 157, 150, 0.67)",
        backdropFilter: "blur(12px)",
        padding: "2.5rem 2rem",
        boxShadow: darkMode
          ? "0 0 30px rgba(255, 255, 255, 0.35)"
          : "0 0 30px rgba(171, 136, 136, 0.1)",
        width: "100%",
        maxWidth: "660px",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={`rounded px-3 py-2 ${
              darkMode ? "bg-dark text-white border-secondary" : ""
            }`}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`rounded px-3 py-2 pe-5 ${
                darkMode ? "bg-dark text-white border-secondary" : ""
              }`}
              />

        <span
          onClick={() => setShowPassword(!showPassword)}
          style={{
          position: "absolute",
          right: "15px",
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          fontSize: "18px",
          }}
        >
        {showPassword ? "*" : "👁"}
        </span>
      </div>
      </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="w-100 mb-3 rounded py-2 fw-semibold"
          style={{
            backgroundColor: "#d9d7d7ff",
            border: "none",
            boxShadow: "0 4px 10px rgba(163, 168, 175, 0.4)",
          }}
        >
          Login
        </Button>
      </Form>

      <div className="text-center mt-3">
        Don't have an account?{" "}
          <Link
          to="/register"
          style={{
            color: "#007bff", 
            fontWeight: "600",
            textDecoration: "underline",
          }}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}