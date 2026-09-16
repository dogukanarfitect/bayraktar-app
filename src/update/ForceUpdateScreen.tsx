import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeLinearGradient, StripedBackground } from '../components';
import { FALLBACK_UPDATE_MESSAGE, FALLBACK_UPDATE_TITLE } from './constants';
import type { IosUpdatePolicy } from './iosUpdatePolicy';

type ForceUpdateScreenProps = {
  policy: IosUpdatePolicy;
  refreshing: boolean;
  onUpdate: () => void;
  onRetry: () => void;
};

export function ForceUpdateScreen({ policy, refreshing, onUpdate, onRetry }: ForceUpdateScreenProps) {
  const insets = useSafeAreaInsets();
  const title = policy.title.trim() || FALLBACK_UPDATE_TITLE;
  const message = policy.message.trim() || FALLBACK_UPDATE_MESSAGE;

  return (
    <View className="absolute inset-0 z-[60] bg-brand" pointerEvents="auto">
      <NativeLinearGradient
        colors={['#B54163', '#9E2E4F', '#731A34']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <StripedBackground />
        <View className="flex-1 justify-center px-6" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}>
          <View className="items-center pb-8">
            <Image source={require('../../assets/logo-bayraktar.png')} className="h-[120px] w-[120px]" resizeMode="contain" />
            <Text className="mt-3 text-[16px] font-medium text-white">Bayraktar Mobil Portal</Text>
          </View>

          <View
            className="rounded-[24px] bg-white px-[22px] pb-[24px] pt-[22px]"
            style={{
              shadowColor: '#2A1D20',
              shadowOffset: { width: 0, height: 18 },
              shadowOpacity: 0.1,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <Text className="text-[24px] font-normal tracking-[-0.4px] text-ink">{title}</Text>
            <Text className="mt-3 text-[13px] leading-[20px] text-muted">{message}</Text>

            <Pressable
              testID="force-update-button"
              onPress={onUpdate}
              className="mt-6 h-[50px] items-center justify-center rounded-[15px] bg-brand active:opacity-70"
            >
              <Text className="text-[14px] font-medium text-white">Güncelle</Text>
            </Pressable>

            <Pressable
              testID="force-update-retry"
              disabled={refreshing}
              onPress={onRetry}
              className={`mt-3 h-[47px] items-center justify-center rounded-[15px] border border-[#E7B9C5] bg-white active:bg-[#FAF3F5] ${refreshing ? 'opacity-35' : ''}`}
            >
              <Text className="text-[14px] font-medium text-brand">{refreshing ? 'Kontrol ediliyor…' : 'Tekrar dene'}</Text>
            </Pressable>
          </View>
        </View>
      </NativeLinearGradient>
    </View>
  );
}
