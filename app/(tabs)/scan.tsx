import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { NoiseOverlay } from '../../components/ui/OrganicPrimitives';
import { radii, safeTop, spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

export default function ScanScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const ring = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [ring]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <NoiseOverlay />
      <Text style={[styles.align, { color: colors.mutedForeground }]}>Align receipt within frame</Text>
      <View style={styles.frame}>
        <View style={[styles.corner, styles.tl, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.tr, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.bl, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.br, { borderColor: colors.primary }]} />
      </View>
      <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Point at your receipt</Text>
        <Animated.View style={[styles.pulse, { borderColor: colors.primary, transform: [{ scale: ring }] }]} />
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() => router.push('/scan/camera')}
        >
          <LinearGradient colors={[colors.gradientA, colors.gradientB]} style={styles.capture}>
            <Ionicons name="camera" size={36} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.76}
          onPress={() => router.push('/scan/upload')}
          style={[styles.upload, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.mutedForeground, fontFamily: fonts.semibold }}>Upload from Photos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: safeTop, alignItems: 'center' },
  align: { fontFamily: fonts.semibold, marginBottom: spacing.lg },
  frame: { width: 290, height: 380, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderWidth: 4 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  sheet: { position: 'absolute', bottom: 0, width: '100%', padding: spacing.lg, borderTopWidth: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, alignItems: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: 24, marginBottom: spacing.lg },
  pulse: { position: 'absolute', top: 80, width: 98, height: 98, borderRadius: 49, borderWidth: 2 },
  capture: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  upload: { marginTop: spacing.lg, borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: 12 },
});
