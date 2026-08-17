import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export function SectionTitle({ children, pill, divided = false }: { children: ReactNode; pill?: string; divided?: boolean }) {
  return (
    <View className={`mt-[27px] flex-row items-center justify-between ${divided ? 'mb-0 border-b-[0.5px] border-line pb-3' : 'mb-3'}`}>
      <Text className="text-[16px] font-medium tracking-[-0.2px] text-ink">{children}</Text>
      {pill ? <Text className="overflow-hidden rounded-full bg-[#F7EDEF] px-[9px] py-[5px] text-[10px] text-brand">{pill}</Text> : null}
    </View>
  );
}
