import { Alert } from 'react-native';

type RouterLike = { push: (href: string) => void; back: () => void };

/** After upload + OCR pipeline — explain how trends & deal ranking use buy profiles. */
export function showReceiptPipelineResult(status: 'PROCESSED' | 'FAILED' | 'TIMEOUT', router: RouterLike): void {
  if (status === 'PROCESSED') {
    Alert.alert(
      'Receipt scanned',
      'We extracted line items and updated what you buy often. Open Habits to see trends — Home ranks nearby deals to match those items.',
      [
        { text: 'Habits', onPress: () => router.push('/(tabs)/habits') },
        { text: 'Deals', onPress: () => router.push('/(tabs)') },
        { text: 'OK', style: 'cancel' },
      ],
    );
    return;
  }
  if (status === 'FAILED') {
    Alert.alert(
      'Could not read receipt',
      'Try a flatter, brighter photo with prices visible on each line. On the server: use Tesseract (free) or Google Vision — see README / server .env.example.',
    );
    return;
  }
  Alert.alert(
    'Still processing',
    'OCR may still be running. Pull to refresh on Habits in a minute, or try again if it stays empty.',
    [{ text: 'Habits', onPress: () => router.push('/(tabs)/habits') }, { text: 'OK', style: 'cancel' }],
  );
}
