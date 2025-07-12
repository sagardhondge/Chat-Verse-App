// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import { useAuth } from "./context/AuthContext";
import AccountPage from "./pages/AccountPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 🔐 Protected Home */}
      <Route
        path="/"
        element={user ? <ChatPage /> : <Navigate to="/login" replace />}
      />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Account and Profile */}
      <Route path="/account" element={<AccountPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:id" element={<ProfilePage />} />

      {/* 🧭 Catch-all redirect (optional but helpful in production) */}
      <Route
        path="*"
        element={<Navigate to={user ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
