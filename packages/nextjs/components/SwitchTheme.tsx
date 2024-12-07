"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDarkMode = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <input id="theme-toggle" type="checkbox" className="hidden" onChange={handleToggle} checked={isDarkMode} />
      <label htmlFor="theme-toggle" className="flex items-center cursor-pointer">
        <div className="relative">
          <SunIcon
            className={`h-6 w-6 transition-transform duration-500 ${
              isDarkMode ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            }`}
          />
          <MoonIcon
            className={`h-6 w-6 absolute top-0 left-0 transition-transform duration-500 ${
              isDarkMode ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
            }`}
          />
        </div>
      </label>
    </div>
  );
};
