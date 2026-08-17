import Ionicons from '@expo/vector-icons/Ionicons';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated as NativeAnimated, Image, PanResponder, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { tabs } from '../data';
import { colors } from '../theme';
import type { ModalId, TabId } from '../types';
import { BayraChatPage } from './BayraChatPage';

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
  sosActive: boolean;
  onTab: (tab: TabId) => void;
  onAiNavigate: (id: ModalId) => void;
};

export function BottomNav({ activeTab, bottomInset, sosActive, onTab, onAiNavigate }: BottomNavProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [barWidth, setBarWidth] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantDrawerActive, setAssistantDrawerActive] = useState(false);
  const selectionX = useSharedValue(4);
  const stretch = useSharedValue(1);
  const tabWidth = barWidth / tabs.length;
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const prevIndexRef = useRef(activeIndex);
  const assistantDragX = useRef(new NativeAnimated.Value(0)).current;
  const assistantTravel = screenWidth;
  const openAssistant = useCallback(() => {
    setAssistantDrawerActive(true);
    NativeAnimated.timing(assistantDragX, { toValue: -assistantTravel, duration: 220, useNativeDriver: true }).start(() => setAssistantOpen(true));
  }, [assistantDragX, assistantTravel]);
  const closeAssistant = useCallback(() => {
    NativeAnimated.timing(assistantDragX, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setAssistantOpen(false);
      setAssistantDrawerActive(false);
    });
  }, [assistantDragX]);
  const assistantPanResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onMoveShouldSetPanResponderCapture: (_, gesture) => Math.abs(gesture.dx) > 5 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: () => setAssistantDrawerActive(true),
    onPanResponderMove: (_, gesture) => assistantDragX.setValue(Math.min(0, Math.max(-assistantTravel, gesture.dx))),
    onPanResponderRelease: (_, gesture) => {
      const shouldOpen = gesture.dx < -72 || gesture.vx < -0.55;
      if (shouldOpen) {
        NativeAnimated.timing(assistantDragX, { toValue: -assistantTravel, duration: 170, useNativeDriver: true }).start(() => setAssistantOpen(true));
        return;
      }
      NativeAnimated.spring(assistantDragX, { toValue: 0, damping: 15, stiffness: 190, mass: 0.65, useNativeDriver: true }).start(() => setAssistantDrawerActive(false));
    },
    onPanResponderTerminate: () => {
      NativeAnimated.spring(assistantDragX, { toValue: 0, damping: 15, stiffness: 190, mass: 0.65, useNativeDriver: true }).start(() => setAssistantDrawerActive(false));
    },
  }), [assistantDragX, assistantTravel]);

  const assistantDrawerTranslateX = assistantDragX.interpolate({
    inputRange: [-assistantTravel, 0],
    outputRange: [0, screenWidth],
    extrapolate: 'clamp',
  });
  const assistantHandleTranslateX = assistantDragX.interpolate({
    inputRange: [-assistantTravel, 0],
    outputRange: [-screenWidth, 0],
    extrapolate: 'clamp',
  });

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
      className="absolute inset-0 justify-end px-6 pt-2"
      style={{ paddingBottom: Math.max(bottomInset - 12, 10) }}
    >
      {assistantDrawerActive ? <StatusBar style="dark" /> : null}
      <NativeAnimated.View
        pointerEvents={assistantOpen ? 'auto' : 'none'}
        className="absolute overflow-hidden bg-[#FCFBF8]"
        style={[
          styles.chatDrawer,
          {
            bottom: 0,
            right: 0,
            width: screenWidth,
            height: screenHeight,
            transform: [{ translateX: assistantDrawerTranslateX }],
          },
        ]}
      >
        <BayraChatPage onClose={closeAssistant} onNavigate={onAiNavigate} />
      </NativeAnimated.View>

      {!assistantOpen ? (
        <NativeAnimated.View
          {...assistantPanResponder.panHandlers}
          style={[styles.assistantPosition, { bottom: Math.max(bottomInset - 12, 10) + 72, transform: [{ translateX: assistantHandleTranslateX }] }]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bayraktar Asistanı aç"
            accessibilityHint="Dokunun veya sola çekin"
            onPress={openAssistant}
            className="h-12 w-[68px] items-center justify-center rounded-l-[22px] border-y border-l border-white/70 bg-brand active:opacity-70"
            style={styles.assistantButton}
          >
            <Image source={require('../../assets/chatbot-icon.png')} resizeMode="contain" style={{ width: 35, height: 35, tintColor: colors.white }} />
            <Ionicons name="chevron-back" size={12} color="rgba(255,255,255,0.7)" style={styles.assistantGrip} />
          </Pressable>
        </NativeAnimated.View>
      ) : null}
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
            const sosAlert = tab.id === 'isg' && sosActive;
            const icons = navIcons[tab.id];
            const color = sosAlert ? '#D92D20' : active ? SELECTED_COLOR : IDLE_COLOR;

            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={sosAlert ? 'SOS aktif' : tab.label}
                onPress={() => onTab(tab.id)}
                className="h-full flex-1 items-center justify-center active:opacity-60"
              >
                <TabIcon name={active ? icons.selected : icons.default} size={tab.featured ? 24 : 22} color={color} active={active} alertActive={sosAlert}>
                  {tab.featured ? (
                    <Text className="absolute text-[12px] font-semibold leading-[14px]" style={{ color: sosAlert ? colors.white : color }}>
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
  alertActive: boolean;
  children?: React.ReactNode;
};

function TabIcon({ name, size, color, active, alertActive, children }: TabIconProps) {
  const scale = useSharedValue(1);
  const alertPulse = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    scale.value = withSequence(
      withTiming(1.2, { duration: 110, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 9, stiffness: 210, mass: 0.5 })
    );
  }, [active, scale]);

  useEffect(() => {
    cancelAnimation(alertPulse);
    if (alertActive) {
      alertPulse.value = 0;
      alertPulse.value = withRepeat(
        withTiming(1, { duration: 1250, easing: Easing.out(Easing.cubic) }),
        -1,
        false
      );
    } else {
      alertPulse.value = withTiming(0, { duration: 180 });
    }
  }, [alertActive, alertPulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const alertRingStyle = useAnimatedStyle(() => ({
    opacity: alertActive ? 0.42 * (1 - alertPulse.value) : 0,
    transform: [{ scale: 0.82 + alertPulse.value * 0.82 }],
  }));

  const alertIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: alertActive ? 1 + Math.sin(alertPulse.value * Math.PI) * 0.08 : 1 }],
  }));

  return (
    <Animated.View className="relative items-center justify-center" style={style}>
      {alertActive ? <Animated.View pointerEvents="none" style={[styles.sosPulseRing, alertRingStyle]} /> : null}
      <Animated.View className="relative items-center justify-center" style={[alertActive ? styles.sosActiveIcon : undefined, alertIconStyle]}>
        <Ionicons name={name} size={alertActive ? 19 : size} color={alertActive ? colors.white : color} />
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sosPulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D92D20',
  },
  sosActiveIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D92D20',
    shadowColor: '#D92D20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 4,
  },
  assistantPosition: {
    position: 'absolute',
    zIndex: 10,
    right: 0,
    width: 68,
    height: 48,
  },
  assistantButton: {
    paddingRight: 8,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 13,
    elevation: 8,
  },
  assistantGrip: {
    position: 'absolute',
    right: 9,
  },
  chatDrawer: {
    zIndex: 8,
    shadowColor: '#171717',
    shadowOffset: { width: -5, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12,
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
