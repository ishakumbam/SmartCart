import { Redirect } from 'expo-router';

/** Legacy route — live camera lives in `/scan/camera`. */
export default function ScanCaptureScreen() {
  return <Redirect href="/scan/camera" />;
}
