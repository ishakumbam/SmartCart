import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { Heading, NoiseOverlay, OrganicCard, Subtle } from '../../components/ui/OrganicPrimitives';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import type { HabitsPayload } from '../../lib/types';
import { money } from '../../lib/format';
import { safeTop, spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

type Section = {
  title: string;
  rows: {
    key: string;
    label: string;
    value: string;
    icon: string;
    tile: string;
  }[];
};

const SECTIONS: Section[] = [
  {
    title: 'Account',
    rows: [
      { key: 'email', label: 'Email', value: 'Verified', icon: 'EM', tile: 'rgba(138,155,130,0.35)' },
      { key: 'phone', label: 'Phone', value: 'Add', icon: 'PH', tile: 'rgba(122,159,120,0.28)' },
      { key: 'security', label: 'Security', value: 'Face ID', icon: 'SC', tile: 'rgba(168,148,114,0.32)' },
    ],
  },
  {
    title: 'Preferences',
    rows: [
      { key: 'radius', label: 'Search radius', value: '25 mi', icon: 'RD', tile: 'rgba(130,150,125,0.28)' },
      { key: 'notif', label: 'Notifications', value: 'On', icon: 'NT', tile: 'rgba(180,152,130,0.28)' },
      { key: 'stores', label: 'Favorite stores', value: '3', icon: 'ST', tile: 'rgba(120,135,115,0.35)' },
    ],
  },
  {
    title: 'About',
    rows: [
      { key: 'help', label: 'Help center', value: '', icon: 'HP', tile: 'rgba(148,163,184,0.35)' },
      { key: 'legal', label: 'Legal', value: '', icon: 'LG', tile: 'rgba(148,163,184,0.25)' },
    ],
  },
];

export default function SettingsScreen() {
  const { colors, mode, toggleMode } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitsPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const h = await apiFetch<HabitsPayload>('/api/habits');
        if (!cancelled) setHabits(h);
      } catch {
        if (!cancelled) setHabits(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = useMemo(() => {
    const n = user?.name?.trim();
    if (n) {
      const parts = n.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return n.slice(0, 2).toUpperCase();
    }
    const e = user?.email?.trim();
    return e ? e.slice(0, 2).toUpperCase() : '??';
  }, [user]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <NoiseOverlay />
      <View style={styles.header}>
        <Heading>Settings</Heading>
        <Subtle>Profile, preferences, and membership.</Subtle>
      </View>

      <OrganicCard style={styles.profileCard}>
        <LinearGradient
          colors={[colors.gradientA, colors.gradientB]}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        <Text style={[styles.name, { color: colors.foreground }]}>{user?.name ?? 'Account'}</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{user?.email ?? ''}</Text>
        <View style={styles.badge}>
          <LinearGradient
            colors={[colors.gradientA, colors.gradientB]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.badgeGrad}
          >
            <Text style={styles.badgeText}>Pro member</Text>
          </LinearGradient>
        </View>
      </OrganicCard>

      <OrganicCard style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>
            {habits ? money(habits.totalSpent) : '—'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.meta }]}>Spent this month</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>
            {habits ? String(habits.categoryPie.length) : '—'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.meta }]}>Categories</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>
            {habits ? money(habits.totalSaved) : '—'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.meta }]}>Deal savings</Text>
        </View>
      </OrganicCard>

      <TouchableOpacity activeOpacity={0.8} onPress={toggleMode} style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={{ fontFamily: fonts.medium, color: colors.foreground }}>
          Theme: {mode === 'dark' ? 'Dark Premium' : 'Organic Light'} (tap to switch)
        </Text>
      </TouchableOpacity>

      {SECTIONS.map((sec) => (
        <View key={sec.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{sec.title}</Text>
          <OrganicCard style={styles.group}>
            {sec.rows.map((r, idx) => (
              <TouchableOpacity
                key={r.key}
                activeOpacity={0.75}
                onPress={() => router.push({ pathname: '/settings/detail', params: { key: r.key } })}
                style={[styles.row, idx < sec.rows.length - 1 ? styles.rowBorder : null]}
              >
                <View style={[styles.tile, { backgroundColor: r.tile }]}>
                  <Text style={styles.tileIcon}>{r.icon}</Text>
                </View>
                <Text style={[styles.rowLabel, { color: colors.foreground }]}>{r.label}</Text>
                <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{r.value}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.meta} />
              </TouchableOpacity>
            ))}
          </OrganicCard>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.signOut, { backgroundColor: colors.destructive }]}
        activeOpacity={0.88}
        onPress={() => router.push('/settings/sign-out')}
      >
        <Ionicons name="log-out-outline" size={20} color="#ffffff" style={styles.signOutIcon} />
        <Text style={styles.signOutText}>Sign out</Text>
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
  profileCard: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  name: {
    marginTop: spacing.md,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: fonts.semibold,
  },
  email: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  badge: {
    marginTop: spacing.md,
    borderRadius: 999,
    overflow: 'hidden',
  },
  badgeGrad: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  statsRow: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: spacing.md,
  },
  toggle: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#2a2a2a',
    marginVertical: spacing.sm,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: fonts.semibold,
    letterSpacing: -0.4,
  },
  statLabel: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: fonts.semibold,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: fonts.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  group: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#00000022',
  },
  tile: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tileIcon: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    letterSpacing: 0.5,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: fonts.medium,
    marginRight: spacing.sm,
  },
  signOut: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutIcon: {
    marginRight: spacing.sm,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});
