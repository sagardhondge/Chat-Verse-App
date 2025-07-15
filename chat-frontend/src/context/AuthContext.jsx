
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("chat-user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("⚠️ Failed to parse user from localStorage:", e);
      return null;
    }
  });

  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("chat-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("chat-user");
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("chat-user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, onlineUsers, setOnlineUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
