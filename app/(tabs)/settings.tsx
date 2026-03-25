import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: '#6366f1', padding: 24, paddingTop: 60 }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
          ⚙️ Settings
        </Text>
        <Text style={{ color: 'white', fontSize: 16, marginTop: 4 }}>
          Your account & preferences
        </Text>
      </View>

      <View style={{ padding: 16 }}>

        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 40 }}>👤</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>Isha Kumbam</Text>
          <Text style={{ color: 'gray' }}>isha@email.com</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'gray', marginBottom: 8 }}>
          PREFERENCES
        </Text>

        <View style={{ backgroundColor: 'white', borderRadius: 12, marginBottom: 16 }}>
          <TouchableOpacity style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16 }}>📍 Search Radius</Text>
            <Text style={{ color: 'gray' }}>25 miles →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16 }}>🔔 Push Notifications</Text>
            <Text style={{ color: 'gray' }}>On →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16 }}>🏪 Favourite Stores</Text>
            <Text style={{ color: 'gray' }}>3 stores →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ backgroundColor: '#ef4444', borderRadius: 12, padding: 16, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Sign Out</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}