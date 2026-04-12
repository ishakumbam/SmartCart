import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../theme/AppThemeProvider';
import { NoiseOverlay, OrganicCard, Subtle } from '../ui/OrganicPrimitives';
import { radii, safeTop, spacing, typography } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

export function MvpScreen({ title, subtitle, children, contentStyle }: Props) {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <NoiseOverlay />
      <ScrollView
        contentContainerStyle={[styles.scroll, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
            <Text style={[styles.backLabel, { color: colors.mutedForeground }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? <Subtle>{subtitle}</Subtle> : null}

        {children}
      </ScrollView>
    </View>
  );
}

export function MvpHeroCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useAppTheme();
  return (
    <OrganicCard style={[styles.hero, style]}>
      <LinearGradient
        colors={[`${colors.gradientA}33`, `${colors.gradientB}18`]}
        style={[styles.heroGrad, { borderColor: colors.border }]}
      >
        {children}
      </LinearGradient>
    </OrganicCard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: safeTop,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    marginBottom: spacing.md,
  },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  backLabel: {
    marginLeft: 2,
    fontSize: typography.body,
    fontFamily: fonts.medium,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: typography.h2,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  hero: {
    marginTop: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  heroGrad: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
