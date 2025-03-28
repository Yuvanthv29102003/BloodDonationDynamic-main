import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import i18next from '../lib/i18n/i18n.config';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <I18nextProvider i18n={i18next}>
      <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="auth/phone" options={{ headerShown: false }} />
      <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
      <Stack.Screen name="find-blood" options={{ headerShown: false }} />
      <Stack.Screen name="available-donors" options={{ headerShown: false }} />
      <Stack.Screen name="donor-details" options={{ headerShown: false }} />
      <Stack.Screen name="blood-bank" options={{ headerShown: false }} />
      <Stack.Screen name="blood-bank-details" options={{ headerShown: false }} />
      <Stack.Screen name="register-donor" options={{ headerShown: false }} />
      <Stack.Screen name="other-options" options={{ headerShown: false }} />
      <Stack.Screen name="update-profile" options={{ headerShown: false }}/>
      <Stack.Screen name="e-certificate" options={{ headerShown: false }}/> 
      <Stack.Screen name="achievement" options={{ headerShown: false }}/>
      <Stack.Screen name="find-oxygen" options={{ headerShown: false }}/>
      <Stack.Screen name="oxygen-cylinder-details" options={{ headerShown: false }}/> 
      <Stack.Screen name="notifications" options={{ headerShown: false }}/>
      <Stack.Screen name="notification-details" options={{ headerShown: false }}/>
      <Stack.Screen name="rules-and-regulation" options={{ headerShown: false }}/>
      <Stack.Screen name="help" options={{ headerShown: false }}/>
      <Stack.Screen name="about" options={{ headerShown: false }}/>
      <Stack.Screen name="support-chat" options={{ headerShown: false }}/>
      <Stack.Screen name="certificate-verification" options={{ headerShown: false }}/>
      </Stack>
    </I18nextProvider>
  );
}
