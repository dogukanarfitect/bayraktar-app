import { useEffect, useRef } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import { StripedBackground } from './StripedBackground';

type SplashScreenProps = {
  onDone: () => void;
  persistent?: boolean;
};

export function SplashScreen({ onDone, persistent }: SplashScreenProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: persistent ? 900 : 1650, useNativeDriver: false }).start();
    if (persistent) return;
    const timer = setTimeout(() => Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(onDone), 1750);
    return () => clearTimeout(timer);
  }, [onDone, opacity, persistent, progress]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View className="absolute inset-0 z-50 items-center justify-center bg-brand" style={{ opacity }}>
      <StripedBackground />
      <Image source={require('../../assets/logo-bayraktar.png')} className="h-[154px] w-[154px]" resizeMode="contain" />
      <Text className="mt-2 text-[16px] font-medium text-white">Bayraktar Mobil Portal</Text>
      <View className="mt-6 h-[3px] w-[130px] overflow-hidden rounded-sm bg-white/25"><Animated.View className="h-full bg-white" style={{ width }} /></View>
    </Animated.View>
  );
}
