import { useState, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, NativeLinearGradient } from '../components';
import { colors } from '../theme';
import { trUpper } from '../turkishText';

type PageProps = { onClose: () => void };

const calendarEvents = [
  { monthKey: '2026-07', date: '15', month: 'TEM', weekday: 'Çarşamba', time: '10:00', title: 'Yarıyıl değerlendirme buluşması', category: 'Etkinlik', color: '#9F2F4D' },
  { monthKey: '2026-07', date: '22', month: 'TEM', weekday: 'Çarşamba', time: '14:00', title: 'Süreç iyileştirme eğitimi', category: 'Eğitim', color: '#416B83' },
  { monthKey: '2026-08', date: '18', month: 'AĞU', weekday: 'Salı', time: 'Tüm gün', title: 'Aile buluşması kayıt sonu', category: 'Etkinlik', color: '#9F2F4D' },
  { monthKey: '2026-08', date: '24', month: 'AĞU', weekday: 'Pazartesi', time: '14:00', title: 'Kalite eğitimi', category: 'Eğitim', color: '#416B83' },
  { monthKey: '2026-08', date: '30', month: 'AĞU', weekday: 'Pazar', time: 'Tüm gün', title: 'Zafer Bayramı', category: 'Tatil', color: '#168068' },
  { monthKey: '2026-09', date: '03', month: 'EYL', weekday: 'Perşembe', time: '09:30', title: 'İSG saha farkındalık buluşması', category: 'Eğitim', color: '#416B83' },
  { monthKey: '2026-09', date: '21', month: 'EYL', weekday: 'Pazartesi', time: 'Tüm gün', title: 'Çalışan deneyimi günü', category: 'Etkinlik', color: '#9F2F4D' },
] as const;

export const doctorDays = [
  { day: 'Bugün', date: '16 Ağustos', doctor: 'Dr. Ayşe Akın', area: 'İşyeri Hekimi', time: '09:00–16:00', slots: ['09:30', '11:00', '13:30', '15:00'], active: true },
  { day: 'Pazartesi', date: '17 Ağustos', doctor: 'Dr. Ayşe Akın', area: 'İşyeri Hekimi', time: '09:00–16:00', slots: ['10:00', '11:30', '14:00', '15:30'], active: false },
  { day: 'Perşembe', date: '20 Ağustos', doctor: 'Dr. Murat Eren', area: 'İşyeri Hekimi', time: '10:00–17:00', slots: ['10:30', '12:00', '14:30', '16:00'], active: false },
] as const;

export const employeeDocuments = [
  { id: 'handbook', title: 'Çalışan El Kitabı', category: 'İK', meta: 'PDF · 2,4 MB', date: '12 Ağu 2026', badge: 'Güncel' },
  { id: 'leave', title: 'İzin Süreci Rehberi', category: 'İK', meta: 'PDF · 840 KB', date: '10 Ağu 2026', badge: 'Yeni' },
  { id: 'safety', title: 'İSG Temel Prosedürü', category: 'İSG', meta: 'PDF · 1,8 MB', date: '04 Ağu 2026', badge: 'Güncel' },
  { id: 'kvkk', title: 'KVKK Aydınlatma Metni', category: 'KVKK', meta: 'PDF · 520 KB', date: '02 Oca 2026', badge: '2026' },
] as const;

const payrollArchive = [
  { month: 'Haziran 2026', status: 'Bordro arşivi', amount: '•••••• TL' },
  { month: 'Mayıs 2026', status: 'Bordro arşivi', amount: '•••••• TL' },
  { month: 'Nisan 2026', status: 'Bordro arşivi', amount: '•••••• TL' },
] as const;

export const employeePayrollSummary = {
  month: 'Temmuz 2026',
  netAmount: '•••••• TL',
  readyDate: '31 Temmuz 2026',
  leaveBalance: '9 gün',
  seniority: '8 yıl',
} as const;

function ServicePage({ title, onClose, children }: PageProps & { title: string; children: ReactNode }) {
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 28, 44) }}>
        {children}
      </ScrollView>
    </View>
  );
}

