import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import api from "../../utils/axios"; // ✅ changed from axios to api
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function LoginForm() {
  const { setUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/user/login", {
        email,
        password,
      });

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
          : "rgba(119, 165, 162, 0.83)",
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
          <Form.Control
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className={`rounded px-3 py-2 ${
              darkMode ? "bg-dark text-white border-secondary" : ""
            }`}
          />
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="w-100 mb-3 rounded py-2 fw-semibold"
          style={{
            backgroundColor: "#1a73e8",
            border: "none",
            boxShadow: "0 4px 10px rgba(26, 115, 232, 0.4)",
          }}
        >
          Login
        </Button>
      </Form>

      <div className="text-center">
        New here?{" "}
        <Link to="/register" className="text-info text-decoration-none">
          Sign up
        </Link>
      </div>
    </div>
  );
}
