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
import { Link, useRouter } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { Heading, NoiseOverlay, Subtle } from '../../components/ui/OrganicPrimitives';
import { OrganicButton } from '../../components/ui/OrganicPrimitives';
import { useAuth } from '../../context/AuthContext';
import { safeTop, spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
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
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>
          <Heading>Create account</Heading>
          <Subtle>Use the same email you’ll use for receipts.</Subtle>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Name</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.meta}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.meta}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Password (8+ chars)</Text>
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
              <OrganicButton label="Register" onPress={() => void onSubmit()} />
            </View>
          )}

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.linkWrap}>
              <Text style={[styles.link, { color: colors.primary }]}>Already have an account</Text>
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
  back: { marginBottom: spacing.md, alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.semibold, fontSize: 16 },
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
