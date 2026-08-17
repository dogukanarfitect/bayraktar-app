import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components';
import { colors } from '../theme';
import { trUpper } from '../turkishText';

const serviceCompanies = [
  {
    id: 'ege-endustri',
    name: 'Ege Endüstri',
    description: 'Dingil, diferansiyel kovanı ve süspansiyon parçaları üretimi',
    facilities: [
      {
        id: 'ege-endustri-pinarbasi',
        name: 'Pınarbaşı Tesisi',
        area: 'Bornova',
        address: 'Kemalpaşa Cad. No:280, Pınarbaşı, Bornova, İzmir',
        coordinates: { latitude: 38.431225, longitude: 27.256361 },
        departure: '17:40',
        duration: '32 dk',
        plate: '35 S 2482',
        stops: [
          { name: 'Bornova Metro', hint: 'Kalkış noktası', time: '17:40', coordinate: { latitude: 38.461472, longitude: 27.214627 } },
          { name: 'Işıkkent', hint: 'Ara durak', time: '17:56', coordinate: { latitude: 38.450859, longitude: 27.250294 } },
          { name: 'Naldöken Kavşağı', hint: 'Ara durak', time: '18:04', coordinate: { latitude: 38.444009, longitude: 27.254412 } },
          { name: 'Pınarbaşı Tesisi', hint: 'Son durak', time: '18:12', coordinate: { latitude: 38.431225, longitude: 27.256361 } },
        ],
        routeCoordinates: [
          { latitude: 38.461472, longitude: 27.214627 },
          { latitude: 38.462307, longitude: 27.213812 },
          { latitude: 38.462924, longitude: 27.214734 },
          { latitude: 38.461182, longitude: 27.217173 },
          { latitude: 38.461815, longitude: 27.217768 },
          { latitude: 38.462754, longitude: 27.220101 },
          { latitude: 38.462811, longitude: 27.222261 },
          { latitude: 38.462321, longitude: 27.225435 },
          { latitude: 38.46145, longitude: 27.226478 },
          { latitude: 38.461557, longitude: 27.22828 },
          { latitude: 38.460793, longitude: 27.233087 },
          { latitude: 38.457389, longitude: 27.250544 },
          { latitude: 38.455253, longitude: 27.251351 },
          { latitude: 38.454295, longitude: 27.251018 },
          { latitude: 38.453091, longitude: 27.24973 },
          { latitude: 38.451277, longitude: 27.249985 },
          { latitude: 38.450859, longitude: 27.250294 },
          { latitude: 38.449993, longitude: 27.252411 },
          { latitude: 38.445562, longitude: 27.25293 },
          { latitude: 38.444009, longitude: 27.254412 },
          { latitude: 38.441784, longitude: 27.25587 },
          { latitude: 38.440606, longitude: 27.256227 },
          { latitude: 38.438904, longitude: 27.256101 },
          { latitude: 38.437117, longitude: 27.256723 },
          { latitude: 38.435213, longitude: 27.25785 },
          { latitude: 38.432092, longitude: 27.260981 },
          { latitude: 38.431868, longitude: 27.260327 },
          { latitude: 38.431974, longitude: 27.259251 },
          { latitude: 38.431225, longitude: 27.256361 },
        ],
      },
    ],
  },
] as const;

export const pinarbasiServiceData = serviceCompanies[0].facilities[0];

