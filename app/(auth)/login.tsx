import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { Heading, NoiseOverlay, OrganicButton, Subtle } from '../../components/ui/OrganicPrimitives';
import { useAuth } from '../../context/AuthContext';
import { safeTop, spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';
import { API_URL, apiBaseMessage } from '../../constants/config';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <NoiseOverlay />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: safeTop }}>
          <Heading>SmartCart</Heading>
          <Subtle>Sign in to sync receipts and deals.</Subtle>
          <Text style={[styles.apiHint, { color: colors.meta }]}>
            API: {API_URL}
          </Text>
          <Text style={[styles.apiHint, { color: colors.meta }]}>{apiBaseMessage}</Text>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.meta}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.meta}
          />

          {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator style={styles.spinner} color={colors.primary} />
          ) : (
            <View style={styles.btn}>
              <OrganicButton label="Sign in" onPress={() => void onSubmit()} />
            </View>
          )}

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.linkWrap}>
              <Text style={[styles.link, { color: colors.primary }]}>Create an account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  apiHint: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  label: {
    marginTop: spacing.lg,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  input: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  error: {
    marginTop: spacing.md,
    fontFamily: fonts.medium,
  },
  spinner: { marginTop: spacing.lg },
  btn: { marginTop: spacing.lg },
  linkWrap: { marginTop: spacing.xl, alignItems: 'center' },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
});
