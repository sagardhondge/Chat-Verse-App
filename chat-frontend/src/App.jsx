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
      {/* 👇 Fix: Define route for "/" */}
      <Route
        path="/"
        element={
          user ? <ChatPage /> : <Navigate to="/login" replace />
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:id" element={<ProfilePage />} />
    </Routes>
  );
}
