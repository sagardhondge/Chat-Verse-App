import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import { useEffect } from "react";
import { useTheme } from "./context/ThemeContext";

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
      // style={{
      //   backgroundColor: theme?.background || "#ffffff",
      //   color: theme?.text || "#000000",
      //   minHeight: "100vh",
      // }}
    >
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/" element={<ChatPage />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
