import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radii, spacing, typography } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';
import { useAppTheme } from '../theme/AppThemeProvider';

export function NoiseOverlay() {
  const { mode, colors } = useAppTheme();
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          opacity: mode === 'light' ? 0.05 : 0.04,
          backgroundColor: mode === 'light' ? colors.accent : colors.muted,
        },
      ]}
    />
  );
}

export function OrganicCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors, mode } = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.foreground,
          shadowOpacity: mode === 'dark' ? 0.12 : 0.15,
          elevation: mode === 'dark' ? 3 : 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.heading, { color: colors.foreground }]}>{children}</Text>;
}

export function Subtle({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.subtle, { color: colors.mutedForeground }]}>{children}</Text>;
}

export function OrganicButton({
  label,
  onPress,
  kind = 'primary',
}: {
  label: string;
  onPress?: () => void;
  kind?: 'primary' | 'outline';
}) {
  const { colors } = useAppTheme();
  if (kind === 'primary') {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.btnWrap}>
        <LinearGradient
          colors={[colors.gradientA, colors.gradientB]}
          style={styles.primaryBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.outlineBtn, { borderColor: colors.secondary }]}
    >
      <Text style={[styles.btnText, { color: colors.secondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: typography.h2,
    letterSpacing: -0.35,
  },
  subtle: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: typography.body,
    lineHeight: 24,
  },
  btnWrap: {
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  primaryBtn: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  outlineBtn: {
    borderRadius: radii.pill,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  btnText: {
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
