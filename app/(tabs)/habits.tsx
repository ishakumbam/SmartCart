import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { Heading, NoiseOverlay, OrganicCard, Subtle } from '../../components/ui/OrganicPrimitives';
import { safeTop, spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';
import { apiFetch } from '../../lib/api';
import type { HabitsPayload } from '../../lib/types';
import { money } from '../../lib/format';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function weekSpendBars(weeklyTrend: { week: string; total: number }[]): number[] {
  const sorted = [...weeklyTrend].sort((a, b) => a.week.localeCompare(b.week));
  const last = sorted.slice(-7);
  const pad = Math.max(0, 7 - last.length);
  const zeros = Array(pad).fill(0);
  return [...zeros, ...last.map((w) => w.total)];
}

export default function HabitsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [data, setData] = useState<HabitsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const h = await apiFetch<HabitsPayload>('/api/habits');
      setData(h);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load habits');
      setData(null);
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

  const weekSpend = data ? weekSpendBars(data.weeklyTrend) : Array(7).fill(0);
  const maxSpend = Math.max(...weekSpend, 1);
  const top = data?.topItems?.[0];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <NoiseOverlay />
      <View style={styles.header}>
        <Heading>Habits</Heading>
        <Subtle>How you shop — and where you save.</Subtle>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : err ? (
        <OrganicCard style={styles.summaryCard}>
          <Text style={[styles.err, { color: colors.mutedForeground }]}>{err}</Text>
        </OrganicCard>
      ) : null}

      <OrganicCard style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Estimated saved (deal clicks)</Text>
            <View style={styles.savedRow}>
              <Text style={[styles.savedAmount, { color: colors.success }]}>
                {data ? money(data.totalSaved) : '—'}
              </Text>
              <View style={[styles.arrowUp, { borderColor: colors.success }]}>
                <Ionicons name="trending-up" size={20} color={colors.success} />
              </View>
            </View>
            <Text style={[styles.summaryFoot, { color: colors.meta }]}>
              Spent this month: {data ? money(data.totalSpent) : '—'} · vs. receipt line items
            </Text>
          </View>
          <LinearGradient colors={[colors.gradientA, colors.gradientB]} style={styles.summarySpark}>
            <Ionicons name="checkmark" size={26} color="#fff" />
          </LinearGradient>
        </View>
      </OrganicCard>

      <OrganicCard style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: colors.foreground }]}>Spending trend</Text>
        <Text style={[styles.chartMeta, { color: colors.meta }]}>Last buckets with data · weekly totals</Text>
        <View style={styles.chartWrap}>
          {weekSpend.map((h, i) => {
            const ratio = maxSpend > 0 ? h / maxSpend : 0;
            const rest = Math.max(0, 1 - ratio);
            return (
              <View key={DAY_LABELS[i] + String(i)} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.barSpacer, { flex: rest }]} />
                  <LinearGradient
                    colors={[`${colors.gradientA}55`, colors.gradientB]}
                    style={[styles.barFill, { flex: ratio || 0.02 }]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.meta }]}>{DAY_LABELS[i]}</Text>
              </View>
            );
          })}
        </View>
      </OrganicCard>

      <TouchableOpacity activeOpacity={0.92} onPress={() => router.push('/shopping-insight')}>
        <LinearGradient colors={[colors.gradientA, colors.gradientB]} style={styles.insight}>
          <Text style={styles.insightTitle}>Insight</Text>
          <Text style={styles.insightBody}>
            {top
              ? `You buy “${top.canonicalItem}” often — we’ll surface matching deals when they hit your radius.`
              : 'Scan a few receipts so we can learn what you buy and personalize deals.'}
          </Text>
          <Text style={styles.insightTap}>Tap for details</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
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
  err: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontFamily: fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  savedAmount: {
    fontSize: 40,
    fontFamily: fonts.semibold,
    letterSpacing: -1,
  },
  arrowUp: {
    marginLeft: spacing.sm,
    backgroundColor: 'rgba(34,197,94,0.18)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00000000',
  },
  summaryFoot: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontFamily: fonts.medium,
    lineHeight: 20,
  },
  summarySpark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  chartTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
  },
  chartMeta: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: fonts.medium,
    marginBottom: spacing.lg,
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingTop: spacing.sm,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barTrack: {
    width: '100%',
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#00000018',
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  barSpacer: {
    width: '100%',
  },
  barFill: {
    width: '100%',
    minHeight: 8,
    borderRadius: 10,
  },
  barLabel: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontFamily: fonts.semibold,
  },
  insight: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 32,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  insightTitle: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  insightBody: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#f5f4f2',
    lineHeight: 24,
  },
  insightTap: {
    marginTop: spacing.md,
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: 'rgba(255,255,255,0.85)',
  },
});
