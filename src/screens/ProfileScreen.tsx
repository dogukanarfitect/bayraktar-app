import type { ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Icon, NativeLinearGradient, ScreenScrollView, SectionTitle, StripedBackground } from '../components';
import { colors } from '../theme';
import type { IconName, ModalId } from '../types';

const profileTools: { id: ModalId; title: string; desc: string; icon: IconName; accent: string }[] = [
  { id: 'payroll', title: 'Bordro ve Özlük', desc: 'Bordro, izin ve özlük belgeleri', icon: 'payroll', accent: '#9F2F4D' },
  { id: 'notifications', title: 'Bildirimler', desc: 'Hatırlatma ve kişisel aksiyonlar', icon: 'bell', accent: '#416B83' },
];

const profileDetails = [
  { label: 'Organizasyon', value: 'Bayraktar Holding / Üretim', detail: 'Tesis 2 · Hat 2' },
  { label: 'Pozisyon', value: 'Üretim Operatörü', detail: 'Kadrolu' },
  { label: 'Bağlı yönetici', value: 'Ahmet Demir', detail: 'Üretim Şefi' },
  { label: 'İşe giriş', value: '12 Mart 2018', detail: '8 yıl kıdem' },
] as const;

export function ProfileScreen({ header, onOpen, onLogout }: { header: ReactNode; onOpen: (id: ModalId) => void; onLogout: () => void }) {
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
        className="-mx-5 overflow-hidden rounded-b-[34px] px-5 pb-6"
      >
        <StripedBackground />
        {header}
        <View className="flex-row items-center gap-4 pt-5">
          <Image source={require('../../assets/profile-photo.jpg')} className="h-[78px] w-[78px] rounded-full border border-white/35" />
          <View className="flex-1">
            <Text className="text-[24px] font-light text-white">Mehmet Yılmaz</Text>
            <Text className="mt-[5px] text-[11px] text-white/70">Üretim Operatörü · Hat 2</Text>
            <View className="mt-[10px] flex-row flex-wrap gap-[10px]"><Text className="text-[10px] text-white/70">BYK-2482</Text><Text className="text-[10px] text-white/70">Tesis 2</Text><Text className="text-[10px] text-white/70">A vardiyası</Text></View>
          </View>
        </View>
      </NativeLinearGradient>

      <View className="-mx-5 flex-1 bg-soft px-5 pb-[124px]">
        <SectionTitle>Kişisel Bilgiler</SectionTitle>
        <View className="overflow-hidden rounded-[20px] border-[0.5px] border-line bg-white">
          {profileDetails.map((item, index) => <ProfileDetailRow key={item.label} {...item} last={index === profileDetails.length - 1} />)}
        </View>

        <SectionTitle>Diğer İşlemler</SectionTitle>
        <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
          {profileTools.map((item) => <ProfileActionRow key={item.id} {...item} onPress={() => onOpen(item.id)} />)}
          <ProfileActionRow icon="logout" title="Çıkış Yap" desc="Bu cihazdaki oturumu güvenle kapatın" accent="#C9251B" onPress={onLogout} last />
        </View>
      </View>
    </ScreenScrollView>
  );
}

function ProfileDetailRow({ label, value, detail, last = false }: { label: string; value: string; detail: string; last?: boolean }) {
  return (
    <View className={`min-h-[66px] flex-row items-center justify-between gap-5 px-4 ${last ? '' : 'border-b-[0.5px] border-line'}`}>
      <Text className="text-[8px] font-medium uppercase tracking-[0.55px] text-muted">{label}</Text>
      <View className="flex-1 items-end"><Text className="text-right text-[10.5px] font-medium text-ink">{value}</Text><Text className="mt-1 text-right text-[8px] text-muted">{detail}</Text></View>
    </View>
  );
}

function ProfileActionRow({ icon, title, desc, accent, onPress, last = false }: { icon: IconName; title: string; desc: string; accent: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} className={`relative min-h-[76px] flex-row items-center gap-3 px-4 active:bg-[#F7F5F1] ${last ? '' : 'border-b-[0.5px] border-line'}`}>
      <View className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full" style={{ backgroundColor: accent }} />
      <View className="h-9 w-9 items-center justify-center rounded-full border-[0.5px]" style={{ borderColor: `${accent}35`, backgroundColor: `${accent}0D` }}><Icon name={icon} size={17} color={accent} /></View>
      <View className="flex-1 py-3"><Text className="text-[11px] font-medium text-ink">{title}</Text><Text className="mt-1.5 text-[8.5px] text-muted">{desc}</Text></View>
      <Icon name="chevronRight" size={16} color={colors.muted} />
    </Pressable>
  );
}
