import { Modal, Pressable, Text, View } from 'react-native';
import { FALLBACK_UPDATE_MESSAGE, FALLBACK_UPDATE_TITLE } from './constants';
import type { IosUpdatePolicy } from './iosUpdatePolicy';

type OptionalUpdateModalProps = {
  policy: IosUpdatePolicy;
  onUpdate: () => void;
  onLater: () => void;
};

export function OptionalUpdateModal({ policy, onUpdate, onLater }: OptionalUpdateModalProps) {
  const title = policy.title.trim() || FALLBACK_UPDATE_TITLE;
  const message = policy.message.trim() || FALLBACK_UPDATE_MESSAGE;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onLater}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View
          className="w-full rounded-[24px] bg-white px-[22px] pb-[22px] pt-[24px]"
          style={{
            shadowColor: '#2A1D20',
            shadowOffset: { width: 0, height: 18 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <Text className="text-[22px] font-normal tracking-[-0.4px] text-ink">{title}</Text>
          <Text className="mt-3 text-[13px] leading-[20px] text-muted">{message}</Text>

          <Pressable
            testID="optional-update-button"
            onPress={onUpdate}
            className="mt-6 h-[50px] items-center justify-center rounded-[15px] bg-brand active:opacity-70"
          >
            <Text className="text-[14px] font-medium text-white">Güncelle</Text>
          </Pressable>

          <Pressable
            testID="optional-update-later"
            onPress={onLater}
            className="mt-3 h-[47px] items-center justify-center rounded-[15px] border border-[#E7B9C5] bg-white active:bg-[#FAF3F5]"
          >
            <Text className="text-[14px] font-medium text-brand">Daha sonra</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
