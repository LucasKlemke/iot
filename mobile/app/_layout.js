import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/colors';

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold'
          }
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'IoT Cancer Detector',
            headerShown: true
          }}
        />
        <Stack.Screen
          name="new-analysis"
          options={{
            title: 'Nova Análise',
            headerShown: true
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: 'Histórico',
            headerShown: true
          }}
        />
      </Stack>
    </>
  );
}
