import React, { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { AppThemes, type AppTheme, type AppThemeName } from '../constants/theme';
import { tokenStorage, type ThemePreference } from '../services/token-storage';

type ThemeContextValue = {
  theme: AppTheme;
  colorScheme: AppThemeName;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const mountedRef = useRef(true);
  const latestPreferenceRef = useRef<ThemePreference>('system');
  const preferenceWriteQueueRef = useRef(Promise.resolve());
  const userSetPreferenceRef = useRef(false);
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    tokenStorage
      .getThemePreference()
      .then((storedPreference) => {
        if (!cancelled && !userSetPreferenceRef.current) {
          setPreferenceState(storedPreference);
        }
      })
      .catch(() => {
        if (!cancelled && !userSetPreferenceRef.current) {
          setPreferenceState('system');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const colorScheme: AppThemeName = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: AppThemes[colorScheme],
      colorScheme,
      preference,
      async setPreference(nextPreference) {
        userSetPreferenceRef.current = true;
        latestPreferenceRef.current = nextPreference;
        const write = preferenceWriteQueueRef.current
          .catch(() => undefined)
          .then(() => tokenStorage.setThemePreference(nextPreference));
        preferenceWriteQueueRef.current = write.catch(() => undefined);

        await write;
        if (mountedRef.current && latestPreferenceRef.current === nextPreference) {
          setPreferenceState(nextPreference);
        }
      },
    }),
    [colorScheme, preference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used inside ThemeProvider');
  return context;
}
