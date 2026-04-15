import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { MvpHeroCard, MvpScreen } from '../../components/mvp/MvpScreen';
import { OrganicCard } from '../../components/ui/OrganicPrimitives';
import { spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';
import { runReceiptPipeline } from '../../lib/receiptUpload';
import { showReceiptPipelineResult } from '../../lib/receiptScanResult';

type Phase = 'idle' | 'picking' | 'uploading';

export default function ScanUploadScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');

  const label =
    phase === 'picking'
      ? 'Opening Photos…'
      : phase === 'uploading'
        ? 'Uploading & scanning…'
        : 'Tap to choose photo';

  const pickAndUpload = async () => {
    if (phase !== 'idle') return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos', 'Allow photo library access in Settings to upload a receipt image.');
      return;
    }

    setPhase('picking');
    let uri: string | undefined;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
        allowsMultipleSelection: false,
        ...(Platform.OS === 'ios'
          ? {
              presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
              preferredAssetRepresentationMode:
                ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
            }
          : {}),
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        setPhase('idle');
        return;
      }
      uri = result.assets[0].uri;
    } catch (e) {
      setPhase('idle');
      Alert.alert('Photos', e instanceof Error ? e.message : 'Could not open the photo library.');
      return;
    }

    setPhase('uploading');
    try {
      const status = await runReceiptPipeline(uri);
      showReceiptPipelineResult(status, router);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setPhase('idle');
    }
  };

  return (
    <MvpScreen title="Upload from Photos" subtitle="Pick a receipt image from your library.">
      <MvpHeroCard>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => void pickAndUpload()}
          disabled={phase !== 'idle'}
          style={[styles.drop, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}
        >
          <Ionicons name="images-outline" size={40} color={colors.foreground} style={styles.dropIcon} />
          <Text style={[styles.dropTitle, { color: colors.foreground }]}>{label}</Text>
          <Text style={[styles.dropSub, { color: colors.meta }]}>
            {phase === 'uploading'
              ? 'This can take up to a minute while we read the receipt.'
              : 'JPEG / HEIC / PNG · converted to JPEG for upload'}
          </Text>
        </TouchableOpacity>
        {phase !== 'idle' ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
      </MvpHeroCard>

      <OrganicCard style={styles.card}>
        <Text style={[styles.p, { color: colors.mutedForeground }]}>
          If Photos feels stuck or empty: iOS Settings → SmartCart → Photos → All Photos (not only Selected).
          HEIC/large images are resized before upload. Needs a running API, S3/R2, Redis worker, and Vision OCR on the
          server.
        </Text>
      </OrganicCard>
    </MvpScreen>
  );
}

const styles = StyleSheet.create({
  drop: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 24,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  dropIcon: {
    marginBottom: spacing.sm,
  },
  dropTitle: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    textAlign: 'center',
  },
  dropSub: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: 14,
    textAlign: 'center',
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
