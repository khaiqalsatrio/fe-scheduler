import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  activeTheme: 'light' | 'dark';
  isDarkMode: boolean;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  activeTheme: 'light',
  isDarkMode: false,
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync('app_theme');
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await SecureStore.setItemAsync('app_theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const activeTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDarkMode = activeTheme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, activeTheme, isDarkMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
