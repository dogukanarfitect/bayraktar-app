import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Platform, Pressable, Text, Vibration, View } from 'react-native';
import { Icon, ScreenScrollView } from '../components';
import { colors } from '../theme';
import type { IconName, ModalId } from '../types';

type SafetyScreenProps = {
  header: ReactNode;
  active: boolean;
  onToggle: () => void;
  onOpen: (id: ModalId) => void;
};

const tools: { id: ModalId; label: string; desc: string; meta: string; icon: IconName; accent: string; surface: string }[] = [
  { id: 'emergencyPhones', label: 'Acil Telefonlar', desc: '112 ve tesis dahili hatları', meta: 'ACİL', icon: 'phone', accent: '#C9251B', surface: '#FDEDEC' },
  { id: 'riskReport', label: 'Risk veya Olay Bildir', desc: 'Sahadaki uygunsuzluğu İSG’ye iletin', meta: 'FORM', icon: 'warning', accent: '#A85A12', surface: '#FFF3E7' },
  { id: 'safetyTraining', label: 'İSG Eğitimleri', desc: 'Atanmış eğitimleri görüntüleyin', meta: '3 MODÜL', icon: 'education', accent: '#416B83', surface: '#ECF2F5' },
  { id: 'safetyDocs', label: 'Prosedür ve Talimatlar', desc: 'Güncel saha dokümanlarına ulaşın', meta: '4 BELGE', icon: 'procedure', accent: '#168068', surface: '#EAF5F1' },
];

