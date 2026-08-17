import type { ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { NativeLinearGradient, ScreenScrollView, SectionTitle, StripedBackground } from '../components';
import { recognitionMembers } from '../data';
import { colors } from '../theme';
import type { ModalId } from '../types';

export function RecognitionScreen({ header, sentCount, onOpen }: { header: ReactNode; sentCount: number; onOpen: (id: ModalId) => void }) {
  return (
    <ScreenScrollView
      className="bg-soft"
      contentContainerClassName="px-5"
      contentInsetAdjustmentBehavior="never"
      bounces={false}
      overScrollMode="never"
    >
      <NativeLinearGradient
        colors={['#AD4565', '#A1264B', '#78152F']}
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="-mx-5 overflow-hidden rounded-b-[34px] px-5 pb-[88px]"
      >
        <StripedBackground />
        {header}
        <Text className="mt-5 text-[29px] font-light text-white">Takdir Merkezi</Text>
        <Text className="mt-2 text-[11px] text-white/70">Takdir, katkı ve takım motivasyonuna hafif bir bakış.</Text>
        <View className="mt-[25px] flex-row justify-around"><Stat value="1,2b" label="puan" /><Stat value={String(sentCount)} label="gönderilen" /><Stat value="+185" label="bu ay" /></View>
      </NativeLinearGradient>

      <View className="-mx-5 flex-1 bg-soft px-5 pb-[124px]">
        <View className="-mt-[62px] rounded-[21px] bg-white p-[19px] shadow-xl">
          <Text className="text-[16px] font-medium text-ink">Etki Puanınız</Text>
          <Text className="mt-[5px] text-[10.5px] text-muted">Takım takdiri, güvenlik katkısı ve aylık rozetler.</Text>
          <View className="mt-5 flex-row items-center justify-between">
            <View><Text className="text-[40px] font-extralight text-ink">1.240</Text><Text className="mt-[5px] text-[10.5px] text-muted">Toplam puan</Text></View>
            <View className="h-[83px] w-[83px] items-center justify-center rounded-full border-[9px] border-success border-r-[#E8E8E3]"><View className="h-[59px] w-[59px] items-center justify-center rounded-full bg-white"><Text className="text-[11px] text-ink">%78</Text></View></View>
          </View>
          <Pressable onPress={() => onOpen('send')} className="mt-[19px] h-12 items-center justify-center rounded-[14px] border border-[#D9A9B6] active:opacity-60"><Text className="text-[13px] text-brand">Takdir Gönder</Text></Pressable>
        </View>

        <SectionTitle>Liderlik Tablosu</SectionTitle>
        <View className="overflow-hidden rounded-[20px] border-[0.5px] border-line bg-white shadow-lg">
          {recognitionMembers.map((member, index) => (
            <View key={member.name} className={`min-h-[70px] flex-row items-center gap-[11px] border-line px-[14px] ${index === recognitionMembers.length - 1 ? 'border-b-0' : 'border-b-[0.5px]'}`}>
              <Text className="w-[15px] text-center text-[14px] text-brand">{index + 1}</Text>
              <Image source={member.photo} className="h-10 w-10 rounded-full" />
              <View className="flex-1"><Text className="text-[12.5px] font-medium text-ink">{member.name}</Text><Text className="mt-1 text-[9.5px] text-muted">{member.team} · {member.hint}</Text></View>
              <Text className="text-[12px] font-semibold text-brand">{member.points}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View className="items-center"><Text className="text-[20px] font-light text-white">{value}</Text><Text className="mt-1 text-[9px] text-white/60">{label}</Text></View>;
}
