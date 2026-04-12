import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { MvpHeroCard, MvpScreen } from '../../components/mvp/MvpScreen';
import { OrganicButton, OrganicCard } from '../../components/ui/OrganicPrimitives';
import { radii, spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';
import { runReceiptPipeline } from '../../lib/receiptUpload';

export default function ScanCaptureScreen() {
  const { colors } = useAppTheme();
  const [busy, setBusy] = useState(false);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera', 'Allow camera access in Settings to scan receipts.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setBusy(true);
    try {
      const status = await runReceiptPipeline(result.assets[0].uri);
      if (status === 'PROCESSED') Alert.alert('Done', 'Receipt processed. Items will appear in Habits shortly.');
      else if (status === 'FAILED') Alert.alert('Processing failed', 'Try a clearer photo.');
      else Alert.alert('Still working', 'Processing is taking longer than usual. Check Habits in a minute.');
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <MvpScreen title="Capture receipt" subtitle="Take a clear photo of the full receipt.">
      <MvpHeroCard>
        <View style={[styles.frame, { borderColor: colors.primary }]}>
          <View style={[styles.corner, styles.tl, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.tr, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.bl, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.br, { borderColor: colors.primary }]} />
          <Text style={[styles.frameHint, { color: colors.mutedForeground }]}>Align receipt edges</Text>
        </View>
        <OrganicButton label={busy ? 'Uploading…' : 'Open camera'} onPress={() => void takePhoto()} />
        {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
      </MvpHeroCard>

      <OrganicCard style={styles.card}>
        <Text style={[styles.p, { color: colors.mutedForeground }]}>
          Images are converted to JPEG, uploaded securely, then queued for OCR on the server.
        </Text>
      </OrganicCard>
    </MvpScreen>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 220,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderWidth: 3,
  },
  tl: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0 },
  frameHint: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  card: {
    marginTop: spacing.lg,
  },
  p: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
});
