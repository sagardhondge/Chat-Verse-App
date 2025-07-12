import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global Styles & Libraries
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Context Providers
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
