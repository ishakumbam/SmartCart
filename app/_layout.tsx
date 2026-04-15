import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AppThemeProvider, useAppTheme } from '../components/theme/AppThemeProvider';
import { AuthProvider, useProtectedRoute } from '../context/AuthContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  useProtectedRoute();
  const { mode, colors } = useAppTheme();

  return (
    <>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="deal/[id]" />
        <Stack.Screen name="deal/directions" />
        <Stack.Screen name="scan/camera" />
        <Stack.Screen name="scan/capture" />
        <Stack.Screen name="scan/upload" />
        <Stack.Screen name="settings/detail" />
        <Stack.Screen name="settings/sign-out" />
        <Stack.Screen name="shopping-insight" />
      </Stack>
    </>
  );
}
