import { ScrollView, Text, View } from 'react-native';

export default function HabitsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: '#6366f1', padding: 24, paddingTop: 60 }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
          📊 My Habits
        </Text>
        <Text style={{ color: 'white', fontSize: 16, marginTop: 4 }}>
          Your spending patterns
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
          🛒 Most Bought Items
        </Text>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>🥛 Organic Whole Milk</Text>
          <View style={{ backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 8, height: 12 }}>
            <View style={{ backgroundColor: '#6366f1', borderRadius: 8, height: 12, width: '90%' }} />
          </View>
          <Text style={{ color: 'gray', marginTop: 4 }}>Bought 9x this month</Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>🍞 Whole Wheat Bread</Text>
          <View style={{ backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 8, height: 12 }}>
            <View style={{ backgroundColor: '#6366f1', borderRadius: 8, height: 12, width: '70%' }} />
          </View>
          <Text style={{ color: 'gray', marginTop: 4 }}>Bought 7x this month</Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>🥚 Free Range Eggs</Text>
          <View style={{ backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 8, height: 12 }}>
            <View style={{ backgroundColor: '#6366f1', borderRadius: 8, height: 12, width: '50%' }} />
          </View>
          <Text style={{ color: 'gray', marginTop: 4 }}>Bought 5x this month</Text>
        </View>

        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, marginTop: 8 }}>
          💰 Monthly Spending
        </Text>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#6366f1' }}>$284</Text>
          <Text style={{ color: 'gray' }}>Total this month</Text>
          <Text style={{ color: 'green', marginTop: 8 }}>✅ $43 saved with SmartCart!</Text>
        </View>
      </View>
    </ScrollView>
  );
}