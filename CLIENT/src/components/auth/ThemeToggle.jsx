// ThemeToggle.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

// Create a Context for the theme
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  // Initialize isDarkMode from localStorage or default to true (dark mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const storedTheme = localStorage.getItem('isDarkMode');
      return storedTheme ? JSON.parse(storedTheme) : true; // Default to dark mode
    } catch (error) {
      console.error("Failed to parse isDarkMode from localStorage, defaulting to dark mode:", error);
      return true; // Fallback in case of localStorage error
    }
  });

  // Effect to update localStorage whenever isDarkMode changes
  useEffect(() => {
    try {
      localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error("Failed to save isDarkMode to localStorage:", error);
    }
  }, [isDarkMode]);

  // Function to toggle the theme
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Toggle Button component (optional, can be integrated directly)
export const ThemeToggleButton = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-white" />
      ) : (
        <Moon className="w-5 h-5 text-black" />
      )}
    </button>
  );
};

// Export default for direct import if preferred, though named exports are used above
export default ThemeContext;
