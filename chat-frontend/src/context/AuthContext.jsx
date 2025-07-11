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

  // 🔁 Keep localStorage in sync with user
  useEffect(() => {
    if (user) {
      localStorage.setItem("chat-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("chat-user");
    }
  }, [user]);

  // 🚪 Central logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("chat-user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
