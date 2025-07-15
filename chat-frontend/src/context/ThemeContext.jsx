import { createContext, useContext, useEffect, useState } from "react";
import { themes } from "../theme"; // <- Ensure this points to your theme.js

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => localStorage.getItem("chat-theme") || "dark");
  const theme = themes[themeName] || themes.dark;

  useEffect(() => {
    localStorage.setItem("chat-theme", themeName);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
