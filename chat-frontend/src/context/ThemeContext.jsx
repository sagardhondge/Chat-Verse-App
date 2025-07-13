import { createContext, useContext, useEffect, useState } from "react";
import { themes } from "../theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    const stored = localStorage.getItem("chat-theme");
    return themes[stored] ? stored : "light";
  });

  const theme = themes[themeName];

  useEffect(() => {
    localStorage.setItem("chat-theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Place custom hook *after* the component
export function useTheme() {
  return useContext(ThemeContext);
}
