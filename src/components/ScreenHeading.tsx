import { Text, View } from 'react-native';

export function ScreenHeading({ title, copy }: { title: string; copy: string }) {
  return (
    <View className="pb-[5px] pt-[13px]">
      <Text className="text-[31px] font-light tracking-[-1px] text-ink">{title}</Text>
      <Text className="mt-2 max-w-[325px] text-[11px] leading-[17px] text-muted">{copy}</Text>
    </View>
  );
}
