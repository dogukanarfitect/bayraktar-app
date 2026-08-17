import { useState, type ReactNode } from 'react';
import { Alert, Animated, Image, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components';
import { colors } from '../theme';
import { trUpper } from '../turkishText';
import type { IconName } from '../types';

type PageProps = { onClose: () => void };

export const trainingItems = [
  { id: 'risk', title: 'Risk Farkındalığı', type: 'Video eğitim', duration: '12 dk', progress: 80, due: '18 Ağustos' },
  { id: 'ppe', title: 'KKD Kullanımı', type: 'Video eğitim', duration: '8 dk', progress: 100, due: 'Tamamlandı' },
  { id: 'emergency', title: 'Acil Durum İletişimi', type: 'Etkileşimli içerik', duration: '10 dk', progress: 0, due: '22 Ağustos' },
] as const;

export const safetyDocuments = [
  { id: 'emergency', title: 'Acil Durum Prosedürü', category: 'Acil Durum', revision: 'Revizyon 4', meta: 'PDF · 1,8 MB', updated: '12 Ağu 2026' },
  { id: 'evacuation', title: 'Tesis 2 Tahliye Planı', category: 'Tahliye', revision: 'Güncel', meta: 'PDF · 2,1 MB', updated: '10 Ağu 2026' },
  { id: 'incident', title: 'Kaza Bildirim Akışı', category: 'Olay', revision: 'Revizyon 2', meta: 'PDF · 920 KB', updated: '04 Ağu 2026' },
  { id: 'ppe', title: 'Kişisel Koruyucu Donanım Talimatı', category: 'Saha', revision: 'Revizyon 6', meta: 'PDF · 1,2 MB', updated: '01 Ağu 2026' },
] as const;

export const emergencyContacts = [
  { id: 'security', title: 'İşyeri Güvenliği', desc: 'Dahili acil destek', number: '2222', icon: 'shield' as IconName },
  { id: 'clinic', title: 'Tesis Reviri', desc: 'Sağlık birimi', number: '2230', icon: 'medical' as IconName },
  { id: 'gate', title: 'Güvenlik Kapısı', desc: 'Tesis 2 ana giriş', number: '2200', icon: 'building' as IconName },
] as const;

function SafetyPage({ title, onClose, children, footer }: PageProps & { title: string; children: ReactNode; footer?: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#F8F6F2]">
      <StatusBar style="dark" />
      <View className="flex-row items-end border-b-[0.5px] border-line bg-[#FCFBF8] px-5 pb-2" style={{ paddingTop: Math.max(insets.top, 12) }}>
        <View className="h-[52px] flex-1 justify-center">
          <Pressable hitSlop={12} onPress={onClose} className="h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-line bg-white active:opacity-60">
            <Icon name="back" size={25} color={colors.ink} />
          </Pressable>
        </View>
        <View className="h-[52px] items-center justify-center">
          <Text className="text-[16px] font-medium tracking-[-0.2px] text-ink">{title}</Text>
        </View>
        <View className="h-[52px] flex-1" />
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 28, 44) }}>
        {children}
      </ScrollView>
      {footer ? <View className="border-t-[0.5px] border-line bg-[#FCFBF8] px-5 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>{footer}</View> : null}
    </View>
  );
}

function SectionLabel({ children, detail }: { children: ReactNode; detail?: string }) {
  return <View className="mb-3 flex-row items-center justify-between"><Text className="text-[14px] font-medium text-ink">{children}</Text>{detail ? <Text className="text-[9px] text-muted">{detail}</Text> : null}</View>;
}

