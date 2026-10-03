import { createContext, useContext } from "react";

export type Theme = "light" | "dark" | "system";

export const ThemeContext = createContext<{ setTheme: (theme: Theme) => void }>({ setTheme: () => undefined });

export const useTheme = () => useContext(ThemeContext);
