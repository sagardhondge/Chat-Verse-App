// src/components/Auth/RegisterForm.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

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
      const { data } = await axios.post("http://localhost:4000/api/user/register", {
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
    <Card
      className={`shadow ${darkMode ? "bg-secondary" : "bg-light text-dark"}`}
      style={{
        borderRadius: "15px",
        padding: "1.5rem",
        animation: "fadeIn 1s ease-in-out",
      }}
    >
      <h5 className="text-center fw-bold mb-4">Create an Account</h5>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
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
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
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
          />
        </Form.Group>

        <Button type="submit" variant="success" className="w-100 mb-3">
          Register
        </Button>
      </Form>

      <div className="text-center">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </Card>
  );
}
