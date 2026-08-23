"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { IconMoon, IconSun } from "./ui/icons";

type Theme = "light" | "dark";
const STORAGE_KEY = "quorlyn.theme";

/**
 * The stored override is applied by an inline script before paint; this only
 * reads it after mount, so server and client HTML always agree.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // Deliberately deferred to after mount: the server has no access to
  // localStorage, so setting this during render would mismatch the markup
  // the inline theme script already painted.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const root = document.documentElement;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      return;
    }
    setTheme(root.classList.contains("dark") ? "dark" : "light");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light theme" : "Dark theme"}
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </Button>
  );
}
