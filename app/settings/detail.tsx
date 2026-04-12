import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { MvpHeroCard, MvpScreen } from '../../components/mvp/MvpScreen';
import { OrganicCard } from '../../components/ui/OrganicPrimitives';
import { settingsMvpCopy } from '../../constants/settingsMvp';
import { spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

export default function SettingsDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { colors } = useAppTheme();
  const k = key ? String(key) : '';
  const copy = settingsMvpCopy[k];

  if (!copy) {
    return (
      <MvpScreen title="Settings" subtitle="Unknown section">
        <OrganicCard style={styles.card}>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>Go back and pick a row again.</Text>
        </OrganicCard>
      </MvpScreen>
    );
  }

  return (
    <MvpScreen title={copy.title} subtitle={copy.subtitle}>
      <MvpHeroCard>
        <Text style={[styles.heroBadge, { color: colors.foreground }]}>{copy.icon}</Text>
        <Text style={[styles.heroBody, { color: colors.mutedForeground }]}>{copy.body}</Text>
      </MvpHeroCard>

      <OrganicCard style={styles.card}>
        <Text style={[styles.muted, { color: colors.meta }]}>MVP · Same theme tokens as the rest of SmartCart</Text>
      </OrganicCard>
    </MvpScreen>
  );
}

const styles = StyleSheet.create({
  heroBadge: {
    fontSize: 20,
    fontFamily: fonts.semibold,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  heroBody: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    marginTop: spacing.lg,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  muted: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});