export function ServiceRoutesPage({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [isFollowed, setIsFollowed] = useState(false);
  const transition = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);
  const company = serviceCompanies[0];
  const facility = pinarbasiServiceData;

  useEffect(() => {
    transition.setValue(0);
    Animated.timing(transition, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [transition]);

  const fitServiceRoute = (animated = true) => {
    mapRef.current?.fitToCoordinates(
      [...facility.routeCoordinates],
      {
        animated,
        edgePadding: { top: 64, right: 42, bottom: 54, left: 42 },
      },
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => fitServiceRoute(true), 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-[#F8F6F2]">
      <StatusBar style="dark" />
      <View className="flex-row items-end border-b-[0.5px] border-line bg-[#FCFBF8] px-5 pb-2" style={{ paddingTop: Math.max(insets.top, 12) }}>
        <View className="h-[52px] flex-1 justify-center"><Pressable hitSlop={12} onPress={onClose} className="h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-line bg-white active:opacity-60"><Icon name="back" size={25} color={colors.ink} /></Pressable></View>
        <View className="h-[52px] items-center justify-center"><Text className="text-[17px] font-medium tracking-[-0.25px] text-ink">Servisler</Text></View>
        <View className="h-[52px] flex-1" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 28, 44) }}>
        <View className="px-5 pt-5">


          <Animated.View style={{ opacity: transition, transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
            <View className="rounded-[21px] border-[0.5px] border-line bg-white px-5 py-[18px]">
              <View className="flex-row items-center justify-between">
                <Text className="text-[8.5px] font-medium text-green">Planlanan sefer</Text>
                <Text className="text-[8px] font-medium tracking-[0.8px] text-muted">{trUpper('Bugün')}</Text>
              </View>

              <View className="mt-4 flex-row items-end justify-between gap-4">
                <View className="flex-1 flex-row items-center gap-3"><View className="h-9 w-9 items-center justify-center rounded-[11px] bg-[#F7ECEF]"><Icon name="bus" size={17} color={colors.brand} /></View><View className="flex-1"><Text className="text-[18px] font-medium tracking-[-0.25px] text-ink">Pınarbaşı Hattı</Text><Text className="mt-1.5 text-[9px] text-muted">Bornova Merkez → Pınarbaşı Tesisi</Text></View></View>
                <View className="items-end"><Text className="text-[24px] font-medium tracking-[-0.4px] text-brand">{facility.departure}</Text><Text className="mt-1 text-[8px] text-muted">Planlanan kalkış</Text></View>
              </View>

              <View className="my-4 h-[0.5px] bg-line" />
              <View className="flex-row items-center justify-between"><Text className="text-[8.5px] text-muted">Araç · {facility.plate}</Text><Text className="text-[8.5px] font-medium text-ink">{facility.stops.length} durak · {facility.duration}</Text></View>
            </View>

            <View className="mb-3 mt-5 flex-row items-end justify-between">
              <Text className="text-[15px] font-medium text-ink">Pınarbaşı servis hattı</Text>
              <Text className="text-[8.5px] text-muted">Güzergâh görünümü</Text>
            </View>
            <View className="h-[250px] overflow-hidden rounded-[24px] border-[0.5px] border-line bg-[#EAE9E3]">
              <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={{
                  ...facility.coordinates,
                  latitudeDelta: 0.012,
                  longitudeDelta: 0.012,
                }}
                mapType="standard"
                showsCompass={false}
                showsScale={false}
                toolbarEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                onMapReady={() => fitServiceRoute(false)}
              >
                <Polyline coordinates={[...facility.routeCoordinates]} strokeColor="rgba(255,255,255,0.96)" strokeWidth={9} />
                <Polyline coordinates={[...facility.routeCoordinates]} strokeColor={colors.brand} strokeWidth={5} lineCap="round" lineJoin="round" />

                {facility.stops.map((stop, index) => (
                  <Marker key={stop.name} coordinate={stop.coordinate} title={stop.name} description={`${stop.time} · ${stop.hint}`} anchor={{ x: 0.5, y: 0.5 }}>
                    {index === facility.stops.length - 1 ? (
                      <View className="h-[46px] w-[46px] items-center justify-center rounded-full border-[3px] border-white bg-brand" style={{ shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}>
                        <Icon name="building" size={20} color={colors.white} />
                      </View>
                    ) : (
                      <View className="h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-brand" style={{ shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } }}>
                        {index === 0 ? <Icon name="bus" size={13} color={colors.white} /> : <Text className="text-[10px] font-semibold text-white">{index + 1}</Text>}
                      </View>
                    )}
                  </Marker>
                ))}
              </MapView>

              <View className="absolute left-3 top-3 max-w-[76%] rounded-[14px] bg-white/95 px-3 py-2" style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}>
                <Text className="text-[9.5px] font-medium text-ink" numberOfLines={1}>{facility.name}</Text>
                <Text className="mt-1 text-[8px] text-muted" numberOfLines={1}>{facility.area}</Text>
              </View>
              <Pressable
                onPress={() => fitServiceRoute(true)}
                className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full border-[0.5px] border-line bg-white/95 active:opacity-70"
              >
                <Icon name="location" size={18} color={colors.brand} />
              </Pressable>
            </View>

            <View className="mt-5">
              <Text className="mb-4 text-[15px] font-medium text-ink">Duraklar</Text>
              <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white px-4 py-2">
                {facility.stops.map((stop, index) => (
                  <View key={stop.name} className="h-[64px] flex-row items-center gap-3">
                    <View className="h-[64px] w-5 items-center justify-center">
                      {index > 0 ? <View className="absolute top-0 h-[27px] w-[1.5px] bg-brand/25" /> : null}
                      {index < facility.stops.length - 1 ? <View className="absolute bottom-0 h-[27px] w-[1.5px] bg-brand/25" /> : null}
                      <View className="z-10 h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-brand">
                        <View className="h-1.5 w-1.5 rounded-full bg-white" />
                      </View>
                    </View>
                    <View className={`h-full flex-1 flex-row items-center justify-between ${index < facility.stops.length - 1 ? 'border-b-[0.5px] border-line' : ''}`}>
                      <View><Text className="text-[11.5px] font-medium text-ink">{stop.name}</Text><Text className="mt-1 text-[8.5px] text-muted">{stop.hint}</Text></View>
                      <Text className={`text-[10px] font-medium ${index === 0 ? 'text-brand' : 'text-ink'}`}>{stop.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>


          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
