import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { getDatabase } from '../db/database';

export default function RootLayout() {
  useEffect(() => {
    getDatabase().catch((err) => console.error('DB init failed:', err));
  }, []);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </PaperProvider>
  );
}
