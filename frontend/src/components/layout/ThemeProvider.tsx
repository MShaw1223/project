import { ReactNode, useEffect, useState } from "react";
import { Theme, ThemeContext } from "@/hooks/useTheme";

// also read by public/theme.js, which applies the stored theme before the first paint
const STORAGE_KEY = "theme";

// puts the chosen theme on <html> as the "dark" class Tailwind keys off, following the OS setting
// while it's "system", and remembers the choice across visits
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const value = {
    setTheme: (next: Theme) => {
      localStorage.setItem(STORAGE_KEY, next);
      setTheme(next);
    },
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
