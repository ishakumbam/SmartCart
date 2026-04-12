import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { MvpScreen } from '../../components/mvp/MvpScreen';
import { StoreMap } from '../../components/maps/StoreMap';
import { OrganicCard } from '../../components/ui/OrganicPrimitives';
import { apiFetch } from '../../lib/api';
import type { ApiDeal } from '../../lib/types';
import { spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

export default function DealDirectionsScreen() {
  const raw = useLocalSearchParams<{ id: string | string[] }>().id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  const { colors } = useAppTheme();
  const [deal, setDeal] = useState<ApiDeal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const d = await apiFetch<ApiDeal>(`/api/deals/${id}`);
        if (!cancelled) setDeal(d);
      } catch {
        if (!cancelled) setDeal(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const markers = useMemo(() => {
    if (!deal) return [];
    return [
      {
        id: deal.id,
        latitude: deal.lat,
        longitude: deal.lng,
        title: deal.storeName,
      },
    ];
  }, [deal]);

  if (loading) {
    return (
      <MvpScreen title="Directions" subtitle="Loading…">
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      </MvpScreen>
    );
  }

  return (
    <MvpScreen title="Directions" subtitle={deal ? deal.storeName : 'Store'}>
      <StoreMap markers={markers} height={260} />
      {deal ? (
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>
          {deal.storeAddress}
        </Text>
      ) : null}
      <OrganicCard style={styles.card}>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          Use your maps app for turn-by-turn navigation to this store.
        </Text>
      </OrganicCard>
    </MvpScreen>
  );
}

const styles = StyleSheet.create({
  caption: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: 14,
    textAlign: 'center',
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
