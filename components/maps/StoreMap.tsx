import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useAppTheme } from '../theme/AppThemeProvider';
import { fonts } from '../../constants/fonts';
import { regionForMockDeals } from '../../constants/mockDeals';

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
};

type Props = {
  markers: MapMarker[];
  height?: number;
};

export function StoreMap({ markers, height = 220 }: Props) {
  const { colors } = useAppTheme();

  const initialRegion = useMemo(() => {
    if (markers.length === 0) {
      return regionForMockDeals();
    }
    if (markers.length === 1) {
      const m = markers[0];
      return {
        latitude: m.latitude,
        longitude: m.longitude,
        latitudeDelta: 0.035,
        longitudeDelta: 0.035,
      };
    }
    const lats = markers.map((m) => m.latitude);
    const lngs = markers.map((m) => m.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const lat = (minLat + maxLat) / 2;
    const lng = (minLng + maxLng) / 2;
    const latDelta = Math.max(maxLat - minLat, 0.015) * 1.5 + 0.025;
    const lngDelta = Math.max(maxLng - minLng, 0.015) * 1.5 + 0.025;
    return { latitude: lat, longitude: lng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
  }, [markers]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.fallback, { height, borderColor: colors.border, backgroundColor: colors.muted }]}>
        <Text style={[styles.fallbackTitle, { color: colors.meta }]}>Map</Text>
        <Text style={[styles.fallbackSub, { color: colors.mutedForeground }]}>
          Open the iOS or Android app for the interactive map.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height, borderColor: colors.border }]}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  fallback: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    justifyContent: 'center',
  },
  fallbackTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fallbackSub: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
});
