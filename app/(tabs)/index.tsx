import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { StoreMap } from '../../components/maps/StoreMap';
import { Heading, NoiseOverlay, OrganicButton, OrganicCard, Subtle } from '../../components/ui/OrganicPrimitives';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import type { ApiDeal } from '../../lib/types';
import { expiresSoon, milesFromKm, money } from '../../lib/format';
import { radii, safeTop, spacing, typography } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

const DEFAULT_LAT = 30.2672;
const DEFAULT_LNG = -97.7431;
const RADIUS_KM = 40;

export default function HomeScreen() {
  const { colors, mode } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locLabel, setLocLabel] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const ask = await Location.requestForegroundPermissionsAsync();
        status = ask.status;
      }
      let lat = DEFAULT_LAT;
      let lng = DEFAULT_LNG;
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        setLocLabel('Near you');
      } else {
        setLocLabel('Default area (enable location in settings)');
      }
      const rows = await apiFetch<ApiDeal[]>(`/api/deals?lat=${lat}&lng=${lng}&radius=${RADIUS_KM}`);
      setDeals(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load deals');
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mapMarkers = useMemo(
    () =>
      deals.map((d) => ({
        id: d.id,
        latitude: d.lat,
        longitude: d.lng,
        title: d.storeName,
      })),
    [deals],
  );

  const firstName = user?.name?.split(/\s+/)[0] ?? 'there';
  const top = deals[0];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <NoiseOverlay />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Heading>Good morning, {firstName}</Heading>
          <Subtle>Deals matched to your list {locLabel ? `· ${locLabel}` : ''}</Subtle>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/(tabs)/notifications')}
            style={[styles.bell, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} />
        ) : error ? (
          <Text style={[styles.err, { color: colors.destructive }]}>{error}</Text>
        ) : null}

        <Text style={[styles.mapLabel, { color: colors.meta }]}>Nearby</Text>
        <StoreMap markers={mapMarkers} height={200} />

        {top ? (
          <TouchableOpacity activeOpacity={0.88} onPress={() => router.push(`/deal/${top.id}`)}>
            <LinearGradient
              colors={[`${colors.gradientA}44`, `${colors.gradientB}22`]}
              style={[styles.topPick, { borderColor: colors.border }]}
            >
              <Text style={[styles.topPickTitle, { color: colors.foreground }]}>Your top pick</Text>
              <Text style={[styles.topPickText, { color: colors.mutedForeground }]}>{top.canonicalItem}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : !loading ? (
          <OrganicCard style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No deals yet</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              Scan a receipt to build your buy profile, or wait for the next Flipp sync if deals are empty in the database.
            </Text>
          </OrganicCard>
        ) : null}

        {deals.map((deal, i) => (
          <OrganicCard key={deal.id} style={i % 2 ? styles.blobA : styles.blobB}>
            <LinearGradient colors={[colors.gradientA, colors.gradientB]} style={styles.badge}>
              <Text style={styles.badgeText}>SAVE {Math.round(deal.savingsPct)}%</Text>
            </LinearGradient>
            {expiresSoon(deal.expiresAt) ? (
              <Text style={[styles.urgent, { color: mode === 'dark' ? '#b09888' : '#A85448' }]}>Ends soon</Text>
            ) : null}
            <Text style={[styles.item, { color: colors.foreground }]}>{deal.canonicalItem}</Text>
            <Text style={[styles.store, { color: colors.mutedForeground }]}>
              {deal.storeName} · {milesFromKm(deal.distanceKm)}
            </Text>
            <View style={styles.row}>
              <Text style={[styles.original, { color: colors.meta }]}>{money(deal.regularPrice)}</Text>
              <Text style={[styles.sale, { color: colors.success }]}>{money(deal.salePrice)}</Text>
            </View>
            <View style={styles.rowBetween}>
              <View style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.accent }]}>
                <Text style={{ color: colors.accentForeground, fontFamily: fonts.semibold }}>
                  {milesFromKm(deal.distanceKm)}
                </Text>
              </View>
              <OrganicButton label="View deal" onPress={() => router.push(`/deal/${deal.id}`)} />
            </View>
          </OrganicCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: safeTop, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  bell: { position: 'absolute', right: 0, top: 0, width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  loader: { marginVertical: spacing.md },
  err: { fontFamily: fonts.medium, marginBottom: spacing.sm },
  mapLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  topPick: { borderRadius: radii.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md, marginTop: spacing.md },
  topPickTitle: { fontFamily: fonts.semibold, fontSize: typography.h3 },
  topPickText: { marginTop: 4, fontFamily: fonts.medium },
  emptyCard: { marginTop: spacing.md },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: 18 },
  emptyBody: { marginTop: spacing.sm, fontFamily: fonts.medium, lineHeight: 22 },
  blobA: { marginBottom: spacing.md, borderTopLeftRadius: 54, borderTopRightRadius: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 48 },
  blobB: { marginBottom: spacing.md, borderTopLeftRadius: 30, borderTopRightRadius: 56, borderBottomLeftRadius: 50, borderBottomRightRadius: 26 },
  badge: { alignSelf: 'flex-end', borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  badgeText: { color: '#fff', fontFamily: fonts.semibold },
  urgent: { marginTop: spacing.sm, fontFamily: fonts.medium },
  item: { marginTop: spacing.sm, fontFamily: fonts.semibold, fontSize: typography.h3 },
  store: { marginTop: 4, fontFamily: fonts.medium },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  original: { textDecorationLine: 'line-through', marginRight: spacing.sm, fontFamily: fonts.medium },
  sale: { fontSize: 30, fontFamily: fonts.bold },
  rowBetween: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radii.pill, borderWidth: 1 },
});