export function SafetyTrainingPage({ onClose }: PageProps) {
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  const averageProgress = Math.round(trainingItems.reduce((total, item) => total + item.progress, 0) / trainingItems.length);
  const completedCount = trainingItems.filter((item) => item.progress === 100).length;

  return (
    <SafetyPage title="İSG Eğitimleri" onClose={onClose}>
      <View className="px-5 pt-5">
        <View className="rounded-[22px] border-[0.5px] border-line bg-white px-4 py-4">
          <View className="flex-row items-end justify-between"><View><Text className="text-[8px] font-medium tracking-[0.8px] text-muted">{trUpper('Eğitim ilerlemesi')}</Text><Text className="mt-2 text-[13px] font-medium text-ink">Planınız devam ediyor</Text></View><Text className="text-[23px] font-medium text-brand">%{averageProgress}</Text></View>
          <View className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#EDE9E4]"><View className="h-full rounded-full bg-brand" style={{ width: `${averageProgress}%` }} /></View>
          <View className="mt-3 flex-row items-center justify-between"><Text className="text-[8px] text-muted">{completedCount} tamamlandı · {trainingItems.length - completedCount} bekliyor</Text><Text className="text-[8px] text-muted">{trainingItems.length} modül</Text></View>
        </View>

        <View className="mt-6"><SectionLabel detail="3 modül">Eğitim planınız</SectionLabel>
          <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
            {trainingItems.map((item, index) => {
              const complete = item.progress === 100;
              const selected = selectedTraining === item.id;
              const actionLabel = complete ? 'Tamamlandı' : selected ? 'Açıldı' : item.progress > 0 ? 'Devam et' : 'Başla';
              return (
                <Pressable key={item.id} disabled={complete} onPress={() => setSelectedTraining(item.id)} className={`relative min-h-[94px] flex-row items-start gap-3 px-4 py-4 active:bg-[#F7F5F1] ${selected ? 'bg-[#FCF5F7]' : ''} ${index === trainingItems.length - 1 ? '' : 'border-b-[0.5px] border-line'}`}>
                  <View className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full" style={{ backgroundColor: complete ? colors.green : selected ? colors.brand : '#D8D3CD' }} />
                  <Text className="w-5 pt-0.5 text-[8px] font-semibold text-muted">{String(index + 1).padStart(2, '0')}</Text>
                  <View className="flex-1">
                    <Text className="text-[11px] font-medium text-ink">{item.title}</Text>
                    <Text className="mt-1.5 text-[8px] text-muted">{item.type} · {item.duration} · {item.due}</Text>
                    <View className="mt-3 flex-row items-center gap-2"><View className="h-1 flex-1 overflow-hidden rounded-full bg-[#EDE9E4]"><View className="h-full rounded-full" style={{ width: `${item.progress}%`, backgroundColor: complete ? colors.green : colors.brand }} /></View><Text className="w-7 text-right text-[7.5px] font-medium text-muted">%{item.progress}</Text></View>
                  </View>
                  <View className="items-end gap-2"><Text className="text-[8px] font-medium" style={{ color: complete || selected ? colors.green : colors.brand }}>{actionLabel}</Text><Icon name={complete ? 'check' : 'chevronRight'} size={15} color={complete ? colors.green : colors.muted} /></View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafetyPage>
  );
}

export function SafetyDocumentsPage({ onClose }: PageProps) {
  const [filter, setFilter] = useState('Tümü');
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [filterBarWidth, setFilterBarWidth] = useState(0);
  const filterPosition = useState(() => new Animated.Value(0))[0];
  const filters = [
    { label: 'Tümü', value: 'Tümü' },
    { label: 'Acil', value: 'Acil Durum' },
    { label: 'Tahliye', value: 'Tahliye' },
    { label: 'Olay', value: 'Olay' },
    { label: 'Saha', value: 'Saha' },
  ];
  const visibleDocuments = safetyDocuments.filter((document) => filter === 'Tümü' || document.category === filter);
  const categoryColors: Record<string, { accent: string; surface: string }> = {
    'Acil Durum': { accent: '#C9251B', surface: '#FDEDEC' },
    Tahliye: { accent: '#B7791F', surface: '#FFF5DD' },
    Olay: { accent: '#416B83', surface: '#EDF3F6' },
    Saha: { accent: '#168068', surface: '#EAF5F1' },
  };

  const selectFilter = (item: string, index: number) => {
    setFilter(item);
    Animated.spring(filterPosition, { toValue: index, damping: 18, stiffness: 190, mass: 0.8, useNativeDriver: true }).start();
  };

  return (
    <SafetyPage title="İSG Prosedürleri" onClose={onClose}>
      <View className="px-5 pt-5">
        <View onLayout={(event) => setFilterBarWidth(event.nativeEvent.layout.width)} className="relative flex-row rounded-[18px] bg-[#EDE9E3] p-1">
          {filterBarWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              className="absolute bottom-1 top-1 rounded-[14px] bg-white"
              style={{
                left: 4,
                width: (filterBarWidth - 8) / filters.length,
                transform: [{ translateX: filterPosition.interpolate({ inputRange: [0, filters.length - 1], outputRange: [0, ((filterBarWidth - 8) / filters.length) * (filters.length - 1)] }) }],
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 5,
                shadowOffset: { width: 0, height: 2 },
              }}
            />
          ) : null}
          {filters.map((item, index) => {
            const selected = filter === item.value;
            return <Pressable key={item.value} onPress={() => selectFilter(item.value, index)} className="z-10 h-11 flex-1 items-center justify-center rounded-[14px] active:opacity-70"><Text className={`text-[8.5px] font-medium ${selected ? 'text-brand' : 'text-muted'}`}>{item.label}</Text></Pressable>;
          })}
        </View>

        <View className="mt-6"><SectionLabel detail={`${visibleDocuments.length} dosya`}>Güncel prosedürler</SectionLabel></View>
        <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
          {visibleDocuments.map((document) => {
            const isDownloaded = downloaded.includes(document.id);
            const palette = categoryColors[document.category] ?? { accent: colors.brand, surface: '#F7ECEF' };
            return (
              <View key={document.id} className={`relative min-h-[92px] flex-row items-center gap-3 px-4 py-3.5 ${document.id === visibleDocuments[visibleDocuments.length - 1]?.id ? '' : 'border-b-[0.5px] border-line'}`}>
                <View className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full" style={{ backgroundColor: palette.accent }} />
                <View className="h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: palette.surface }}><Icon name="filePdf" size={19} color={palette.accent} /></View>
                <View className="flex-1">
                  <Text className="text-[11px] font-medium leading-[15px] text-ink">{document.title}</Text>
                  <View className="mt-2 flex-row flex-wrap items-center gap-1.5"><Text className="text-[8px] font-medium" style={{ color: palette.accent }}>{document.category}</Text><View className="h-[3px] w-[3px] rounded-full bg-[#C6C0BA]" /><Text className="text-[8px] text-muted">{document.revision}</Text><View className="h-[3px] w-[3px] rounded-full bg-[#C6C0BA]" /><Text className="text-[8px] text-muted">{document.meta}</Text></View>
                  <Text className="mt-1.5 text-[7.5px] text-muted">Güncellendi · {document.updated}</Text>
                </View>
                <Pressable onPress={() => setDownloaded((current) => isDownloaded ? current.filter((id) => id !== document.id) : [...current, document.id])} className={`h-9 flex-row items-center justify-center gap-1.5 rounded-[11px] px-3 active:opacity-60 ${isDownloaded ? 'bg-[#EDF5F2]' : 'bg-[#F7ECEF]'}`}><Icon name={isDownloaded ? 'check' : 'download'} size={14} color={isDownloaded ? colors.green : colors.brand} /><Text className={`text-[8.5px] font-medium ${isDownloaded ? 'text-green' : 'text-brand'}`}>{isDownloaded ? 'Hazır' : 'İndir'}</Text></Pressable>
              </View>
            );
          })}
          {visibleDocuments.length === 0 ? <View className="items-center px-5 py-10"><Text className="text-[11px] font-medium text-ink">Bu kategoride prosedür yok</Text><Text className="mt-1.5 text-[9px] text-muted">Başka bir kategori seçebilirsiniz.</Text></View> : null}
        </View>
      </View>
    </SafetyPage>
  );
}

export function EmergencyPhonesPage({ onClose }: PageProps) {
  const requestCall = (label: string, number: string) => {
    Alert.alert(`${label} aransın mı?`, `${number} numarası için arama ekranı açılacak.`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Ara', style: 'destructive', onPress: () => { void Linking.openURL(`tel:${number}`); } },
    ]);
  };

  return (
    <SafetyPage title="Acil Telefonlar" onClose={onClose}>
      <View className="px-5 pt-5">
        <Pressable onPress={() => requestCall('Acil Çağrı Merkezi', '112')} className="overflow-hidden rounded-[26px] bg-[#C9251B] px-5 py-5 active:opacity-80">
          <View className="flex-row items-center justify-between"><View className="h-12 w-12 items-center justify-center rounded-full bg-white/15"><Icon name="phone" size={23} color={colors.white} /></View><View className="rounded-full bg-white/15 px-3 py-2"><Text className="text-[8.5px] font-semibold text-white">7/24 ACİL</Text></View></View>
          <Text className="mt-6 text-[34px] font-semibold tracking-[-0.7px] text-white">112</Text><Text className="mt-1 text-[13px] font-medium text-white">Acil Çağrı Merkezi</Text><Text className="mt-2 text-[9.5px] leading-[15px] text-white/70">Sağlık, yangın ve hayati tehlike durumları için.</Text>
          <View className="mt-5 h-[46px] flex-row items-center justify-center gap-2 rounded-[15px] bg-white"><Icon name="phone" size={17} color="#C9251B" /><Text className="text-[11px] font-medium text-[#C9251B]">112’yi ara</Text></View>
        </Pressable>

        <View className="mt-6"><SectionLabel detail="Tesis 2">Dahili acil hatlar</SectionLabel><View className="gap-3">{emergencyContacts.map((contact) => <Pressable key={contact.id} onPress={() => requestCall(contact.title, contact.number)} className="min-h-[82px] flex-row items-center gap-3 rounded-[21px] border-[0.5px] border-line bg-white px-4 active:opacity-60"><View className="h-11 w-11 items-center justify-center rounded-[14px] bg-[#EAF5F1]"><Icon name={contact.icon} size={20} color={colors.green} /></View><View className="flex-1"><Text className="text-[11.5px] font-medium text-ink">{contact.title}</Text><Text className="mt-1 text-[8.5px] text-muted">{contact.desc}</Text></View><View className="items-end"><Text className="text-[13px] font-semibold text-green">{contact.number}</Text><Text className="mt-1 text-[8px] text-muted">Aramak için dokun</Text></View></Pressable>)}</View></View>
      </View>
    </SafetyPage>
  );
}

export function RiskReportPage({ onClose }: PageProps) {
  const [category, setCategory] = useState('Risk');
  const [categoryBarWidth, setCategoryBarWidth] = useState(0);
  const categoryPosition = useState(() => new Animated.Value(0))[0];
  const [, setPriority] = useState('Düşük');
  const [priorityBarWidth, setPriorityBarWidth] = useState(0);
  const priorityPosition = useState(() => new Animated.Value(0))[0];
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const categories: { label: string; tabLabel: string; desc: string; icon: IconName }[] = [
    { label: 'Risk', tabLabel: 'Risk', desc: 'Tehlikeli durum', icon: 'shield' },
    { label: 'Ramak kala', tabLabel: 'Ramak', desc: 'Kazaya dönüşmeyen olay', icon: 'info' },
    { label: 'İş kazası', tabLabel: 'Kaza', desc: 'Yaralanma veya hasar', icon: 'medical' },
    { label: 'Çevre', tabLabel: 'Çevre', desc: 'Çevresel uygunsuzluk', icon: 'location' },
  ];
  const priorities = ['Düşük', 'Orta', 'Yüksek'];
  const priorityColors: Record<string, { active: string; inactive: string; label: string; selectedLabel: string }> = {
    Düşük: { active: '#168068', inactive: '#EAF5F1', label: '#168068', selectedLabel: '#FFFFFF' },
    Orta: { active: '#F2C94C', inactive: '#FFF8D9', label: '#171717', selectedLabel: '#FFFFFF' },
    Yüksek: { active: '#C9251B', inactive: '#FDEDEC', label: '#C9251B', selectedLabel: '#FFFFFF' },
  };
  const selectedCategory = categories.find((item) => item.label === category) ?? categories[0];

  const selectCategory = (item: string, index: number) => {
    setCategory(item);
    Animated.spring(categoryPosition, { toValue: index, damping: 18, stiffness: 190, mass: 0.8, useNativeDriver: true }).start();
  };

  const selectPriority = (item: string, index: number) => {
    setPriority(item);
    Animated.spring(priorityPosition, { toValue: index, damping: 18, stiffness: 190, mass: 0.8, useNativeDriver: false }).start();
  };

  const pickPhoto = async () => {
    const nativeImagePicker = requireOptionalNativeModule('ExponentImagePicker');
    if (!nativeImagePicker) {
      Alert.alert('Galeri henüz hazır değil', 'Fotoğraf seçme özelliği yeni uygulama sürümünde etkinleşecek.');
      return;
    }

    try {
      const ImagePicker = await import('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Galeri izni gerekli', 'Bildirim fotoğrafını seçebilmek için fotoğraf arşivi erişimine izin verin.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) setPhotoUri(result.assets[0].uri);
    } catch {
      Alert.alert('Fotoğraf seçilemedi', 'Galeri şu anda açılamadı. Lütfen yeniden deneyin.');
    }
  };

  return (
    <SafetyPage
      title="Risk / Olay Bildir"
      onClose={onClose}
      footer={!submitted ? (
        <Pressable disabled={!note.trim()} onPress={() => setSubmitted(true)} className="h-[50px] items-center justify-center rounded-[17px]" style={{ backgroundColor: note.trim() ? colors.brand : '#EAD9DE' }}><Text className="text-[11px] font-medium" style={{ color: note.trim() ? colors.white : '#8F5D6B' }}>Gönder</Text></Pressable>
      ) : undefined}
    >
      <View className="px-5 pt-5">
        {submitted ? (
          <View className="items-center rounded-[26px] border-[0.5px] border-line bg-white px-5 py-10"><View className="h-16 w-16 items-center justify-center rounded-full bg-[#EAF5F1]"><Icon name="check" size={29} color={colors.green} /></View><Text className="mt-6 text-[21px] font-medium text-ink">Bildiriminiz gönderildi</Text><Text className="mt-3 max-w-[290px] text-center text-[10px] leading-[16px] text-muted">İSG ekibi kaydınızı öncelik seviyesine göre inceleyerek sizinle iletişime geçecek.</Text><View className="mt-6 w-full overflow-hidden rounded-[16px] bg-[#F3F0EC]"><View className="flex-row items-center justify-between px-4 py-3"><Text className="text-[9px] text-muted">Kayıt no</Text><Text className="text-[9px] font-medium text-ink">İSG-170826-14</Text></View>{photoUri ? <View className="flex-row items-center gap-2 border-t-[0.5px] border-line px-4 py-3"><Icon name="check" size={14} color={colors.green} /><Text className="text-[9px] text-muted">Fotoğraf bildirime eklendi</Text></View> : null}</View><Pressable onPress={onClose} className="mt-6 h-[50px] w-full items-center justify-center rounded-[17px] bg-success"><Text className="text-[11px] font-medium text-white">Tamam</Text></Pressable></View>
        ) : (
          <>
            <View className="flex-row items-start gap-3 border-l-[3px] border-[#C9251B] bg-[#FFF8F7] px-4 py-3.5"><Icon name="warning" size={18} color="#C9251B" /><View className="flex-1"><Text className="text-[10.5px] font-medium text-ink">Acil tehlike devam ediyor mu?</Text><Text className="mt-1.5 text-[9px] leading-[14px] text-muted">Önce güvenli alana geçin. Hayati tehlike varsa bu form yerine SOS’u kullanın.</Text></View></View>

            <View className="mt-6 flex-row items-center justify-between"><Text className="text-[9px] font-semibold tracking-[0.9px] text-muted">{trUpper('Bildirim türü')}</Text><Text className="text-[8px] text-muted">Zorunlu alan</Text></View>
            <View onLayout={(event) => setCategoryBarWidth(event.nativeEvent.layout.width)} className="relative mt-3 flex-row rounded-[14px] bg-[#EDE9E3] p-0.5">
              {categoryBarWidth > 0 ? (
                <Animated.View
                  pointerEvents="none"
                  className="absolute bottom-0.5 top-0.5 rounded-[11px] bg-white"
                  style={{
                    left: 2,
                    width: (categoryBarWidth - 4) / categories.length,
                    transform: [{ translateX: categoryPosition.interpolate({ inputRange: [0, categories.length - 1], outputRange: [0, ((categoryBarWidth - 4) / categories.length) * (categories.length - 1)] }) }],
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 5,
                    shadowOffset: { width: 0, height: 2 },
                  }}
                />
              ) : null}
              {categories.map((item, index) => {
                const selected = category === item.label;
                return <Pressable key={item.label} onPress={() => selectCategory(item.label, index)} className="z-10 h-9 flex-1 items-center justify-center rounded-[11px] active:opacity-70"><Text className={`text-[8px] font-medium ${selected ? 'text-brand' : 'text-muted'}`}>{item.tabLabel}</Text></Pressable>;
              })}
            </View>
            <View className="mt-3 flex-row items-center gap-2 px-1"><Icon name={selectedCategory.icon} size={15} color={colors.green} /><Text className="text-[8.5px] text-muted"><Text className="font-medium text-ink">{selectedCategory.label}</Text> · {selectedCategory.desc}</Text></View>

            <Text className="mt-6 text-[9px] font-semibold tracking-[0.9px] text-muted">{trUpper('Öncelik seviyesi')}</Text>
            <View onLayout={(event) => setPriorityBarWidth(event.nativeEvent.layout.width)} className="relative mt-3 flex-row gap-0.5 rounded-[14px] border-[0.5px] border-line bg-white p-0.5">
              <View pointerEvents="none" className="absolute inset-0.5 flex-row gap-0.5">
                {priorities.map((item) => <View key={item} className="flex-1 rounded-[11px]" style={{ backgroundColor: priorityColors[item].inactive }} />)}
              </View>
              {priorityBarWidth > 0 ? (
                <Animated.View
                  pointerEvents="none"
                  className="absolute bottom-0.5 top-0.5 rounded-[11px]"
                  style={{
                    left: 2,
                    width: (priorityBarWidth - 4) / priorities.length,
                    backgroundColor: priorityPosition.interpolate({ inputRange: [0, 1, 2], outputRange: [priorityColors.Düşük.active, priorityColors.Orta.active, priorityColors.Yüksek.active] }),
                    transform: [{ translateX: priorityPosition.interpolate({ inputRange: [0, priorities.length - 1], outputRange: [0, ((priorityBarWidth - 4) / priorities.length) * (priorities.length - 1)] }) }],
                  }}
                />
              ) : null}
              {priorities.map((item, index) => {
                const palette = priorityColors[item];
                return (
                  <Pressable key={item} onPress={() => selectPriority(item, index)} className="z-10 h-9 flex-1 items-center justify-center rounded-[11px]">
                    <Animated.Text
                      className="text-[9px] font-semibold"
                      style={{ color: priorityPosition.interpolate({ inputRange: [0, 1, 2], outputRange: priorities.map((_, positionIndex) => positionIndex === index ? palette.selectedLabel : palette.label) }) }}
                    >
                      {item}
                    </Animated.Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-4 rounded-[20px] border-[0.5px] border-line bg-white p-4"><View className="flex-row items-center justify-between"><Text className="text-[9px] font-semibold tracking-[0.9px] text-muted">{trUpper('Açıklama')}</Text><Text className="text-[8.5px] text-muted">{note.length}/500</Text></View><TextInput value={note} onChangeText={(value) => setNote(value.slice(0, 500))} multiline placeholder="Ne olduğunu, nerede gördüğünüzü ve varsa devam eden riski açıklayın…" placeholderTextColor="#9A9690" textAlignVertical="top" className="mt-3 min-h-[135px] text-[11px] leading-[18px] text-ink" /></View>

            <Text className="mt-5 text-[9px] font-semibold tracking-[0.9px] text-muted">{trUpper('Ek bilgiler')}</Text>
            <View className="mt-3 overflow-hidden rounded-[18px] border-[0.5px] border-line bg-white">
              <View className="min-h-[62px] flex-row items-center gap-3 border-b-[0.5px] border-line px-4"><Icon name="location" size={18} color={colors.green} /><View className="flex-1"><Text className="text-[9px] text-muted">Olay konumu</Text><Text className="mt-1 text-[10.5px] font-medium text-ink">Tesis 2 · Üretim Alanı</Text></View><Text className="text-[8.5px] font-medium text-success">Hazır</Text></View>
              <Pressable onPress={pickPhoto} className="min-h-[70px] flex-row items-center gap-3 px-4 py-2 active:bg-[#F7F5F1]">
                {photoUri ? <Image source={{ uri: photoUri }} className="h-[50px] w-[50px] rounded-[12px] bg-[#EEE9E3]" resizeMode="cover" /> : <View className="h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[#F7ECEF]"><Icon name="plus" size={18} color={colors.brand} /></View>}
                <View className="flex-1"><Text className="text-[10.5px] font-medium text-ink">{photoUri ? 'Fotoğraf eklendi' : 'Albümden fotoğraf seç'}</Text><Text className="mt-1 text-[8.5px] text-muted">{photoUri ? 'Değiştirmek için dokunun.' : 'JPG veya PNG görsel ekleyin.'}</Text></View>
                <Icon name={photoUri ? 'check' : 'chevronRight'} size={17} color={photoUri ? colors.green : colors.muted} />
              </Pressable>
            </View>
          </>
        )}
      </View>
    </SafetyPage>
  );
}
