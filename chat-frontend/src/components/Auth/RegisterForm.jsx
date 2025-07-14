import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import api from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { darkMode } = useTheme();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/user/register", {
        firstName,
        lastName,
        email,
        password,
      });

      const fullUser = { ...data.user, token: data.token };
      setUser(fullUser);
      localStorage.setItem("chat-user", JSON.stringify(fullUser));
      alert("🎉 Registration successful!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      style={{
        borderRadius: "1.5rem",
        background: darkMode
          ? "rgba(69, 13, 13, 0.2)"
          : "rgba(24, 24, 24, 0.17)",
        backdropFilter: "blur(12px)",
        padding: "2.5rem 2rem",
        boxShadow: darkMode
          ? "0 0 30px rgba(213, 204, 204, 0.35)"
          : "0 0 30px rgba(171, 136, 136, 0.1)",
        width: "100%",
        maxWidth: "870px",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <h4 className="text-center fw-bold mb-4">Create an Account</h4>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            className={`rounded px-3 py-2 ${
              darkMode ? "bg-dark text-white border-secondary" : ""
            }`}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
            className={`rounded px-3 py-2 ${
              darkMode ? "bg-dark text-white border-secondary" : ""
            }`}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
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
            placeholder="Enter password"
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
            backgroundColor: "#d9d7d7ff",
            border: "none",
            boxShadow: "0 4px 10px rgba(163, 168, 175, 0.4)",
          }}
        >
          Register
        </Button>
      </Form>

      <div className="text-center mt-3">
        Already have an account?{" "}
        <Link
          to="/login"
          style={{
            color: "#007bff",
            fontWeight: "600",
            textDecoration: "underline",
          }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
