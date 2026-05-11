import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'saodo_token';
const REFRESH_TOKEN_KEY = 'saodo_refresh_token';
const ONBOARDING_KEY = 'saodo_onboarding_complete';
const THEME_KEY = 'saodo_theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

export const tokenStorage = {
  async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },
  async setAccessToken(token: string) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  async getRefreshToken() {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },
  async setRefreshToken(token: string) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  async clearAuth() {
    await Promise.all([AsyncStorage.removeItem(ACCESS_TOKEN_KEY), AsyncStorage.removeItem(REFRESH_TOKEN_KEY)]);
  },
  async hasCompletedOnboarding() {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
  },
  async setOnboardingComplete() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  },
  async getThemePreference(): Promise<ThemePreference> {
    const value = await AsyncStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
  },
  async setThemePreference(preference: ThemePreference) {
    await AsyncStorage.setItem(THEME_KEY, preference);
  },
};
