import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../components/theme/AppThemeProvider';
import { MvpHeroCard, MvpScreen } from '../../components/mvp/MvpScreen';
import { OrganicCard } from '../../components/ui/OrganicPrimitives';
import { spacing } from '../../constants/designSystem';
import { fonts } from '../../constants/fonts';
import { runReceiptPipeline } from '../../lib/receiptUpload';

export default function ScanUploadScreen() {
  const { colors } = useAppTheme();
  const [busy, setBusy] = useState(false);

  const pickAndUpload = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos', 'Allow photo library access to upload a saved receipt.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setBusy(true);
    try {
      const status = await runReceiptPipeline(result.assets[0].uri);
      if (status === 'PROCESSED') Alert.alert('Done', 'Receipt processed. Items will appear in Habits shortly.');
      else if (status === 'FAILED') Alert.alert('Processing failed', 'Try another image.');
      else Alert.alert('Still working', 'Processing is taking longer than usual. Check Habits in a minute.');
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <MvpScreen title="Upload from Photos" subtitle="Pick a receipt image from your library.">
      <MvpHeroCard>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => void pickAndUpload()}
          disabled={busy}
          style={[styles.drop, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}
        >
          <Ionicons name="images-outline" size={40} color={colors.foreground} style={styles.dropIcon} />
          <Text style={[styles.dropTitle, { color: colors.foreground }]}>
            {busy ? 'Uploading…' : 'Tap to choose photo'}
          </Text>
          <Text style={[styles.dropSub, { color: colors.meta }]}>JPEG / PNG · converted to JPEG for upload</Text>
        </TouchableOpacity>
        {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
      </MvpHeroCard>

      <OrganicCard style={styles.card}>
        <Text style={[styles.p, { color: colors.mutedForeground }]}>
          The app requests a presigned URL, uploads to object storage, then queues OCR processing.
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
  },
  dropSub: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
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
