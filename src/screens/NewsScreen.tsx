import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Icon, NativeLinearGradient, ScreenHeading, ScreenScrollView, SectionTitle } from '../components';
import { newsItems } from '../data';
import { colors } from '../theme';
import type { NewsItem } from '../types';

export function NewsScreen({ header, onNews }: { header: ReactNode; onNews: (item: NewsItem) => void }) {
  const { width } = useWindowDimensions();
  const sliderRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const cardWidth = Math.min(width - 52, 390);
  const slideInterval = cardWidth + 12;

  useEffect(() => {
    const timer = setInterval(() => {
      const nextSlide = (activeSlide + 1) % newsItems.length;
      sliderRef.current?.scrollTo({ x: nextSlide * slideInterval, animated: true });
      setActiveSlide(nextSlide);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeSlide, slideInterval]);

  const handleSlideEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / slideInterval);
    setActiveSlide(Math.max(0, Math.min(index, newsItems.length - 1)));
  };

  return (
    <ScreenScrollView className="bg-soft">
      {header}
      <ScreenHeading title="Haberler" copy="Bayraktar Grup Holding duyuruları, saha gelişmeleri ve çalışan hikayeleri." />

      <ScrollView
        ref={sliderRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={slideInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
        className="-mx-5"
        onMomentumScrollEnd={handleSlideEnd}
      >
        {newsItems.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onNews(item)}
            className="h-[246px] overflow-hidden rounded-[24px] bg-white shadow-lg active:opacity-90"
            style={{ width: cardWidth }}
          >
            <Image source={{ uri: item.image }} className="absolute inset-0 h-full w-full" resizeMode="cover" />
            <NativeLinearGradient
              colors={['rgba(18,18,18,0.03)', 'rgba(18,18,18,0.22)', 'rgba(18,18,18,0.86)']}
              locations={[0, 0.45, 1]}
              className="absolute inset-0"
            />
            <View className="flex-1 justify-between p-[18px]">
              <View className="flex-row items-center justify-end">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-white/20"><Icon name="arrowUpRight" size={18} color={colors.white} /></View>
              </View>
              <View>
                <Text className="max-w-[300px] text-[21px] font-medium leading-[26px] tracking-[-0.35px] text-white" numberOfLines={2}>{item.title}</Text>
                <Text className="mt-2 text-[10.5px] leading-[16px] text-white/75" numberOfLines={2}>{item.summary}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View className="mt-3 flex-row items-center justify-center gap-[6px]">
        {newsItems.map((item, index) => <View key={item.id} className={`h-[4px] rounded-full ${index === activeSlide ? 'w-[22px] bg-brand' : 'w-[4px] bg-[#D8D3CD]'}`} />)}
      </View>

      <SectionTitle>Son Haberler</SectionTitle>
      <View className="overflow-hidden rounded-[24px] border-[0.5px] border-line bg-white">
        {newsItems.slice(1).map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => onNews(item)}
            className={`min-h-[120px] flex-row items-center gap-[14px] border-line p-[13px] active:bg-[#FAF8F5] ${index === newsItems.length - 2 ? 'border-b-0' : 'border-b-[0.5px]'}`}
          >
            <Image source={{ uri: item.image }} className="h-[92px] w-[108px] rounded-[16px]" resizeMode="cover" />
            <View className="flex-1 py-[2px]">
              <NewsMeta item={item} />
              <Text className="mt-[9px] text-[14px] font-medium leading-[18px] tracking-[-0.2px] text-ink" numberOfLines={2}>{item.title}</Text>
              <Text className="mt-[5px] text-[9.5px] leading-[14px] text-muted" numberOfLines={2}>{item.summary}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScreenScrollView>
  );
}

function NewsMeta({ item }: { item: NewsItem }) {
  return <View className="flex-row items-center gap-2"><Text className="text-[8.5px] font-semibold uppercase tracking-[0.7px] text-brand">{item.category}</Text><View className="h-[3px] w-[3px] rounded-full bg-[#C9C4BE]" /><Text className="text-[8.5px] text-muted">{item.date}</Text></View>;
}
