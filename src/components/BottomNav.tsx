import Ionicons from '@expo/vector-icons/Ionicons';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { tabs } from '../data';
import { colors } from '../theme';
import type { TabId } from '../types';

const navIcons: Record<
  TabId,
  { default: React.ComponentProps<typeof Ionicons>['name']; selected: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  home: { default: 'home-outline', selected: 'home' },
  news: { default: 'document-text-outline', selected: 'document-text' },
  isg: { default: 'shield-outline', selected: 'shield' },
  recognition: { default: 'star-outline', selected: 'star' },
  profile: { default: 'person-outline', selected: 'person' },
};

const SELECTED_COLOR = colors.brand;
const IDLE_COLOR = '#8E8E93';

const hasNativeLiquidGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable();

type BottomNavProps = {
  activeTab: TabId;
  bottomInset: number;
  onTab: (tab: TabId) => void;
  onOpenAi: () => void;
};

export function BottomNav({ activeTab, bottomInset, onTab, onOpenAi }: BottomNavProps) {
  const [barWidth, setBarWidth] = useState(0);
  const selectionX = useSharedValue(4);
  const stretch = useSharedValue(1);
  const tabWidth = barWidth / tabs.length;
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const prevIndexRef = useRef(activeIndex);

  useEffect(() => {
    if (tabWidth === 0) return;
    const distance = Math.abs(activeIndex - prevIndexRef.current);
    prevIndexRef.current = activeIndex;

    // Liquid glass "morph": the lens briefly stretches wider in the
    // direction of travel, then a spring pulls it back into shape as
    // it settles on the new tab, mimicking the native glass distortion.
    const stretchAmount = 1 + Math.min(distance, 3) * 0.18;
    stretch.value = withSequence(
      withTiming(stretchAmount, { duration: 140, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 11, stiffness: 170, mass: 0.6 })
    );
    selectionX.value = withSpring(activeIndex * tabWidth + 4, {
      damping: 16,
      stiffness: 170,
      mass: 0.75,
    });
  }, [activeIndex, selectionX, stretch, tabWidth]);

  const selectionStyle = useAnimatedStyle(() => ({
    width: Math.max(tabWidth - 8, 0),
    transform: [{ translateX: selectionX.value }, { scaleX: stretch.value }],
  }));

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 px-6 pt-2"
      style={{ paddingBottom: Math.max(bottomInset - 12, 10) }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bayraktar Asistanı aç"
        onPress={onOpenAi}
        className="absolute z-10 h-12 w-12 items-center justify-center rounded-full border-[0.5px] border-line bg-white active:opacity-70"
        style={styles.assistantButton}
      >
        <Image
          source={require('../../assets/chatbot-icon.png')}
          resizeMode="contain"
          style={{ width: 34, height: 34, tintColor: colors.brand }}
        />
      </Pressable>
      <View
        className="h-[64px] rounded-[24px]"
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={styles.barShadow}
      >
        {hasNativeLiquidGlass ? (
          <GlassView
            colorScheme="light"
            glassEffectStyle="regular"
            isInteractive
            style={styles.glassSurface}
          />
        ) : (
          <View style={styles.fallbackSurface} />
        )}

        {barWidth > 0 ? (
          <Animated.View pointerEvents="none" style={[styles.selectionLens, selectionStyle]}>
            {hasNativeLiquidGlass ? (
              <GlassView colorScheme="light" glassEffectStyle="clear" style={styles.selectionGlass} />
            ) : (
              <View style={styles.selectionFallback} />
            )}
          </Animated.View>
        ) : null}

        <View className="h-full flex-row items-center px-1">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            const icons = navIcons[tab.id];
            const color = active ? SELECTED_COLOR : IDLE_COLOR;

            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={tab.label}
                onPress={() => onTab(tab.id)}
                className="h-full flex-1 items-center justify-center active:opacity-60"
              >
                <TabIcon name={active ? icons.selected : icons.default} size={tab.featured ? 24 : 22} color={color} active={active}>
                  {tab.featured ? (
                    <Text className="absolute text-[12px] font-semibold leading-[14px]" style={{ color }}>
                      !
                    </Text>
                  ) : null}
                </TabIcon>
                <Text
                  className="mt-1 text-[10px]"
                  style={{ color, fontWeight: active ? '600' : '500' }}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

type TabIconProps = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size: number;
  color: string;
  active: boolean;
  children?: React.ReactNode;
};

function TabIcon({ name, size, color, active, children }: TabIconProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!active) return;
    scale.value = withSequence(
      withTiming(1.2, { duration: 110, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 9, stiffness: 210, mass: 0.5 })
    );
  }, [active, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View className="relative items-center justify-center" style={style}>
      <Ionicons name={name} size={size} color={color} />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  assistantButton: {
    right: 28,
    top: -52,
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  barShadow: {
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  glassSurface: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 28,
  },
  fallbackSurface: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  selectionLens: {
    position: 'absolute',
    top: 5,
    left: 0,
    height: 54,
    borderRadius: 19,
    overflow: 'hidden',
  },
  selectionGlass: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 19,
  },
  selectionFallback: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
});
