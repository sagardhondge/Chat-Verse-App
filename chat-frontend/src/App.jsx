import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import { useEffect } from "react";
import { useTheme } from "./context/ThemeContext";

// ✅ PrivateRoute wrapper for authenticated routes
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// ✅ PublicRoute wrapper to block login/register for logged-in users
function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/chat" replace />;
}

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [theme]);

  return (
    <div
      style={{
        backgroundColor: theme?.background || "#ffffff",
        color: theme?.text || "#000000",
        minHeight: "100vh",
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <AccountPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
