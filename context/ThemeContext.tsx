import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useColorScheme } from "react-native";
import { StorageService } from "@/services/storage";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof colors.light;
}

const colors = {
  light: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    background: "#ffffff",
    surface: "#f3f4f6",
    text: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    error: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",
  },
  dark: {
    primary: "#818cf8",
    secondary: "#a78bfa",
    background: "#111827",
    surface: "#1f2937",
    text: "#f9fafb",
    textSecondary: "#9ca3af",
    border: "#374151",
    error: "#f87171",
    success: "#34d399",
    warning: "#fbbf24",
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await StorageService.getUserData().then(
      (data) => data?.theme,
    );
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemColorScheme) {
      setTheme(systemColorScheme as Theme);
    }
  };

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      // Save preference
      StorageService.getUserData().then((user) => {
        if (user) {
          StorageService.setUserData({ ...user, theme: newTheme });
        }
      });
      return newTheme;
    });
  }, []);

  const value = {
    theme,
    toggleTheme,
    colors: colors[theme],
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
