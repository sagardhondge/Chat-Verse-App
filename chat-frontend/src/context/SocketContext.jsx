import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // keep reference to current socket

  useEffect(() => {
    // If no token, clean up
    if (!user?.token) {
      console.warn("🚫 No token found for socket connection.");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      return;
    }

    console.log("🪪 Socket connecting with token:", user.token);

    // Disconnect old socket before reconnecting
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token: user.token },
      withCredentials: true,
      transports: ["websocket"], // recommended for performance
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

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.token]); // Re-run effect when token changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
