import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';


const ThemeContext = createContext();


export const useTheme = () => useContext(ThemeContext);

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const storedTheme = localStorage.getItem('isDarkMode');
      return storedTheme ? JSON.parse(storedTheme) : true;
    } catch (error) {
      console.error("Failed to parse isDarkMode from localStorage, defaulting to dark mode:", error);
      return true; 
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error("Failed to save isDarkMode to localStorage:", error);
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Toggle Button component 
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


export default ThemeContext;