function SectionLabel({ title, action }: { title: string; action?: string }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-[14px] font-medium tracking-[-0.15px] text-ink">{title}</Text>
      {action ? <Text className="text-[9px] font-medium text-brand">{action}</Text> : null}
    </View>
  );
}

function EmployeeDetailRow({ label, value, detail, last = false }: { label: string; value: string; detail?: string; last?: boolean }) {
  return (
    <View className={`min-h-[66px] flex-row items-center justify-between gap-5 px-5 ${last ? '' : 'border-b-[0.5px] border-line'}`}>
      <Text className="text-[8.5px] font-medium tracking-[0.55px] text-muted">{trUpper(label)}</Text>
      <View className="flex-1 items-end">
        <Text className="text-right text-[11.5px] font-medium text-ink">{value}</Text>
        {detail ? <Text className="mt-1 text-right text-[8.5px] text-muted">{detail}</Text> : null}
      </View>
    </View>
  );
}

export function EmployeeInfoPage({ onClose }: PageProps) {
  return (
    <ServicePage title="Özlük ve Organizasyon" onClose={onClose}>
      <View className="px-5 pt-5">
        <View className="overflow-hidden rounded-[26px] border-[0.5px] border-line bg-white">
          <View className="h-1 bg-brand" />
          <View className="px-5 pb-5 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[7.5px] font-semibold tracking-[1.2px] text-muted">{trUpper('Çalışan profili')}</Text>
              <View className="flex-row items-center gap-2"><View className="h-2 w-2 rounded-full bg-green" /><Text className="text-[8px] font-medium text-green">Aktif</Text></View>
            </View>

            <Text className="mt-6 text-[25px] font-medium tracking-[-0.5px] text-ink">Mehmet Yılmaz</Text>
            <Text className="mt-2 text-[11px] font-medium text-ink">Üretim Operatörü</Text>
            <Text className="mt-1.5 text-[9px] text-muted">Tesis 2 / Üretim / Hat 2</Text>
          </View>

          <View className="flex-row bg-brand px-3 py-4">
            <ProfileMetric label="SİCİL" value="BYK-2482" />
            <View className="w-[0.5px] bg-white/20" />
            <ProfileMetric label="VARDİYA" value="A · 08:00–18:00" />
            <View className="w-[0.5px] bg-white/20" />
            <ProfileMetric label="KIDEM" value="8 yıl" />
          </View>
        </View>

        <View className="mt-6">
          <View className="mb-3 flex-row items-end justify-between"><Text className="text-[14px] font-medium tracking-[-0.15px] text-ink">Organizasyon ve çalışma</Text><Text className="text-[8px] text-muted">16 Ağustos 2026</Text></View>
          <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
            <EmployeeDetailRow label="Organizasyon yolu" value="Bayraktar Holding / Üretim" detail="Tesis 2 · Hat 2" />
            <EmployeeDetailRow label="Pozisyon" value="Üretim Operatörü" detail="Kadrolu" />
            <EmployeeDetailRow label="Bağlı yönetici" value="Ahmet Demir" detail="Üretim Şefi" />
            <EmployeeDetailRow label="İşe giriş" value="12 Mart 2018" detail="8 yıl kıdem" last />
          </View>
        </View>

      </View>
    </ServicePage>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return <View className="flex-1 items-center px-1"><Text className="text-[7px] font-semibold tracking-[0.8px] text-white/60">{label}</Text><Text className="mt-2 text-center text-[9.5px] font-medium text-white">{value}</Text></View>;
}

export function EmployeeCalendarPage({ onClose }: PageProps) {
  const [monthDate, setMonthDate] = useState(() => new Date(2026, 7, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const rawMonthTitle = monthDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const monthTitle = trUpper(rawMonthTitle.charAt(0)) + rawMonthTitle.slice(1);
  const monthEvents = calendarEvents.filter((event) => event.monthKey === monthKey);
  const visibleEvents = selectedDay === null ? monthEvents : monthEvents.filter((event) => Number(event.date) === selectedDay);
  const eventDays = new Set(monthEvents.map((event) => Number(event.date)));
  const leadingEmptyDays = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells: (number | null)[] = [...Array.from({ length: leadingEmptyDays }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);
  const today = new Date();

  const changeMonth = (offset: number) => {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    setSelectedDay(null);
  };

  return (
    <ServicePage title="Önemli Günler" onClose={onClose}>
      <View className="px-5 pt-5">
        <View className="rounded-[24px] border-[0.5px] border-line bg-white px-4 pb-5 pt-4">
          <View className="flex-row items-center justify-between">
            <Pressable hitSlop={8} onPress={() => changeMonth(-1)} className="h-9 w-9 items-center justify-center rounded-full border-[0.5px] border-line bg-[#FCFBF8] active:opacity-60"><Icon name="back" size={21} color={colors.ink} /></Pressable>
            <View className="items-center"><Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">{monthTitle}</Text><Text className="mt-1 text-[8px] text-muted">{monthEvents.length} önemli gün</Text></View>
            <Pressable hitSlop={8} onPress={() => changeMonth(1)} className="h-9 w-9 items-center justify-center rounded-full border-[0.5px] border-line bg-[#FCFBF8] active:opacity-60"><Icon name="chevronRight" size={21} color={colors.ink} /></Pressable>
          </View>

          <View className="mt-5 flex-row">
            {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'].map((day) => <Text key={day} className="flex-1 text-center text-[7.5px] font-medium text-muted">{day}</Text>)}
          </View>
          <View className="mt-2 flex-row flex-wrap">
            {calendarCells.map((day, index) => {
              const isToday = day !== null && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const hasEvent = day !== null && eventDays.has(day);
              const selected = day !== null && selectedDay === day;
              return (
                <View key={`${monthKey}-${index}`} className="h-10 items-center justify-center" style={{ width: '14.285%' }}>
                  {day !== null ? (
                    <Pressable onPress={() => setSelectedDay((current) => current === day ? null : day)} className={`h-8 w-8 items-center justify-center rounded-[11px] active:opacity-60 ${selected ? 'bg-ink' : isToday ? 'bg-brand' : hasEvent ? 'bg-[#F7ECEF]' : ''}`}>
                      <Text className={`text-[9.5px] font-medium ${selected || isToday ? 'text-white' : hasEvent ? 'text-brand' : 'text-ink'}`}>{day}</Text>
                      {hasEvent && !selected && !isToday ? <View className="absolute bottom-[3px] h-[3px] w-[3px] rounded-full bg-brand" /> : null}
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View className="my-5 flex-row items-center justify-center gap-5">
          {[['Etkinlik', '#9F2F4D'], ['Eğitim', '#416B83'], ['Tatil', '#168068']].map(([label, color]) => <View key={label} className="flex-row items-center gap-1.5"><View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} /><Text className="text-[8px] text-muted">{label}</Text></View>)}
        </View>

        <View className="mb-3 flex-row items-end justify-between">
          <View><Text className="text-[14px] font-medium text-ink">{selectedDay === null ? `${monthTitle} ajandası` : `${selectedDay} ${rawMonthTitle.split(' ')[0]} ajandası`}</Text><Text className="mt-1 text-[8.5px] text-muted">{selectedDay === null ? 'Ay içindeki tüm planlar' : `${visibleEvents.length} plan bulundu`}</Text></View>
          {selectedDay !== null ? <Pressable hitSlop={8} onPress={() => setSelectedDay(null)}><Text className="text-[9px] font-medium text-brand">Tümünü göster</Text></Pressable> : <Text className="text-[8.5px] text-muted">{monthEvents.length} etkinlik</Text>}
        </View>

        {visibleEvents.length > 0 ? (
          <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
            {visibleEvents.map((event, index) => (
              <View key={event.title} className={`relative min-h-[86px] flex-row items-center gap-3 px-4 ${index === visibleEvents.length - 1 ? '' : 'border-b-[0.5px] border-line'}`}>
                <View className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full" style={{ backgroundColor: event.color }} />
                <View className="w-11 items-center"><Text className="text-[21px] font-medium text-ink">{event.date}</Text><Text className="mt-1 text-[7.5px] font-semibold tracking-[0.7px]" style={{ color: event.color }}>{event.month}</Text></View>
                <View className="h-10 w-[0.5px] bg-line" />
                <View className="flex-1 py-3"><View className="flex-row items-center gap-2"><Text className="text-[8px] font-medium" style={{ color: event.color }}>{event.category}</Text><View className="h-[3px] w-[3px] rounded-full bg-[#C8C3BD]" /><Text className="text-[8px] text-muted">{event.weekday}</Text></View><Text className="mt-2 text-[11.5px] font-medium leading-[16px] text-ink">{event.title}</Text><View className="mt-2 flex-row items-center gap-1.5"><Icon name="clock" size={12} color={colors.muted} /><Text className="text-[8.5px] text-muted">{event.time}</Text></View></View>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center rounded-[22px] bg-white px-5 py-10">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F3F0EC]"><Icon name="calendar" size={22} color={colors.muted} /></View>
            <Text className="mt-4 text-[11px] font-medium text-ink">{selectedDay === null ? 'Bu ay etkinlik bulunmuyor' : 'Bu gün için plan yok'}</Text>
            <Text className="mt-1.5 text-center text-[8.5px] leading-[13px] text-muted">{selectedDay === null ? 'Diğer ayları görüntülemek için takvimin üzerindeki okları kullanın.' : 'Takvimden başka bir gün seçebilir veya tüm ajandaya dönebilirsiniz.'}</Text>
          </View>
        )}
      </View>
    </ServicePage>
  );
}

export function DoctorSchedulePage({ onClose }: PageProps) {
  const [requested, setRequested] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeBarWidth, setTimeBarWidth] = useState(0);
  const timePosition = useState(() => new Animated.Value(0))[0];
  const selectedDay = selectedDayIndex === null ? null : doctorDays[selectedDayIndex];
  const appointmentSlots = selectedDay?.slots ?? [];

  const selectAppointmentTime = (slot: string, index: number) => {
    setSelectedTime(slot);
    setRequested(false);
    Animated.spring(timePosition, { toValue: index, damping: 18, stiffness: 190, mass: 0.8, useNativeDriver: true }).start();
  };

  return (
    <ServicePage title="Doktor Takvimi" onClose={onClose}>
      <View className="px-5 pt-5">
        <View className="rounded-[20px] border-[0.5px] border-line bg-white px-4 py-4">
          <View className="flex-row items-center justify-between"><Text className="text-[8px] font-semibold tracking-[0.8px] text-green">{trUpper('Revir açık')}</Text><Text className="text-[8.5px] text-muted">16:00’ya kadar</Text></View>
          <View className="my-3.5 h-[0.5px] bg-line" />
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1 flex-row items-center gap-3"><View className="h-9 w-9 items-center justify-center rounded-full bg-[#EAF5F1]"><Icon name="stethoscope" size={16} color={colors.green} /></View><View className="flex-1"><Text className="text-[14px] font-medium text-ink">Dr. Ayşe Akın</Text><Text className="mt-1.5 text-[8.5px] text-muted">İşyeri Hekimi</Text></View></View>
            <Text className="text-[9px] font-medium text-ink">09:00–16:00</Text>
          </View>
        </View>

        <View className="mt-6"><SectionLabel title="Randevu tarihi" />
          <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
            {doctorDays.map((item, index) => {
              const selected = selectedDayIndex === index;
              return (
                <Pressable
                  key={`${item.date}-${item.doctor}`}
                  onPress={() => { setSelectedDayIndex(index); setSelectedTime(null); setRequested(false); timePosition.setValue(0); }}
                  className={`relative min-h-[74px] flex-row items-center px-4 active:bg-[#F8F5F1] ${selected ? 'bg-[#FCF5F7]' : ''} ${index === doctorDays.length - 1 ? '' : 'border-b-[0.5px] border-line'}`}
                >
                  {selected ? <View className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-brand" /> : null}
                  <View className="w-[48px] items-center border-r-[0.5px] border-line pr-3">
                    <Text className={`text-[7.5px] font-semibold tracking-[0.6px] ${selected ? 'text-brand' : 'text-muted'}`}>{trUpper(item.active ? 'Bugün' : item.day.slice(0, 3))}</Text>
                    <Text className={`mt-1 text-[17px] font-medium ${selected ? 'text-brand' : 'text-ink'}`}>{item.date.split(' ')[0]}</Text>
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-[11px] font-medium text-ink">{item.doctor}</Text>
                    <Text className="mt-1.5 text-[8.5px] text-muted">{item.area} · {item.time}</Text>
                  </View>
                  <Text className={`text-[8px] font-medium ${selected ? 'text-brand' : item.active ? 'text-green' : 'text-muted'}`}>{selected ? 'Seçildi' : `${item.slots.length} saat`}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedDay ? (
          <View className="mt-5">
            <SectionLabel title="Uygun saatler" />
            <View onLayout={(event) => setTimeBarWidth(event.nativeEvent.layout.width)} className="relative flex-row rounded-[18px] bg-[#EDE9E3] p-1">
              {selectedTime && timeBarWidth > 0 ? (
                <Animated.View
                  pointerEvents="none"
                  className="absolute bottom-1 top-1 rounded-[14px] bg-white"
                  style={{
                    left: 4,
                    width: (timeBarWidth - 8) / appointmentSlots.length,
                    transform: [{ translateX: timePosition.interpolate({ inputRange: [0, appointmentSlots.length - 1], outputRange: [0, ((timeBarWidth - 8) / appointmentSlots.length) * (appointmentSlots.length - 1)] }) }],
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 5,
                    shadowOffset: { width: 0, height: 2 },
                  }}
                />
              ) : null}
              {appointmentSlots.map((slot, index) => {
                const selected = selectedTime === slot;
                return <Pressable key={slot} onPress={() => selectAppointmentTime(slot, index)} className="z-10 h-11 flex-1 items-center justify-center rounded-[14px] active:opacity-70"><Text className={`text-[9.5px] font-medium ${selected ? 'text-brand' : 'text-muted'}`}>{slot}</Text></Pressable>;
              })}
            </View>
          </View>
        ) : null}

        <Pressable onPress={() => setRequested(true)} disabled={!selectedDay || !selectedTime || requested} className={`mt-5 h-[50px] flex-row items-center justify-center gap-2 rounded-[16px] ${requested ? 'border-[0.5px] border-green bg-white' : 'bg-brand'} ${!selectedDay || !selectedTime ? 'opacity-30' : ''}`}>
          <Icon name={requested ? 'check' : 'calendarCheck'} size={17} color={requested ? colors.green : colors.white} />
          <Text className={`text-[11.5px] font-medium ${requested ? 'text-green' : 'text-white'}`}>{requested ? 'Randevu talebi oluşturuldu' : 'Randevu talebi oluştur'}</Text>
        </Pressable>

        {requested && selectedDay && selectedTime ? (
          <View className="mt-3 border-l-[3px] border-green bg-[#EDF5F2] px-4 py-3.5">
            <Text className="text-[9.5px] font-medium text-green">Talebiniz alındı</Text>
            <Text className="mt-1.5 text-[8.5px] text-muted">{selectedDay.date} · {selectedTime} · {selectedDay.doctor}</Text>
          </View>
        ) : null}

        <View className="mt-4 flex-row items-start gap-3 rounded-[18px] bg-[#EFECE6] px-4 py-4"><Icon name="info" size={17} color={colors.brand} /><Text className="flex-1 text-[9px] leading-[14px] text-muted">Acil durumlarda randevu beklemeden revire başvurabilir veya 2230 dahili numarasını arayabilirsiniz.</Text></View>
      </View>
    </ServicePage>
  );
}

export function DocumentsPage({ onClose }: PageProps) {
  const [filter, setFilter] = useState('Tümü');
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [filterBarWidth, setFilterBarWidth] = useState(0);
  const filterPosition = useState(() => new Animated.Value(0))[0];
  const filters = ['Tümü', 'İK', 'İSG', 'KVKK'];
  const visibleDocuments = employeeDocuments.filter((document) => filter === 'Tümü' || document.category === filter);

  const selectFilter = (item: string, index: number) => {
    setFilter(item);
    Animated.spring(filterPosition, { toValue: index, damping: 18, stiffness: 190, mass: 0.8, useNativeDriver: true }).start();
  };

  return (
    <ServicePage title="Dokümanlar" onClose={onClose}>
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
            const selected = filter === item;
            return <Pressable key={item} onPress={() => selectFilter(item, index)} className="z-10 h-11 flex-1 items-center justify-center rounded-[14px] active:opacity-70"><Text className={`text-[9.5px] font-medium ${selected ? 'text-brand' : 'text-muted'}`}>{item}</Text></Pressable>;
          })}
        </View>

        <View className="mt-6"><SectionLabel title="Güncel dokümanlar" action={`${visibleDocuments.length} dosya`} /></View>
        <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
          {visibleDocuments.map((document) => {
            const isDownloaded = downloaded.includes(document.id);
            return (
              <View key={document.id} className={`relative min-h-[88px] flex-row items-center gap-3 px-4 py-3.5 ${document.id === visibleDocuments[visibleDocuments.length - 1]?.id ? '' : 'border-b-[0.5px] border-line'}`}>
                <View className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full" style={{ backgroundColor: document.category === 'İSG' ? '#B86A20' : document.category === 'KVKK' ? '#416B83' : colors.brand }} />
                <View className="h-10 w-10 items-center justify-center rounded-[12px] bg-[#F7ECEF]"><Icon name="filePdf" size={19} color={colors.brand} /></View>
                <View className="flex-1">
                  <Text className="text-[11px] font-medium leading-[15px] text-ink">{document.title}</Text>
                  <View className="mt-2 flex-row flex-wrap items-center gap-2"><Text className="text-[8px] font-medium text-muted">{document.category}</Text><View className="h-[3px] w-[3px] rounded-full bg-[#C6C0BA]" /><Text className="text-[8px] text-muted">{document.meta}</Text><View className="h-[3px] w-[3px] rounded-full bg-[#C6C0BA]" /><Text className="text-[8px] text-muted">{document.badge}</Text></View>
                </View>
                <Pressable onPress={() => setDownloaded((current) => isDownloaded ? current.filter((id) => id !== document.id) : [...current, document.id])} className={`h-9 flex-row items-center justify-center gap-1.5 rounded-[11px] px-3 active:opacity-60 ${isDownloaded ? 'bg-[#EDF5F2]' : 'bg-[#F7ECEF]'}`}><Icon name={isDownloaded ? 'check' : 'download'} size={14} color={isDownloaded ? colors.green : colors.brand} /><Text className={`text-[8.5px] font-medium ${isDownloaded ? 'text-green' : 'text-brand'}`}>{isDownloaded ? 'Hazır' : 'İndir'}</Text></Pressable>
              </View>
            );
          })}
          {visibleDocuments.length === 0 ? <View className="items-center px-5 py-10"><Text className="text-[11px] font-medium text-ink">Bu kategoride doküman yok</Text><Text className="mt-1.5 text-[9px] text-muted">Başka bir kategori seçebilirsiniz.</Text></View> : null}
        </View>
      </View>
    </ServicePage>
  );
}

export function PayrollPage({ onClose }: PageProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [downloadedArchive, setDownloadedArchive] = useState<string[]>([]);

  return (
    <ServicePage title="Bordro" onClose={onClose}>
      <View className="px-5 pt-5">
        <View className="overflow-hidden rounded-[24px] border-[0.5px] border-[#D8C2C9] bg-white">
          <NativeLinearGradient colors={['#A83252', '#7A1D37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="px-5 pb-5 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[9px] font-semibold tracking-[1px] text-white/70">{trUpper(employeePayrollSummary.month)}</Text>
              <View className="flex-row items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5"><View className="h-1.5 w-1.5 rounded-full bg-[#8BE0BE]" /><Text className="text-[7.5px] font-medium tracking-[0.6px] text-white">{trUpper('Hazır')}</Text></View>
            </View>
            <Text className="mt-6 text-[9px] text-white/65">Net ödeme</Text>
            <Text className="mt-2 text-[27px] font-medium tracking-[-0.5px] text-white">{employeePayrollSummary.netAmount}</Text>
          </NativeLinearGradient>
          <View className="min-h-[66px] flex-row items-center px-4">
            <View className="flex-1"><Text className="text-[7.5px] tracking-[0.6px] text-muted">{trUpper('Düzenlenme tarihi')}</Text><Text className="mt-1.5 text-[9.5px] font-medium text-ink">{employeePayrollSummary.readyDate}</Text></View>
            <Pressable onPress={() => setDownloaded(true)} className="h-9 flex-row items-center gap-1.5 rounded-[11px] px-3 active:opacity-60" style={{ backgroundColor: downloaded ? '#EAF5F1' : '#F7ECEF' }}><Icon name={downloaded ? 'check' : 'download'} size={14} color={downloaded ? colors.green : colors.brand} /><Text className="text-[8.5px] font-medium" style={{ color: downloaded ? colors.green : colors.brand }}>{downloaded ? 'Hazır' : 'PDF indir'}</Text></Pressable>
          </View>
        </View>

        <View className="mt-4 overflow-hidden rounded-[20px] border-[0.5px] border-line bg-white">
          <View className="px-4 pb-2 pt-3.5"><Text className="text-[8px] font-medium tracking-[0.8px] text-muted">{trUpper('Çalışan özeti')}</Text></View>
          <View className="flex-row border-t-[0.5px] border-line">
            <View className="flex-1 px-4 py-4"><Text className="text-[8px] text-muted">Yıllık izin bakiyesi</Text><Text className="mt-1.5 text-[16px] font-medium text-ink">{employeePayrollSummary.leaveBalance}</Text></View>
            <View className="w-[0.5px] bg-line" />
            <View className="flex-1 px-4 py-4"><Text className="text-[8px] text-muted">Toplam kıdem</Text><Text className="mt-1.5 text-[16px] font-medium text-ink">{employeePayrollSummary.seniority}</Text></View>
          </View>
        </View>

        <View className="mt-6"><SectionLabel title="Bordro arşivi" action={`${payrollArchive.length} belge`} />
          <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
            {payrollArchive.map((item, index) => {
              const isReady = downloadedArchive.includes(item.month);
              const monthCode = trUpper(item.month.slice(0, 3));
              return (
                <View key={item.month} className={`min-h-[76px] flex-row items-center gap-3 px-4 ${index === payrollArchive.length - 1 ? '' : 'border-b-[0.5px] border-line'}`}>
                  <View className="h-10 w-10 items-center justify-center rounded-[11px] bg-[#F3F0EC]"><Text className="text-[8px] font-semibold tracking-[0.5px] text-muted">{monthCode}</Text><Text className="mt-0.5 text-[7px] text-muted">2026</Text></View>
                  <View className="flex-1"><Text className="text-[10.5px] font-medium text-ink">{item.month}</Text><Text className="mt-1 text-[8px] text-muted">PDF bordro belgesi</Text></View>
                  <View className="items-end"><Text className="text-[9px] font-medium text-ink">{item.amount}</Text><Pressable onPress={() => setDownloadedArchive((current) => isReady ? current.filter((month) => month !== item.month) : [...current, item.month])} className="mt-2 flex-row items-center gap-1 active:opacity-60"><Icon name={isReady ? 'check' : 'download'} size={12} color={isReady ? colors.green : colors.brand} /><Text className="text-[7.5px] font-medium" style={{ color: isReady ? colors.green : colors.brand }}>{isReady ? 'Hazır' : 'İndir'}</Text></Pressable></View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="mt-5 flex-row items-start gap-2.5 px-1"><Icon name="lock" size={14} color={colors.muted} /><Text className="flex-1 text-[8.5px] leading-[13px] text-muted">Bordro bilgileriniz kişiseldir. Ortak cihazlarda görüntüledikten sonra oturumunuzu kapatın.</Text></View>
      </View>
    </ServicePage>
  );
}

export function FeedbackPage({ onClose }: PageProps) {
  const [category, setCategory] = useState('Öneri');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [categoryBarWidth, setCategoryBarWidth] = useState(0);
  const categoryPosition = useState(() => new Animated.Value(0))[0];
  const categories = ['Öneri', 'İyileştirme', 'Şikâyet', 'Diğer'];

  const selectCategory = (item: string, index: number) => {
    setCategory(item);
    Animated.spring(categoryPosition, { toValue: index, damping: 18, stiffness: 190, mass: 0.8, useNativeDriver: true }).start();
  };

  return (
    <ServicePage title="Görüş ve Öneri" onClose={onClose}>
      <View className="px-5 pt-5">
        {submitted ? (
          <View className="overflow-hidden rounded-[24px] border-[0.5px] border-line bg-white">
            <View className="h-1 bg-green" />
            <View className="px-5 py-6">
              <View className="flex-row items-center gap-2"><View className="h-7 w-7 items-center justify-center rounded-full bg-[#EAF5F1]"><Icon name="check" size={14} color={colors.green} /></View><Text className="text-[8.5px] font-medium tracking-[0.7px] text-green">{trUpper('Başarıyla iletildi')}</Text></View>
              <Text className="mt-6 text-[21px] font-medium tracking-[-0.35px] text-ink">Geri bildiriminiz alındı</Text>
              <Text className="mt-2.5 text-[9.5px] leading-[15px] text-muted">Mesajınız Çalışan Deneyimi ekibine güvenli şekilde iletildi.</Text>
              <View className="my-5 h-[0.5px] bg-line" />
              <View className="flex-row items-center justify-between"><Text className="text-[8.5px] text-muted">Kayıt numarası</Text><Text className="text-[9.5px] font-medium text-ink">GD-160826-42</Text></View>
              <Pressable onPress={onClose} className="mt-6 h-[48px] w-full items-center justify-center rounded-[15px] bg-brand"><Text className="text-[11px] font-medium text-white">Tamam</Text></Pressable>
            </View>
          </View>
        ) : (
          <>
            <View className="border-l-[3px] border-brand py-1 pl-4"><Text className="text-[17px] font-medium tracking-[-0.25px] text-ink">Sizi dinliyoruz</Text><Text className="mt-2 max-w-[330px] text-[9.5px] leading-[15px] text-muted">Fikirlerinizi, iyileştirme önerilerinizi veya yaşadığınız bir sorunu paylaşabilirsiniz.</Text></View>

            <View className="mt-6"><SectionLabel title="Konu" />
              <View onLayout={(event) => setCategoryBarWidth(event.nativeEvent.layout.width)} className="relative flex-row rounded-[18px] bg-[#EDE9E3] p-1">
                {categoryBarWidth > 0 ? <Animated.View pointerEvents="none" className="absolute bottom-1 top-1 rounded-[14px] bg-white" style={{ left: 4, width: (categoryBarWidth - 8) / categories.length, transform: [{ translateX: categoryPosition.interpolate({ inputRange: [0, categories.length - 1], outputRange: [0, ((categoryBarWidth - 8) / categories.length) * (categories.length - 1)] }) }], shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } }} /> : null}
                {categories.map((item, index) => <Pressable key={item} onPress={() => selectCategory(item, index)} className="z-10 h-11 flex-1 items-center justify-center rounded-[14px] active:opacity-70"><Text className={`text-[8.5px] font-medium ${category === item ? 'text-brand' : 'text-muted'}`}>{item}</Text></Pressable>)}
              </View>
            </View>

            <View className="mt-6"><View className="flex-row items-center justify-between"><Text className="text-[14px] font-medium text-ink">Mesajınız</Text><Text className="text-[8.5px] text-muted">{note.length}/500</Text></View><View className="mt-3 rounded-[20px] border-[0.5px] border-line bg-white px-4 py-4"><TextInput value={note} onChangeText={(value) => setNote(value.slice(0, 500))} multiline placeholder="Görüşünüzü mümkün olduğunca açık anlatın…" placeholderTextColor="#9A9690" textAlignVertical="top" className="min-h-[150px] text-[11px] leading-[18px] text-ink" /></View></View>

            <Pressable disabled={!note.trim()} onPress={() => setSubmitted(true)} className={`mt-5 h-[52px] flex-row items-center justify-center gap-2 rounded-[18px] bg-brand ${note.trim() ? '' : 'opacity-30'}`}><Text className="text-[12px] font-medium text-white">Gönder</Text><Icon name="send" size={17} color={colors.white} /></Pressable>
          </>
        )}
      </View>
    </ServicePage>
  );
}
