import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { Heading, NoiseOverlay, OrganicCard, Subtle } from '../../components/ui/OrganicPrimitives';
import { safeTop, spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';
import { apiFetch } from '../../lib/api';
import type { ApiNotification } from '../../lib/types';
import { formatRelativeTime } from '../../lib/format';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function NotificationsScreen() {
  const { colors } = useAppTheme();
  const [rows, setRows] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const list = await apiFetch<ApiNotification[]>('/api/notifications');
      setRows(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load');
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const todayStart = startOfToday();
  const today = rows.filter((r) => new Date(r.createdAt) >= todayStart);
  const earlier = rows.filter((r) => new Date(r.createdAt) < todayStart);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <NoiseOverlay />
      <View style={styles.header}>
        <Heading>Inbox</Heading>
        <Subtle>Deals we surfaced for you.</Subtle>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : err ? (
        <Text style={[styles.hint, { color: colors.destructive }]}>{err}</Text>
      ) : null}

      {!loading && !err && rows.length === 0 ? (
        <OrganicCard style={{ marginHorizontal: spacing.lg }}>
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No notifications yet.</Text>
        </OrganicCard>
      ) : null}

      <Text style={[styles.sectionHead, { color: colors.meta }]}>Today</Text>
      {today.map((r) => (
        <NotifCard key={r.id} row={r} onRead={() => void load()} />
      ))}

      <Text style={[styles.sectionHead, styles.sectionHeadSpaced, { color: colors.meta }]}>Earlier</Text>
      {earlier.map((r) => (
        <NotifCard key={r.id} row={r} onRead={() => void load()} />
      ))}

      <Text style={[styles.hint, { color: colors.meta }]}>Tap a card to mark it read</Text>
    </ScrollView>
  );
}

function NotifCard({ row, onRead }: { row: ApiNotification; onRead: () => void }) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const unread = !row.read;
  const initial = row.title.trim().charAt(0).toUpperCase() || '?';
  const subParts = [row.body];
  if (row.deal?.storeName) subParts.push(row.deal.storeName);
  const sub = subParts.filter(Boolean).join(' · ');
  const when = formatRelativeTime(row.createdAt);
  const circleBg = unread ? 'rgba(138,155,130,0.35)' : 'rgba(148,163,184,0.22)';

  const markRead = async () => {
    if (row.read) return;
    try {
      await apiFetch(`/api/notifications/${row.id}/read`, { method: 'PATCH', body: '{}' });
      onRead();
    } catch {
      /* ignore */
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={() => void markRead()}>
      <OrganicCard style={[styles.card, { backgroundColor: unread ? colors.cardAlt : colors.card }]}>
        {unread ? <View style={[styles.glowStripe, { backgroundColor: colors.primary }]} /> : null}
        <View style={styles.cardInner}>
          <View style={[styles.iconCircle, { backgroundColor: circleBg }]}>
            <Text style={[styles.initial, { color: colors.foreground }]}>{initial}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{row.title}</Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{sub}</Text>
            <View style={styles.cardRow}>
              <Text style={[styles.when, { color: colors.meta }]}>{when}</Text>
              {row.dealId ? (
                <TouchableOpacity
                  style={[styles.pill, { borderColor: colors.border, backgroundColor: colors.accent }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    void markRead();
                    router.push(`/deal/${row.dealId}`);
                  }}
                >
                  <Text style={[styles.pillText, { color: colors.accentForeground }]}>View Deal</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </OrganicCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: safeTop,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  empty: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionHead: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    fontSize: 13,
    fontFamily: fonts.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionHeadSpaced: {
    marginTop: spacing.xl,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  glowStripe: {
    width: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  initial: {
    fontSize: 18,
    fontFamily: fonts.semibold,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    lineHeight: 22,
  },
  cardSub: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.medium,
    lineHeight: 20,
  },
  cardRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  when: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    letterSpacing: 0.2,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
  },
  hint: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fonts.medium,
    lineHeight: 18,
  },
});
