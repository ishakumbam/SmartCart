import { View, Text, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: '#6366f1', padding: 24, paddingTop: 60 }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
          🛒 SmartCart
        </Text>
        <Text style={{ color: 'white', fontSize: 16, marginTop: 4 }}>
          Deals picked just for you
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
          🔥 Top Deals
        </Text>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🥛 Organic Whole Milk</Text>
          <Text style={{ color: 'green', fontSize: 16, marginTop: 4 }}>40% off — $3.99</Text>
          <Text style={{ color: 'gray', fontSize: 14 }}>Walmart • 0.8 miles away</Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🍞 Whole Wheat Bread</Text>
          <Text style={{ color: 'green', fontSize: 16, marginTop: 4 }}>25% off — $2.49</Text>
          <Text style={{ color: 'gray', fontSize: 14 }}>Target • 1.2 miles away</Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🥚 Free Range Eggs</Text>
          <Text style={{ color: 'green', fontSize: 16, marginTop: 4 }}>30% off — $4.99</Text>
          <Text style={{ color: 'gray', fontSize: 14 }}>Kroger • 2.1 miles away</Text>
        </View>
      </View>
    </ScrollView>
  );
}