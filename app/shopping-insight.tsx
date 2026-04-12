import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../components/theme/AppThemeProvider';
import { MvpHeroCard, MvpScreen } from '../components/mvp/MvpScreen';
import { OrganicCard } from '../components/ui/OrganicPrimitives';
import { spacing } from '../constants/designSystem';
import { fonts } from '../constants/fonts';

export default function ShoppingInsightScreen() {
  const { colors } = useAppTheme();

  return (
    <MvpScreen title="Shopping insight" subtitle="Patterns we noticed">
      <MvpHeroCard>
        <Text style={[styles.quote, { color: colors.foreground }]}>
          You usually buy milk on Tuesdays — we’ll ping you Monday night if a dairy deal drops nearby.
        </Text>
      </MvpHeroCard>
      <OrganicCard style={styles.card}>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          MVP: this becomes a full timeline of habits, categories, and projected savings from your real receipt data.
        </Text>
      </OrganicCard>
    </MvpScreen>
  );
}

const styles = StyleSheet.create({
  quote: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    lineHeight: 28,
  },
  card: {
    marginTop: spacing.lg,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
});
