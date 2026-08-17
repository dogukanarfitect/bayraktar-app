import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Text, View } from 'react-native';
import { colors } from '../theme';
import { trUpper } from '../turkishText';

const ASSISTANT_NAME = 'BAYRA';

export function BayraThinkingIndicator() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.35))).current;

  useEffect(() => {
    const loops = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(dot, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.35,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay((2 - index) * 150),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [dots]);

  return (
    <View className="max-w-[92%]">
      <View className="mb-2 flex-row items-center gap-2">
        <Image
          source={require('../../assets/chatbot-icon.png')}
          resizeMode="contain"
          style={{ width: 18, height: 18, tintColor: colors.brand }}
        />
        <Text className="text-[8.5px] font-semibold tracking-[0.35px] text-brand">{trUpper(ASSISTANT_NAME)}</Text>
      </View>
      <View className="flex-row items-center gap-[5px] py-1">
        {dots.map((dot, index) => (
          <Animated.View
            key={index}
            className="h-[7px] w-[7px] rounded-full bg-brand"
            style={{ opacity: dot, transform: [{ scale: dot }] }}
          />
        ))}
      </View>
    </View>
  );
}
