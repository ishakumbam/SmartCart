import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { MvpHeroCard, MvpScreen } from '../../components/mvp/MvpScreen';
import { OrganicButton, OrganicCard } from '../../components/ui/OrganicPrimitives';
import { apiFetch } from '../../lib/api';
import type { ApiDeal } from '../../lib/types';
import { expiresSoon, money } from '../../lib/format';
import { radii, spacing, typography } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

export default function DealDetailScreen() {
  const raw = useLocalSearchParams<{ id: string | string[] }>().id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  const { colors, mode } = useAppTheme();
  const router = useRouter();
  const [deal, setDeal] = useState<ApiDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const d = await apiFetch<ApiDeal>(`/api/deals/${id}`);
        if (!cancelled) setDeal(d);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : 'Failed to load');
          setDeal(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const openAffiliate = async () => {
    if (!deal) return;
    try {
      const { redirectUrl } = await apiFetch<{ redirectUrl: string }>('/api/deals/click', {
        method: 'POST',
        body: JSON.stringify({ dealId: deal.id }),
      });
      await Linking.openURL(redirectUrl);
    } catch {
      await Linking.openURL(deal.affiliateUrl);
    }
  };

  if (loading) {
    return (
      <MvpScreen title="Deal" subtitle="Loading…">
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      </MvpScreen>
    );
  }

  if (err || !deal) {
    return (
      <MvpScreen title="Deal" subtitle="Not found">
        <OrganicCard style={styles.card}>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            {err ?? 'Try another deal from Home.'}
          </Text>
        </OrganicCard>
      </MvpScreen>
    );
  }

  return (
    <MvpScreen title={deal.canonicalItem} subtitle={`${deal.storeName}`}>
      <MvpHeroCard>
        <View style={styles.heroRow}>
          <LinearGradient colors={[colors.gradientA, colors.gradientB]} style={styles.savePill}>
            <Text style={styles.savePillText}>SAVE {Math.round(deal.savingsPct)}%</Text>
          </LinearGradient>
          {expiresSoon(deal.expiresAt) ? (
            <Text style={[styles.urgent, { color: mode === 'dark' ? '#b09888' : '#A85448' }]}>Ends soon</Text>
          ) : null}
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.was, { color: colors.meta }]}>{money(deal.regularPrice)}</Text>
          <Text style={[styles.now, { color: colors.success }]}>{money(deal.salePrice)}</Text>
        </View>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>{deal.storeAddress}</Text>
      </MvpHeroCard>

      <OrganicCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Store</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{deal.storeName}</Text>
        <Text style={[styles.sectionTitle, styles.sectionSpaced, { color: colors.foreground }]}>Category</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{deal.category}</Text>
      </OrganicCard>

      <View style={styles.cta}>
        <OrganicButton label="Open offer" onPress={() => void openAffiliate()} />
        <View style={{ height: spacing.sm }} />
        <OrganicButton kind="outline" label="Habits" onPress={() => router.push('/(tabs)/habits')} />
        <View style={{ height: spacing.sm }} />
        <OrganicButton
          kind="outline"
          label="Directions"
          onPress={() => router.push({ pathname: '/deal/directions', params: { id: deal.id } })}
        />
      </View>
    </MvpScreen>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  savePill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  savePillText: {
    color: '#fff',
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  urgent: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  was: {
    fontSize: typography.h3,
    textDecorationLine: 'line-through',
    fontFamily: fonts.medium,
  },
  now: {
    fontSize: 36,
    fontFamily: fonts.bold,
    letterSpacing: -1,
  },
  hint: {
    marginTop: spacing.md,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
  },
  sectionSpaced: {
    marginTop: spacing.md,
  },
  body: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  cta: {
    marginTop: spacing.lg,
  },
});
