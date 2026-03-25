import { Text, TouchableOpacity, View } from 'react-native';

export default function ScanScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ backgroundColor: '#6366f1', padding: 24, paddingTop: 60 }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
          📷 Scan Receipt
        </Text>
        <Text style={{ color: 'white', fontSize: 16, marginTop: 4 }}>
          Point at your receipt to find deals
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontSize: 16, marginBottom: 40, opacity: 0.6 }}>
          Camera will appear here
        </Text>
        <TouchableOpacity style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
          borderWidth: 4, borderColor: '#6366f1'
        }}>
          <Text style={{ fontSize: 30 }}>📷</Text>
        </TouchableOpacity>
        <Text style={{ color: 'white', marginTop: 16, opacity: 0.6 }}>
          Tap to scan
        </Text>
      </View>
    </View>
  );
}