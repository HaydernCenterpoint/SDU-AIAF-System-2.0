import { NavigationContainer } from '@react-navigation/native';
import React, { type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { Colors } from './src/constants/theme';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.webStage}>
      <View style={styles.webFrame}>{children}</View>
    </View>
  );
}

export default function App() {
  return (
    <AppFrame>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  webStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  webFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    overflow: 'hidden',
    backgroundColor: Colors.bg,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 34,
  },
});
