import { Image, Pressable, Text, View } from 'react-native';
import { Icon, NativeLinearGradient, ScreenScrollView, SectionTitle, StripedBackground } from '../components';
import { employeeServices, newsItems, quickActions } from '../data';
import { colors } from '../theme';
import type { IconName, ModalId, NewsItem } from '../types';

const actionPresentation: Partial<Record<ModalId, { accent: string }>> = {
  hrChat: { accent: '#9F2F4D' },
  foodMenu: { accent: '#B7791F' },
  serviceRoutes: { accent: '#416B83' },
  survey: { accent: '#168068' },
  employeeInfo: { accent: '#9F2F4D' },
  calendar: { accent: '#7A5A9A' },
  doctorSchedule: { accent: '#168068' },
  documents: { accent: '#416B83' },
  payroll: { accent: '#9F2F4D' },
  feedbackForm: { accent: '#B7791F' },
};

type HomeScreenProps = {
  topInset: number;
  notifCount: number;
  onOpen: (id: ModalId) => void;
  onNews: (item: NewsItem) => void;
  onProfile: () => void;
};

export function HomeScreen({ topInset, notifCount, onOpen, onNews, onProfile }: HomeScreenProps) {
  const leadNews = newsItems[0];

  return (
    <ScreenScrollView
      className="bg-[#FCFBF8]"
      contentInsetAdjustmentBehavior="never"
      bounces={false}
      overScrollMode="never"
    >
      <NativeLinearGradient
        colors={['#AD4565', '#A1264B', '#78152F']}
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="-mx-5 overflow-hidden rounded-b-[34px] px-5 pb-5"
        style={{ paddingTop: topInset }}
      >
        <StripedBackground />
        <View className="h-[58px] flex-row items-center justify-between">
          <Pressable hitSlop={12} onPress={onProfile} className="h-[38px] w-[38px] overflow-hidden rounded-full border border-white/35 active:opacity-60">
            <Image source={require('../../assets/profile-photo.jpg')} className="h-full w-full" />
          </Pressable>
          <Image source={require('../../assets/logo-bayraktar.png')} className="h-[46px] w-[84px]" resizeMode="contain" />
          <Pressable hitSlop={12} onPress={() => onOpen('notifications')} className="h-[40px] w-[40px] items-center justify-center rounded-[14px] bg-white/15 active:opacity-60">
            <Icon name="bell" size={20} color={colors.white} />
            {notifCount > 0 ? <View className="absolute -right-1 -top-1 h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-white px-1"><Text className="text-[8px] font-bold text-brand">{notifCount}</Text></View> : null}
          </Pressable>
        </View>

        <Text className="mt-[38px] text-[21px] font-light tracking-[-0.5px] text-white">Hoş geldiniz, Mehmet Bey</Text>
        <Text className="mt-2 max-w-[330px] text-[12px] leading-[19px] text-white/80">Günlük çalışan akışınız, bildirimleriniz ve saha hizmetleri kullanıma hazır.</Text>
        <View className="mt-5 flex-row gap-[9px]">
          <Pressable onPress={() => onNews(leadNews)} className="h-[70px] flex-1 flex-row items-center gap-2 rounded-[17px] bg-white/10 p-[13px] active:opacity-60">
            <View className="flex-1">
              <Text className="text-[9px] text-white/60">{leadNews.category}</Text>
              <Text className="mt-[5px] text-[11px] leading-[15px] text-white" numberOfLines={2}>{leadNews.title}</Text>
            </View>
            <HeroIcon name="news" />
          </Pressable>
          <View className="h-[70px] w-[124px] justify-center rounded-[17px] bg-white/10 px-[13px]">
            <Text className="text-[9px] text-white/60">Tarih</Text>
            <Text className="mt-1.5 text-[15px] text-white" numberOfLines={1} adjustsFontSizeToFit>{new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long' })}</Text>
          </View>
        </View>
        <View className="mt-[11px] flex-row gap-[9px]">
          <Metric label="Servis" value="18:10" onPress={() => onOpen('serviceRoutes')} />
          <Metric label="Yemek" value="12:30" onPress={() => onOpen('foodMenu')} />
        </View>
      </NativeLinearGradient>

      <View className="-mx-5 flex-1 bg-[#FCFBF8] px-5">
        <SectionTitle>Hızlı İşlemler</SectionTitle>
        <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
          {quickActions.map((item, index) => <HomeActionRow key={item.id} {...item} accent={actionPresentation[item.id]?.accent} onPress={() => onOpen(item.id)} last={index === quickActions.length - 1} />)}
        </View>

        <SectionTitle>Çalışan Hizmetleri</SectionTitle>
        <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
          {employeeServices.map((item, index) => <HomeActionRow key={item.id} {...item} accent={actionPresentation[item.id]?.accent} onPress={() => onOpen(item.id)} last={index === employeeServices.length - 1} />)}
        </View>
      </View>
    </ScreenScrollView>
  );
}

function Metric({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="h-[58px] flex-1 flex-row items-center justify-between rounded-[17px] bg-black/10 px-[15px] active:opacity-60">
      <View><Text className="text-[9px] text-white/60">{label}</Text><Text className="mt-1 text-[18px] font-normal text-white">{value}</Text></View>
      <HeroIcon name="arrowUpRight" />
    </Pressable>
  );
}

function HeroIcon({ name }: { name: 'news' | 'arrowUpRight' }) {
  return <View className="h-8 w-8 items-center justify-center rounded-full bg-white/15"><Icon name={name} size={18} color={colors.white} /></View>;
}

function HomeActionRow({ icon, title, desc, accent = colors.brand, onPress, last = false }: { icon: IconName; title: string; desc: string; accent?: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} className={`relative min-h-[76px] flex-row items-center gap-3 px-4 active:bg-[#F7F5F1] ${last ? '' : 'border-b-[0.5px] border-line'}`}>
      <View className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full" style={{ backgroundColor: accent }} />
      <View className="h-9 w-9 items-center justify-center rounded-full border-[0.5px]" style={{ borderColor: `${accent}35`, backgroundColor: `${accent}0D` }}><Icon name={icon} size={17} color={accent} /></View>
      <View className="flex-1 py-3"><Text className="text-[11px] font-medium text-ink">{title}</Text><Text className="mt-1.5 text-[8.5px] leading-[13px] text-muted">{desc}</Text></View>
      <Icon name="chevronRight" size={16} color={colors.muted} />
    </Pressable>
  );
}
