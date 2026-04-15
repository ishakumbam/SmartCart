import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { runReceiptPipeline } from '../../lib/receiptUpload';
import { showReceiptPipelineResult } from '../../lib/receiptScanResult';
import { spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';

export default function ReceiptCameraScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const camRef = useRef<Camera>(null);
  const [perm, requestPerm] = Camera.useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const onCapture = useCallback(async () => {
    if (!camRef.current || !ready || busy) return;
    setBusy(true);
    try {
      const photo = await camRef.current.takePictureAsync({
        quality: 0.88,
        skipProcessing: Platform.OS === 'android',
        exif: false,
      });
      if (!photo?.uri) return;
      const status = await runReceiptPipeline(photo.uri);
      showReceiptPipelineResult(status, router);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Check your network and API URL.');
    } finally {
      setBusy(false);
    }
  }, [ready, busy, router]);

  if (!perm) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!perm.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <Text style={[styles.msg, { color: colors.foreground }]}>Camera access is needed to scan receipts.</Text>
        <TouchableOpacity
          onPress={() => void requestPerm()}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Allow camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.mutedForeground, fontFamily: fonts.semibold }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Camera
        ref={camRef}
        style={{ width, height }}
        type={CameraType.back}
        ratio={Platform.OS === 'android' ? '16:9' : undefined}
        onCameraReady={() => setReady(true)}
      />

      <View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.iconBtn, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
            hitSlop={12}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.hint}>Fill the frame · tap shutter when text is sharp</Text>
        </View>

        <View style={styles.frameGuide}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        <View style={styles.bottom}>
          {busy ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <TouchableOpacity
              onPress={() => void onCapture()}
              disabled={!ready}
              style={[styles.shutter, !ready && { opacity: 0.5 }]}
              activeOpacity={0.85}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          )}
          <Text style={styles.bottomHint}>
            {busy ? 'Uploading & reading receipt…' : ready ? 'Capture receipt' : 'Starting camera…'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  msg: { fontFamily: fonts.medium, fontSize: 16, textAlign: 'center', marginBottom: spacing.lg },
  primaryBtn: { paddingHorizontal: spacing.xl, paddingVertical: 14, borderRadius: 999 },
  primaryBtnText: { fontFamily: fonts.semibold, fontSize: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    flex: 1,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: fonts.semibold,
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  frameGuide: {
    alignSelf: 'center',
    width: '86%',
    aspectRatio: 0.72,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: 'rgba(255,255,255,0.85)',
    borderWidth: 3,
  },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  bottom: { alignItems: 'center' },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  bottomHint: {
    marginTop: spacing.md,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});
