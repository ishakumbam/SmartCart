import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { typography } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.meta,
        tabBarLabelStyle: {
          fontSize: typography.meta,
          fontFamily: fonts.semibold,
        },
        tabBarStyle: [
          tabBarStyle.bar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingTop: 6,
            paddingBottom: bottomPad,
            height: 52 + bottomPad,
          },
        ],
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
      <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const tabBarStyle = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