export function SafetyScreen({ header, active, onToggle, onOpen }: SafetyScreenProps) {
  const [holding, setHolding] = useState(false);
  const pressProgress = useRef(new Animated.Value(0)).current;
  const radarOne = useRef(new Animated.Value(0)).current;
  const radarTwo = useRef(new Animated.Value(0)).current;
  const longPressCompleted = useRef(false);
  const buttonScale = pressProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.91] });
  const haloScale = pressProgress.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.12] });
  const haloOpacity = pressProgress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.4, 0] });
  const radarOneScale = radarOne.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1.4] });
  const radarTwoScale = radarTwo.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1.4] });
  const radarOneOpacity = radarOne.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, 0.48, 0] });
  const radarTwoOpacity = radarTwo.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, 0.48, 0] });
  const statusRows = active
    ? [['Konum', 'Canlı paylaşım açık'], ['Bildirim', 'İSG ekibine iletildi'], ['İletişim', 'Güvenlik kanalı aktif']]
    : [['Konum', 'Paylaşım beklemede'], ['Bildirim', 'İSG ve güvenlik hazır'], ['İletişim', 'Acil arama erişilebilir']];

  useEffect(() => {
    if (!active) {
      radarOne.stopAnimation();
      radarTwo.stopAnimation();
      radarOne.setValue(0);
      radarTwo.setValue(0);
      return;
    }

    const createRadarPulse = (value: Animated.Value, delay: number) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    const firstPulse = createRadarPulse(radarOne, 0);
    const secondPulse = createRadarPulse(radarTwo, 900);
    firstPulse.start();
    secondPulse.start();

    return () => {
      firstPulse.stop();
      secondPulse.stop();
    };
  }, [active, radarOne, radarTwo]);

  const handlePressIn = () => {
    longPressCompleted.current = false;
    if (Platform.OS === 'android') Vibration.vibrate(24);
    setHolding(true);
    pressProgress.stopAnimation();
    Animated.timing(pressProgress, {
      toValue: 1,
      duration: 900,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!longPressCompleted.current && Platform.OS === 'android') Vibration.vibrate([0, 18, 32, 18]);
    setHolding(false);
    pressProgress.stopAnimation();
    Animated.timing(pressProgress, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handleLongPress = () => {
    longPressCompleted.current = true;
    if (Platform.OS === 'android') Vibration.vibrate([0, 70, 55, 120]);
    else Vibration.vibrate();
    onToggle();
  };

  return (
    <ScreenScrollView className="bg-soft">
      {header}
      <View className="pb-[124px] pt-[18px]">
        <View>
          <Text className="text-[9px] uppercase tracking-[1.2px] text-muted">Acil Durum ve İSG</Text>
          <Text className="mt-[7px] text-[29px] font-light tracking-[-0.6px] text-ink">SOS Merkezi</Text>
          <Text className="mt-2 text-[11px] leading-[16px] text-muted">Acil durumda ekiplere hızlıca haber verin.</Text>
        </View>

        <View className="items-center pb-7 pt-8">
          <View className={`h-[242px] w-[242px] items-center justify-center rounded-full border ${active ? 'border-[#A8D4C8] bg-[#E5F3EF]' : 'border-[#F0B8B3] bg-[#FCECEB]'}`}>
            {active ? (
              <>
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    width: 224,
                    height: 224,
                    borderRadius: 112,
                    borderWidth: 3,
                    borderColor: '#168068',
                    opacity: radarOneOpacity,
                    transform: [{ scale: radarOneScale }],
                  }}
                />
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    width: 224,
                    height: 224,
                    borderRadius: 112,
                    borderWidth: 2,
                    borderColor: '#45A58D',
                    opacity: radarTwoOpacity,
                    transform: [{ scale: radarTwoScale }],
                  }}
                />
              </>
            ) : null}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                width: 218,
                height: 218,
                borderRadius: 109,
                borderWidth: 5,
                borderColor: active ? '#168068' : '#D92D20',
                opacity: haloOpacity,
                transform: [{ scale: haloScale }],
              }}
            />
            <View className={`h-[206px] w-[206px] items-center justify-center rounded-full border-[3px] ${active ? 'border-[#8BC5B6] bg-[#116B58]' : 'border-[#BF2018] bg-[#A81712]'}`}>
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={active ? 'SOS paylaşımını durdur' : 'SOS yardım talebini etkinleştir'}
                  accessibilityHint="İşlemi tamamlamak için bir saniye basılı tutun"
                  accessibilityState={{ selected: active }}
                  delayLongPress={900}
                  onLongPress={handleLongPress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  className={`h-[184px] w-[184px] items-center justify-center overflow-hidden rounded-full border-2 shadow-xl ${active ? 'border-[#58A894] bg-success' : 'border-[#F06A61] bg-[#D92D20]'}`}
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-white/15"><Icon name={active ? 'check' : 'shield'} size={22} color={colors.white} /></View>
                  <Text className="mt-2 text-[43px] font-semibold leading-[47px] tracking-[-1px] text-white">{active ? 'AKTİF' : 'SOS'}</Text>
                  <View className="mt-1 rounded-full bg-black/15 px-3 py-1.5">
                    <Text className="text-[10px] font-semibold tracking-[0.7px] text-white">{holding ? 'BIRAKMA' : 'BASILI TUT'}</Text>
                  </View>
                </Pressable>
              </Animated.View>
            </View>
          </View>
          <Text className={`mt-6 text-[18px] font-medium ${active ? 'text-success' : 'text-ink'}`}>{active ? 'Konumunuz paylaşılıyor' : 'Yardıma mı ihtiyacınız var?'}</Text>
          <Text className="mt-2 max-w-[286px] text-center text-[10.5px] leading-[16px] text-muted">{active ? 'Paylaşımı durdurmak için butona 1 saniye basılı tutun.' : 'Yanlış dokunmaları önlemek için SOS butonuna 1 saniye basılı tutun.'}</Text>
        </View>

        <Text className="mb-3 mt-1 text-[9px] uppercase tracking-[1.1px] text-muted">Durum Bilgileri</Text>
        <View className="overflow-hidden rounded-[20px] border-[0.5px] border-line bg-white">
          {statusRows.map(([label, value], index) => (
            <View key={label} className={`min-h-[52px] flex-row items-center justify-between border-line px-4 ${index === statusRows.length - 1 ? 'border-b-0' : 'border-b-[0.5px]'}`}>
              <Text className="text-[10.5px] text-muted">{label}</Text>
              <View className="flex-row items-center gap-2">
                <View className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-success' : 'bg-[#B8B3AE]'}`} />
                <Text className={`text-[11px] font-medium ${active ? 'text-success' : 'text-[#555]'}`}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mb-3 mt-7 flex-row items-end justify-between">
          <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">İSG araçları</Text>
          <Text className="text-[8.5px] text-muted">Tüm hizmetler</Text>
        </View>
        <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
          {tools.map((tool, index) => (
            <Pressable
              key={tool.id}
              onPress={() => onOpen(tool.id)}
              className={`relative min-h-[78px] flex-row items-center gap-3 px-4 active:bg-[#F7F5F1] ${index === tools.length - 1 ? '' : 'border-b-[0.5px] border-line'}`}
            >
              <View className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full" style={{ backgroundColor: tool.accent }} />
              <View className="h-11 w-11 items-center justify-center rounded-[14px]" style={{ backgroundColor: tool.surface }}>
                <Icon name={tool.icon} size={20} color={tool.accent} />
              </View>
              <View className="flex-1 py-3">
                <Text className="text-[11.5px] font-medium tracking-[-0.1px] text-ink">{tool.label}</Text>
                <Text className="mt-1.5 text-[8.5px] leading-[13px] text-muted">{tool.desc}</Text>
              </View>
              <View className="items-end gap-2">
                <Text className="text-[7.5px] font-semibold tracking-[0.7px]" style={{ color: tool.accent }}>{tool.meta}</Text>
                <Icon name="chevronRight" size={17} color="#AAA5A0" />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenScrollView>
  );
}
