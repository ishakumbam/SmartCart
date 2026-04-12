import React, { useState } from 'react';
import { Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { MvpScreen } from '../../components/mvp/MvpScreen';
import { OrganicButton, OrganicCard } from '../../components/ui/OrganicPrimitives';
import { useAuth } from '../../context/AuthContext';
import { spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

export default function SignOutScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  return (
    <MvpScreen title="Sign out" subtitle="End your session on this device.">
      <OrganicCard style={styles.card}>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          You’ll need to sign in again to sync receipts and deals. This clears tokens on the device and logs out on the
          server when possible.
        </Text>
      </OrganicCard>
      <View style={styles.actions}>
        <OrganicButton
          label={busy ? 'Signing out…' : 'Sign out'}
          onPress={() => {
            if (busy) return;
            setBusy(true);
            void (async () => {
              try {
                await signOut();
                router.replace('/(auth)/login');
              } finally {
                setBusy(false);
              }
            })();
          }}
        />
        {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
        <View style={{ height: spacing.sm }} />
        <OrganicButton kind="outline" label="Cancel" onPress={() => !busy && router.back()} />
      </View>
    </MvpScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
