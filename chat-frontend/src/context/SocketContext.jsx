import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, setOnlineUsers } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = user?.token;

    if (!token) {
      console.warn("🚫 No token found for socket connection.");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    if (socketRef.current) {
      console.log("ℹ️ Socket already connected.");
      return;
    }

    const baseSocketUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, "");

    console.log("🪪 Connecting socket with token:", token);

    const newSocket = io(baseSocketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected successfully");
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
      console.log("👥 Online users updated:", users);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      console.log("🧹 Cleaning up socket...");
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user?.token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
