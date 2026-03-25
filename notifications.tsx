import { ScrollView, Text, View } from 'react-native';

export default function NotificationsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: '#6366f1', padding: 24, paddingTop: 60 }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
          🔔 Notifications
        </Text>
        <Text style={{ color: 'white', fontSize: 16, marginTop: 4 }}>
          Your latest deal alerts
        </Text>
      </View>

      <View style={{ padding: 16 }}>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#6366f1' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>🥛 40% off Organic Milk!</Text>
          <Text style={{ color: 'gray', marginTop: 4 }}>On sale at Walmart near you</Text>
          <Text style={{ color: '#6366f1', marginTop: 4, fontSize: 12 }}>2 mins ago</Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#10b981' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>🍞 25% off Wheat Bread!</Text>
          <Text style={{ color: 'gray', marginTop: 4 }}>On sale at Target near you</Text>
          <Text style={{ color: '#10b981', marginTop: 4, fontSize: 12 }}>1 hour ago</Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#f59e0b' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>🥚 30% off Free Range Eggs!</Text>
          <Text style={{ color: 'gray', marginTop: 4 }}>On sale at Kroger near you</Text>
          <Text style={{ color: '#f59e0b', marginTop: 4, fontSize: 12 }}>3 hours ago</Text>
        </View>

      </View>
    </ScrollView>
  );
}