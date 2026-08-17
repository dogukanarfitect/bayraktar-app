import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, Easing, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BayraThinkingIndicator, Icon, NativeLinearGradient } from '../components';
import { detailContent, newsItems, recognitionMembers, surveyQuestions, weeklyFoodMenus } from '../data';
import { createBayraSessionId, getBayraErrorMessage, requestBayraReply, type BayraMessage } from '../services/bayraApi';
import { createHrSessionId, getHrErrorMessage, requestHrReply } from '../services/hrApi';
import { colors } from '../theme';
import { trUpper } from '../turkishText';
import type { IconName, ModalId, NewsItem } from '../types';
import { DoctorSchedulePage, DocumentsPage, EmployeeCalendarPage, EmployeeInfoPage, FeedbackPage, PayrollPage } from './EmployeeServicesPages';
import { EmergencyPhonesPage, RiskReportPage, SafetyDocumentsPage, SafetyTrainingPage } from './SafetyServicePages';
import { ServiceRoutesPage as CompanyServiceRoutesPage } from './ServiceRoutesPage';

type DetailModalProps = {
  modal: ModalId | null;
  selectedNews: NewsItem | null;
  onClose: () => void;
  onNavigate: (id: ModalId) => void;
  onSent: () => void;
};

type ChatMessage = {
  user: boolean;
  text: string;
  time: string;
};

type DetailContentProps = DetailModalProps & {
  aiConversation: BayraMessage[];
  setAiConversation: Dispatch<SetStateAction<BayraMessage[]>>;
  aiSessionId: string;
  hrConversation: ChatMessage[];
  setHrConversation: Dispatch<SetStateAction<ChatMessage[]>>;
  hrSessionId: string;
  notificationUnreadIds: string[];
  setNotificationUnreadIds: Dispatch<SetStateAction<string[]>>;
};

type ReplyPhase = 'idle' | 'thinking' | 'streaming';

const AI_ASSISTANT_NAME = 'BAYRA';
const AI_WELCOME_MESSAGE = 'Merhaba Mehmet, ben BAYRA – Bayraktar Akıllı Hizmet Asistanı. İzin, servis, yemek, bordro, doküman ve İSG süreçlerinde size yardımcı olabilirim. Nasıl yardımcı olabilirim?';
const HR_ASSISTANT_NAME = 'Derya Yıldız';
const HR_WELCOME_MESSAGE = 'Merhaba Mehmet, ben Derya. İK Çalışan Deneyimi ekibindeyim. İzin, bordro, özlük bilgileri ve diğer İK süreçlerinizle ilgili taleplerinizde size yardımcı olabilirim.';
const HR_SUGGESTIONS = ['İzin bakiyemi öğrenmek istiyorum', 'Bordroma nasıl ulaşabilirim?', 'Özlük bilgilerimi güncellemek istiyorum'];
const surveyAnswerOptions = [
  'Kesinlikle katılmıyorum',
  'Katılmıyorum',
  'Kararsızım',
  'Katılıyorum',
  'Kesinlikle katılıyorum',
] as const;

const notificationItems: { id: string; title: string; copy: string; time: string; group: 'Bugün' | 'Dün' | 'Bu hafta'; category: 'Servis' | 'İK' | 'İSG' | 'Bordro'; icon: IconName; accent: string; surface: string; unread: boolean; target: ModalId }[] = [
  { id: 'service-reminder', title: 'Servisiniz 20 dakika sonra kalkıyor', copy: 'Sincan · Eryaman servisi 18:10’da Tesis 2 ana kapıdan hareket edecek.', time: '8 dk', group: 'Bugün', category: 'Servis', icon: 'bus', accent: colors.brand, surface: '#F7ECEF', unread: true, target: 'serviceRoutes' },
  { id: 'employee-handbook', title: 'Çalışan El Kitabı güncellendi', copy: 'Yeni izin ve yan haklar bölümleri doküman merkezine eklendi.', time: '1 sa', group: 'Bugün', category: 'İK', icon: 'doc', accent: '#416B83', surface: '#ECF2F5', unread: true, target: 'documents' },
  { id: 'safety-training', title: 'Yeni İSG eğitiminiz var', copy: 'Risk Farkındalığı eğitimini 18 Ağustos’a kadar tamamlayabilirsiniz.', time: 'Dün', group: 'Dün', category: 'İSG', icon: 'shield', accent: '#168068', surface: '#EAF5F1', unread: true, target: 'safetyTraining' },
  { id: 'survey-invite', title: 'Ağustos nabız anketi açıldı', copy: 'Çalışan deneyimi anketini yaklaşık bir dakika içinde tamamlayabilirsiniz.', time: 'Dün', group: 'Dün', category: 'İK', icon: 'survey', accent: '#8A5A2B', surface: '#F5EEE6', unread: false, target: 'survey' },
  { id: 'payroll-ready', title: 'Temmuz bordronuz hazır', copy: 'Bordronuzu güvenli biçimde görüntüleyebilir veya PDF olarak indirebilirsiniz.', time: '12 Ağu', group: 'Bu hafta', category: 'Bordro', icon: 'payroll', accent: '#6554A3', surface: '#F0EEF8', unread: false, target: 'payroll' },
];

const foodImages = {
  lentilSoup: require('../../assets/food-lentil-soup.png'),
  etliTurlu: require('../../assets/food-etli-turlu.png'),
  ricePilaf: require('../../assets/food-rice-pilaf.png'),
  saladSutlac: require('../../assets/food-salad-sutlac.png'),
  ezogelinSoup: require('../../assets/food-ezogelin-soup.png'),
  grilledKofte: require('../../assets/food-grilled-kofte.png'),
  bulgurCacik: require('../../assets/food-bulgur-cacik.png'),
  cobanSalad: require('../../assets/food-coban-salad.png'),
} as const;

const foodDayLabels: Record<string, string> = {
  Pazartesi: 'Pzt',
  Salı: 'Sal',
  Çarşamba: 'Çar',
  Perşembe: 'Per',
  Cuma: 'Cum',
};

const foodItemImages: Record<string, (typeof foodImages)[keyof typeof foodImages]> = {
  'Mercimek çorbası': foodImages.lentilSoup,
  'Etli türlü': foodImages.etliTurlu,
  'Şehriyeli pirinç pilavı': foodImages.ricePilaf,
  'Mevsim salata · Fırın sütlaç': foodImages.saladSutlac,
  'Ezogelin çorbası': foodImages.ezogelinSoup,
  'Izgara köfte': foodImages.grilledKofte,
  'Domatesli bulgur pilavı · Cacık': foodImages.bulgurCacik,
  'Çoban salata · Mevsim meyvesi': foodImages.cobanSalad,
};

const foodHeroImages: Record<string, (typeof foodImages)[keyof typeof foodImages]> = {
  'Etli türlü menüsü': foodImages.etliTurlu,
  'Izgara köfte menüsü': foodImages.grilledKofte,
};

const foodMenuPages = weeklyFoodMenus.map((menu) => {
  const dayNumber = Number(menu.date.split('-')[2]);
  return {
    ...menu,
    dayLabel: foodDayLabels[menu.day] ?? menu.day.slice(0, 3),
    dateLabel: String(dayNumber),
    fullDate: `${dayNumber} Ağustos · ${menu.day}`,
    hero: foodHeroImages[menu.title] ?? foodImages.etliTurlu,
    items: menu.items.map((item) => ({
      ...item,
      image: foodItemImages[item.name] ?? foodImages.etliTurlu,
    })),
  };
});

type LegacyServiceRoute = { id: string; name: string; direction: string; departure: string; duration: string; occupancy: number; plate: string; stops: string[]; coordinates: { latitude: number; longitude: number }[] };
const serviceRouteItems: LegacyServiceRoute[] = [];

export function DetailModal(props: DetailModalProps) {
  const fullScreen = props.modal === 'newsDetail' || props.modal === 'notifications' || props.modal === 'aiChat' || props.modal === 'hrChat' || props.modal === 'send' || props.modal === 'foodMenu' || props.modal === 'serviceRoutes' || props.modal === 'survey' || props.modal === 'employeeInfo' || props.modal === 'calendar' || props.modal === 'doctorSchedule' || props.modal === 'documents' || props.modal === 'payroll' || props.modal === 'feedbackForm' || props.modal === 'safetyTraining' || props.modal === 'safetyDocs' || props.modal === 'emergencyPhones' || props.modal === 'riskReport';
  const [aiConversation, setAiConversation] = useState<BayraMessage[]>([
    { role: 'assistant', text: AI_WELCOME_MESSAGE },
  ]);
  const aiSessionId = useRef(createBayraSessionId()).current;
  const [hrConversation, setHrConversation] = useState<ChatMessage[]>([
    { user: false, text: HR_WELCOME_MESSAGE, time: 'Şimdi' },
  ]);
  const hrSessionId = useRef(createHrSessionId()).current;
  const [notificationUnreadIds, setNotificationUnreadIds] = useState(() => notificationItems.filter((item) => item.unread).map((item) => item.id));

  return (
    <Modal visible={!!props.modal} animationType="slide" presentationStyle={fullScreen ? 'fullScreen' : 'pageSheet'} onRequestClose={props.onClose}>
      <ModalScene key={props.modal ?? 'none'}>
        <DetailContent {...props} aiConversation={aiConversation} setAiConversation={setAiConversation} aiSessionId={aiSessionId} hrConversation={hrConversation} setHrConversation={setHrConversation} hrSessionId={hrSessionId} notificationUnreadIds={notificationUnreadIds} setNotificationUnreadIds={setNotificationUnreadIds} />
      </ModalScene>
    </Modal>
  );
}

function ModalScene({ children }: { children: React.ReactNode }) {
  const transition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(transition, {
      toValue: 1,
      duration: 210,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [transition]);

  return (
    <Animated.View
      className="flex-1"
      style={{
        opacity: transition,
        transform: [{ translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function DetailContent({ modal, selectedNews, onClose, onNavigate, onSent, aiConversation, setAiConversation, aiSessionId, hrConversation, setHrConversation, hrSessionId, notificationUnreadIds, setNotificationUnreadIds }: DetailContentProps) {
  const insets = useSafeAreaInsets();
  const detailScrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hrReplyPhase, setHrReplyPhase] = useState<ReplyPhase>('idle');
  const recognitionPeers = useMemo(() => recognitionMembers.filter((member) => member.name !== 'Mehmet Yılmaz'), []);

  if (!modal) return null;
  if (modal === 'aiChat') return <AiChatPage onClose={onClose} onNavigate={onNavigate} conversation={aiConversation} setConversation={setAiConversation} sessionId={aiSessionId} />;
  if (modal === 'foodMenu') return <FoodMenuPage onClose={onClose} />;
  if (modal === 'serviceRoutes') return <CompanyServiceRoutesPage onClose={onClose} />;
  if (modal === 'survey') return <SurveyPage onClose={onClose} />;
  if (modal === 'employeeInfo') return <EmployeeInfoPage onClose={onClose} />;
  if (modal === 'calendar') return <EmployeeCalendarPage onClose={onClose} />;
  if (modal === 'doctorSchedule') return <DoctorSchedulePage onClose={onClose} />;
  if (modal === 'documents') return <DocumentsPage onClose={onClose} />;
  if (modal === 'payroll') return <PayrollPage onClose={onClose} />;
  if (modal === 'feedbackForm') return <FeedbackPage onClose={onClose} />;
  if (modal === 'safetyTraining') return <SafetyTrainingPage onClose={onClose} />;
  if (modal === 'safetyDocs') return <SafetyDocumentsPage onClose={onClose} />;
  if (modal === 'emergencyPhones') return <EmergencyPhonesPage onClose={onClose} />;
  if (modal === 'riskReport') return <RiskReportPage onClose={onClose} />;
  if (modal === 'newsDetail') return <NewsDetailPage item={selectedNews ?? newsItems[0]} onClose={onClose} />;
  if (modal === 'notifications') return <NotificationsPage onClose={onClose} onNavigate={onNavigate} unreadIds={notificationUnreadIds} setUnreadIds={setNotificationUnreadIds} />;

  const sendChat = async (value = draft) => {
    const question = value.trim();
    if (!question || hrReplyPhase !== 'idle') return;
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setHrConversation((current) => [...current, { user: true, text: question, time }]);
    setDraft('');
    setHrReplyPhase('thinking');

    try {
      const response = await requestHrReply(question, hrSessionId);
      const replyTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setHrConversation((current) => [...current, { user: false, text: response.text, time: replyTime }]);
    } catch (error) {
      const replyTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setHrConversation((current) => [...current, { user: false, text: getHrErrorMessage(error), time: replyTime }]);
    } finally {
      setHrReplyPhase('idle');
    }
  };

  let title = 'Detay';
  let subtitle = 'Bayraktar Mobil Portal';
  let body: React.ReactNode;
  let footer: React.ReactNode = <PrimaryButton label="Kapat" onPress={onClose} />;

  if (modal === 'hrChat') {
    title = 'İK Destek';
    subtitle = `${HR_ASSISTANT_NAME} · Çalışan Deneyimi`;
    body = (
      <View>
        <Chat messages={hrConversation} assistantName={HR_ASSISTANT_NAME} assistantInitials="DY" />
        {hrReplyPhase === 'thinking' ? <HrThinkingIndicator /> : null}
        {hrConversation.length === 1 && hrReplyPhase === 'idle' ? (
          <View className="mt-6">
            <Text className="mb-3 text-[10px] text-muted">Size nasıl yardımcı olabilirim?</Text>
            <View className="overflow-hidden rounded-[18px] border-[0.5px] border-line bg-white">
              {HR_SUGGESTIONS.map((suggestion, index) => (
                <Pressable
                  key={suggestion}
                  onPress={() => sendChat(suggestion)}
                  className={`min-h-[52px] justify-center border-line px-4 active:bg-[#F7F5F1] ${index === HR_SUGGESTIONS.length - 1 ? 'border-b-0' : 'border-b-[0.5px]'}`}
                >
                  <Text className="text-[11.5px] text-ink">{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
    footer = <ChatInput draft={draft} onChange={setDraft} onSend={() => sendChat()} placeholder="İK'ya mesajınızı yazın" disabled={hrReplyPhase !== 'idle'} />;
  } else if (modal === 'send') {
    title = 'Takdir Gönder';
    subtitle = '';
    body = submitted
      ? <Success title="Takdiriniz iletildi" copy={`${recognitionPeers[selectedPerson ?? 0].name} için gönderdiğiniz teşekkür puanlara eklendi.`} />
      : <RecognitionForm peers={recognitionPeers} selectedPerson={selectedPerson} note={note} onSelect={setSelectedPerson} onNote={setNote} />;
    footer = submitted
      ? <PrimaryButton label="Kapat" onPress={onClose} />
      : <PrimaryButton label="Gönder" disabled={selectedPerson === null || !note.trim()} onPress={() => { if (selectedPerson === null || !note.trim()) return; setSubmitted(true); onSent(); }} />;
  } else {
    const content = detailContent[modal as keyof typeof detailContent];
    if (content) {
      title = content.title;
      subtitle = content.subtitle;
      body = <View><View className="mb-5 h-[62px] w-[62px] items-center justify-center rounded-[21px] bg-[#F7ECEF]"><Icon name={content.icon} size={27} color={colors.brand} /></View><Rows rows={content.rows} /></View>;
    } else {
      body = <Success title="İçerik hazır" copy="Bu hizmet mobil portal üzerinden kullanıma hazır." />;
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-soft" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {modal === 'hrChat' || modal === 'send' ? (
        <View className="flex-row items-end border-b-[0.5px] border-line bg-white px-5 pb-2" style={{ paddingTop: Math.max(insets.top, 12) }}>
          <View className="h-[52px] flex-1 justify-center"><Pressable hitSlop={12} onPress={onClose} className="h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-line bg-white active:opacity-60"><Icon name="back" size={25} /></Pressable></View>
          <View className="h-[52px] items-center justify-center"><Text className="text-[17px] font-medium tracking-[-0.25px] text-ink">{title}</Text></View>
          <View className="h-[52px] flex-1" />
        </View>
      ) : (
        <View className="min-h-[78px] flex-row items-center gap-2 border-b-[0.5px] border-line bg-white px-[13px] pb-3" style={{ paddingTop: Math.max(insets.top, 12) }}>
          <Pressable hitSlop={12} onPress={onClose} className="h-[38px] w-[38px] items-center justify-center active:opacity-60"><Icon name="back" size={28} /></Pressable>
          <View className="flex-1"><Text className="text-[20px] font-medium text-ink">{title}</Text><Text className="mt-[3px] text-[10px] text-muted">{subtitle}</Text></View>
        </View>
      )}
      <ScrollView
        ref={detailScrollRef}
        className="flex-1"
        contentContainerClassName="p-5 pb-10"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (modal === 'hrChat') detailScrollRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {body}
      </ScrollView>
      <View className="border-t-[0.5px] border-line bg-white px-5 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 14) }}>{footer}</View>
    </KeyboardAvoidingView>
  );
}

function AiChatPage({ onClose, onNavigate, conversation, setConversation, sessionId }: { onClose: () => void; onNavigate: (id: ModalId) => void; conversation: BayraMessage[]; setConversation: Dispatch<SetStateAction<BayraMessage[]>>; sessionId: string }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [draft, setDraft] = useState('');
  const [replyPhase, setReplyPhase] = useState<ReplyPhase>('idle');
  const suggestions = ['Bugünkü yemek menüsü nedir?', 'Servisim saat kaçta?', 'Kaç gün iznim kaldı?'];
  const showSuggestions = !conversation.some((message) => message.role === 'user');
  const replying = replyPhase !== 'idle';

  useEffect(() => () => {
    if (streamTimer.current) clearInterval(streamTimer.current);
  }, []);

  const sendMessage = async (value = draft) => {
    const question = value.trim();
    if (!question || replying) return;
    const nextConversation: BayraMessage[] = [...conversation, { role: 'user', text: question }];
    setDraft('');
    setReplyPhase('thinking');
    setConversation(nextConversation);

    try {
      const response = await requestBayraReply(nextConversation, sessionId);
      let cursor = 0;
      setConversation((current) => [...current, { role: 'assistant', text: '' }]);
      setReplyPhase('streaming');

      streamTimer.current = setInterval(() => {
        cursor = Math.min(cursor + 3, response.text.length);
        setConversation((current) => current.map((message, index) => (
          index === current.length - 1 ? { ...message, text: response.text.slice(0, cursor), action: cursor === response.text.length ? response.action : undefined } : message
        )));

        if (cursor === response.text.length) {
          if (streamTimer.current) clearInterval(streamTimer.current);
          streamTimer.current = null;
          setReplyPhase('idle');
        }
      }, 24);
    } catch (error) {
      setConversation((current) => [...current, { role: 'assistant', text: getBayraErrorMessage(error) }]);
      setReplyPhase('idle');
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#FCFBF8]" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <View className="flex-row items-end border-b-[0.5px] border-line px-5 pb-2" style={{ paddingTop: Math.max(insets.top, 12) }}>
        <View className="h-[52px] flex-1 justify-center">
          <Pressable hitSlop={12} onPress={onClose} className="h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-line bg-white active:opacity-60">
            <Icon name="back" size={25} color={colors.ink} />
          </Pressable>
        </View>
        <View className="h-[52px] flex-row items-center justify-center gap-[9px]">
          <Image
            source={require('../../assets/chatbot-icon.png')}
            resizeMode="contain"
            style={{ width: 30, height: 30, tintColor: colors.brand }}
          />
          <Text className="text-[16px] font-medium tracking-[-0.2px] text-ink">{AI_ASSISTANT_NAME}</Text>
        </View>
        <View className="h-[52px] flex-1" />
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: replyPhase !== 'streaming' })}
      >
        <View className="gap-6">
          {conversation.map((message, index) => message.role === 'user' ? (
            <View key={`${message.role}-${index}`} className="items-end">
              <View className="max-w-[82%] rounded-[18px] rounded-br-[6px] bg-[#ECE9E4] px-[14px] py-[11px]">
                <Text className="text-[12px] leading-[19px] text-ink">{message.text}</Text>
              </View>
            </View>
          ) : (
            <View key={`${message.role}-${index}`} className="max-w-[92%]">
              <View className="mb-2 flex-row items-center gap-2">
                <Image
                  source={require('../../assets/chatbot-icon.png')}
                  resizeMode="contain"
                  style={{ width: 18, height: 18, tintColor: colors.brand }}
                />
                <Text className="text-[8.5px] font-semibold tracking-[0.35px] text-brand">{trUpper(AI_ASSISTANT_NAME)}</Text>
              </View>
              <Text className="text-[12px] leading-5 text-[#3F3C39]">
                {message.text}
                {replyPhase === 'streaming' && index === conversation.length - 1 ? <Text className="text-brand"> ▍</Text> : null}
              </Text>
              {message.action ? (
                <Pressable onPress={() => onNavigate(message.action!.target)} className="mt-3 h-10 self-start flex-row items-center gap-2 rounded-[13px] bg-[#F7ECEF] px-4 active:opacity-70">
                  <Text className="text-[9.5px] font-medium text-brand">{message.action.label}</Text>
                  <Icon name="chevronRight" size={14} color={colors.brand} />
                </Pressable>
              ) : null}
            </View>
          ))}

          {showSuggestions ? (
            <View>
              <Text className="mb-3 text-[10px] leading-[16px] text-muted">Şunlardan biriyle başlayabilirsiniz:</Text>
              <View className="overflow-hidden rounded-[18px] border-[0.5px] border-line bg-white">
                {suggestions.map((suggestion, index) => (
                  <Pressable key={suggestion} onPress={() => sendMessage(suggestion)} className={`min-h-[52px] justify-center border-line px-4 active:bg-[#F7F5F1] ${index === suggestions.length - 1 ? 'border-b-0' : 'border-b-[0.5px]'}`}>
                    <Text className="text-[11.5px] text-ink">{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {replyPhase === 'thinking' ? <BayraThinkingIndicator /> : null}
        </View>
      </ScrollView>

      <View className="border-t-[0.5px] border-line bg-white px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <View className="min-h-[50px] flex-row items-center rounded-[22px] border-[0.5px] border-line bg-[#FCFBF8] pl-4 pr-[5px]">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => sendMessage()}
            placeholder="Mesajınızı yazın"
            placeholderTextColor="#A5A09B"
            className="h-[48px] flex-1 text-[12px] text-ink"
            returnKeyType="send"
          />
          <Pressable disabled={!draft.trim() || replying} onPress={() => sendMessage()} className={`h-10 w-10 items-center justify-center rounded-full bg-brand active:opacity-70 ${!draft.trim() || replying ? 'opacity-30' : ''}`}>
            <Icon name="send" size={17} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function FoodMenuPage({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(0);
  const selectedMenu = foodMenuPages[selectedDay];
  const menuTransition = useRef(new Animated.Value(1)).current;
  const menuTransitionDirection = useRef(1);

  useEffect(() => {
    menuTransition.setValue(0);
    Animated.timing(menuTransition, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [menuTransition, selectedDay]);

  const selectMenuDay = (index: number) => {
    if (index === selectedDay) return;
    menuTransitionDirection.current = index > selectedDay ? 1 : -1;
    setSelectedDay(index);
  };

  return (
    <View className="flex-1 bg-[#FCFBF8]">
      <StatusBar style="dark" />
      <View className="flex-row items-end border-b-[0.5px] border-line bg-[#FCFBF8] px-5 pb-2" style={{ paddingTop: Math.max(insets.top, 12) }}>
        <View className="h-[52px] flex-1 justify-center">
          <Pressable hitSlop={12} onPress={onClose} className="h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-line bg-white active:opacity-60">
            <Icon name="back" size={25} color={colors.ink} />
          </Pressable>
        </View>
        <View className="h-[52px] items-center justify-center">
          <Text className="text-[17px] font-medium tracking-[-0.25px] text-ink">Yemek Menüsü</Text>
        </View>
        <View className="h-[52px] flex-1" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: Math.max(insets.bottom + 28, 44) }}
      >
        <View className="mb-5 overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
          <View className="flex-row items-center justify-between px-4 py-3.5">
            <View><Text className="text-[13px] font-medium text-ink">Bu haftanın menüsü</Text><Text className="mt-1 text-[8.5px] text-muted">17–21 Ağustos 2026</Text></View>
            <View className="flex-row items-center gap-2"><Icon name="calendar" size={15} color={colors.brand} /><Text className="text-[8.5px] font-medium text-brand">5 iş günü</Text></View>
          </View>
          <View className="h-[0.5px] bg-line" />
          <View className="flex-row px-2 pb-3 pt-2">
            {foodMenuPages.map((menu, index) => {
              const selected = selectedDay === index;
              return (
                <Pressable
                  key={menu.date}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${menu.fullDate} menüsü`}
                  onPress={() => selectMenuDay(index)}
                  className="min-h-[68px] flex-1 items-center justify-start rounded-[14px] pt-2 active:bg-[#F7F5F1]"
                >
                  <Text className={`text-[8px] font-medium ${selected ? 'text-brand' : 'text-muted'}`}>{menu.dayLabel}</Text>
                  <View className={`mt-1.5 h-9 w-9 items-center justify-center rounded-full ${selected ? 'bg-brand' : ''}`}>
                    <Text className={`text-[14px] font-semibold ${selected ? 'text-white' : 'text-ink'}`}>{menu.dateLabel}</Text>
                  </View>
                  {menu.today ? <Text className={`mt-1 text-[7px] font-medium ${selected ? 'text-brand' : 'text-muted'}`}>Bugün</Text> : <View className="mt-1 h-[9px]" />}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Animated.View
          style={{
            opacity: menuTransition,
            transform: [{
              translateX: menuTransition.interpolate({
                inputRange: [0, 1],
                outputRange: [menuTransitionDirection.current * 18, 0],
              }),
            }],
          }}
        >
          <View className="h-[220px] overflow-hidden rounded-[26px] bg-[#DDD7D0]">
            <Image source={selectedMenu.hero} className="h-full w-full" resizeMode="cover" />
            <NativeLinearGradient
              colors={['rgba(22, 15, 16, 0)', 'rgba(22, 15, 16, 0.8)']}
              locations={[0.3, 1]}
              className="absolute inset-0"
            />
            <View className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-[7px]">
              <Text className="text-[8px] font-semibold tracking-[1px] text-brand">{trUpper(selectedMenu.today ? 'Bugün' : selectedMenu.dayLabel)}</Text>
            </View>
            <View className="absolute bottom-5 left-5 right-5">
              <Text className="text-[25px] font-medium tracking-[-0.5px] text-white">{selectedMenu.title}</Text>
              <Text className="mt-2 text-[11px] text-white/75">{selectedMenu.fullDate} · 4 çeşit</Text>
            </View>
          </View>

          <View className="mt-4 flex-row overflow-hidden rounded-[20px] border-[0.5px] border-line bg-white">
            <MenuMetric label="TOPLAM" value={selectedMenu.total} />
            <View className="w-[0.5px] bg-line" />
            <MenuMetric label="SERVİS" value="12:00–14:00" />
            <View className="w-[0.5px] bg-line" />
            <MenuMetric label="YER" value="Tesis 2" />
          </View>

          <CafeteriaHoursNotice isToday={selectedMenu.today} isFriday={selectedDay === 4} />

          <View className="mb-3 mt-7 flex-row items-end justify-between">
            <View>
              <Text className="text-[20px] font-medium tracking-[-0.35px] text-ink">Menü detayları</Text>
              <Text className="mt-1.5 text-[10px] text-muted">{selectedMenu.fullDate}</Text>
            </View>
            <Text className="text-[9px] font-medium text-brand">4 çeşit</Text>
          </View>

          <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
            {selectedMenu.items.map((item, index) => (
              <View key={item.name} className={`flex-row items-center gap-4 p-3 ${index === selectedMenu.items.length - 1 ? '' : 'border-b-[0.5px] border-line'}`}>
                <Image source={item.image} className="h-[74px] w-[82px] rounded-[16px] bg-[#EEE9E3]" resizeMode="cover" />
                <View className="flex-1 py-1">
                  <Text className="text-[8px] font-semibold tracking-[0.9px] text-brand">{trUpper(item.category)}</Text>
                  <Text className="mt-2 text-[13px] font-medium leading-[18px] text-ink">{item.name}</Text>
                  <Text className="mt-2 text-[9px] text-muted">{item.calories}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function MenuMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-h-[67px] flex-1 items-center justify-center px-1">
      <Text className="text-[7.5px] font-semibold tracking-[0.8px] text-muted">{label}</Text>
      <Text className="mt-2 text-center text-[10.5px] font-medium text-ink">{value}</Text>
    </View>
  );
}

function getCafeteriaStatus(isToday: boolean, isFriday: boolean) {
  if (!isToday) {
    return {
      title: 'Servis saatleri',
      copy: 'Tesis 2 yemekhanesi 12:00–14:00 arasında hizmet verir.',
      open: false,
    };
  }

  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const opensAt = 12 * 60;
  const closesAt = 14 * 60;

  if (minutes < opensAt) {
    return {
      title: 'Yemekhane henüz açılmadı',
      copy: 'Tesis 2 · 12:00’de hizmete başlıyor.',
      open: false,
    };
  }

  if (minutes < closesAt) {
    return {
      title: 'Yemekhane şu an açık',
      copy: 'Servis 14:00’e kadar devam ediyor · Tesis 2',
      open: true,
    };
  }

  return {
    title: 'Bugünkü servis tamamlandı',
    copy: isFriday ? 'Pazartesi 12:00’de tekrar açılacak.' : 'Yarın 12:00’de tekrar hizmete açılacak.',
    open: false,
  };
}

function CafeteriaHoursNotice({ isToday, isFriday }: { isToday: boolean; isFriday: boolean }) {
  const status = getCafeteriaStatus(isToday, isFriday);

  return (
    <View className="mt-4 flex-row items-start gap-3 rounded-[17px] bg-[#EFECE6] px-4 py-3.5">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
        <Icon name="clock" size={16} color={status.open ? colors.green : colors.brand} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-[10.5px] font-medium text-ink">{status.title}</Text>
          {status.open ? <View className="h-1.5 w-1.5 rounded-full bg-green" /> : null}
        </View>
        <Text className="mt-1.5 text-[9px] leading-[14px] text-muted">{status.copy}</Text>
      </View>
    </View>
  );
}

function LegacyServiceRoutesPage({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeSelectorOpen, setRouteSelectorOpen] = useState(false);
  const [followedRouteId, setFollowedRouteId] = useState<string | null>(null);
  const routeTransition = useRef(new Animated.Value(1)).current;
  const route = serviceRouteItems[selectedRouteIndex];
  const isFollowed = followedRouteId === route.id;

  useEffect(() => {
    routeTransition.setValue(0);
    Animated.timing(routeTransition, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [routeTransition, selectedRouteIndex]);

  const selectRoute = (index: number) => {
    setRouteSelectorOpen(false);
    if (index !== selectedRouteIndex) setSelectedRouteIndex(index);
  };

  const routeTransitionStyle = {
    opacity: routeTransition,
    transform: [{ translateY: routeTransition.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  };

  return (
    <View className="flex-1 bg-[#FCFBF8]">
      <StatusBar style="dark" />
      <View className="flex-row items-end border-b-[0.5px] border-line bg-[#FCFBF8] px-5 pb-2" style={{ paddingTop: Math.max(insets.top, 12) }}>
        <View className="h-[52px] flex-1 justify-center">
          <Pressable hitSlop={12} onPress={onClose} className="h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-line bg-white active:opacity-60">
            <Icon name="back" size={25} color={colors.ink} />
          </Pressable>
        </View>
        <View className="h-[52px] items-center justify-center">
          <Text className="text-[17px] font-medium tracking-[-0.25px] text-ink">Servisler</Text>
        </View>
        <View className="h-[52px] flex-1" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 28, 44) }}
      >
        <View className="px-5 pt-5">
          <View className="mb-3 flex-row items-end justify-between"><View><Text className="text-[15px] font-medium text-ink">Güzergâh seçimi</Text><Text className="mt-1 text-[8.5px] text-muted">Akşam seferleri · Tesis 2</Text></View><Text className="text-[8.5px] text-muted">{serviceRouteItems.length} servis</Text></View>
          <Pressable onPress={() => setRouteSelectorOpen((current) => !current)} className={`min-h-[72px] flex-row items-center gap-3 bg-white px-4 active:bg-[#F7F5F1] ${routeSelectorOpen ? 'rounded-t-[19px]' : 'rounded-[19px]'}`} style={{ borderWidth: 0.5, borderColor: routeSelectorOpen ? '#D7AEB9' : colors.line }}>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F7ECEF]"><Icon name="bus" size={20} color={colors.brand} /></View>
            <View className="flex-1"><Text className="text-[12px] font-medium text-ink">{route.name}</Text><Text className="mt-1.5 text-[8.5px] text-muted" numberOfLines={1}>{route.direction}</Text></View>
            <View className="items-end"><Text className="text-[16px] font-semibold text-brand">{route.departure}</Text><Text className="mt-1 text-[8px] text-muted">{routeSelectorOpen ? 'Kapat' : 'Değiştir'}</Text></View>
          </Pressable>
          {routeSelectorOpen ? (
            <View className="overflow-hidden rounded-b-[19px] bg-white" style={{ borderWidth: 0.5, borderTopWidth: 0, borderColor: '#D7AEB9' }}>
              {serviceRouteItems.map((item, index) => {
                const selected = selectedRouteIndex === index;
                return <Pressable key={item.id} onPress={() => selectRoute(index)} className={`min-h-[62px] flex-row items-center gap-3 px-4 active:bg-[#F7F5F1] ${index === serviceRouteItems.length - 1 ? '' : 'border-b-[0.5px] border-line'}`}><View className={`h-8 w-8 items-center justify-center rounded-full ${selected ? 'bg-brand' : 'bg-[#F3F0EC]'}`}><Icon name={selected ? 'check' : 'bus'} size={15} color={selected ? colors.white : colors.muted} /></View><View className="flex-1"><Text className={`text-[10.5px] font-medium ${selected ? 'text-brand' : 'text-ink'}`}>{item.name}</Text><Text className="mt-1 text-[8px] text-muted">{item.duration} · {item.plate}</Text></View><Text className="text-[12px] font-semibold text-ink">{item.departure}</Text></Pressable>;
              })}
            </View>
          ) : null}

          <Animated.View className="mt-4" style={routeTransitionStyle}><RouteMap route={route} /></Animated.View>
        </View>

        <Animated.View className="mx-5 mt-5 overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white" style={routeTransitionStyle}>
          <View className="flex-row items-center justify-between px-4 pb-4 pt-[17px]">
            <View>
              <View className="flex-row items-center gap-2"><View className="h-1.5 w-1.5 rounded-full bg-green" /><Text className="text-[8px] font-medium text-green">Planlanan sefer</Text></View>
              <Text className="mt-2 text-[17px] font-medium tracking-[-0.25px] text-ink">{route.name}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[23px] font-medium tracking-[-0.4px] text-ink">{route.departure}</Text>
              <Text className="mt-1 text-[8px] text-muted">Planlanan kalkış</Text>
            </View>
          </View>

          <View className="h-[0.5px] bg-line" />

          <View className="flex-row px-4 py-4">
            <ServiceMetric icon="clock" label="Süre" value={route.duration} />
            <View className="w-[0.5px] bg-line" />
            <ServiceMetric icon="bus" label="Araç" value={route.plate} />
          </View>
        </Animated.View>

        <View className="mx-5 mt-5">
          <Text className="mb-4 text-[15px] font-medium text-ink">Duraklar</Text>
          <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white px-4 py-2">
            {route.stops.map((stop, index) => (
              <View key={stop} className="h-[64px] flex-row items-center gap-3">
                <View className="h-[64px] w-5 items-center justify-center">
                  {index > 0 ? <View className="absolute top-0 h-[27px] w-[1.5px] bg-brand/25" /> : null}
                  {index < route.stops.length - 1 ? <View className="absolute bottom-0 h-[27px] w-[1.5px] bg-brand/25" /> : null}
                  <View className={`z-10 h-3 w-3 rounded-full border-2 ${index === 0 ? 'border-brand bg-brand' : index === route.stops.length - 1 ? 'border-brand bg-[#F7ECEF]' : 'border-brand bg-white'}`} />
                </View>
                <View className={`h-full flex-1 flex-row items-center justify-between ${index < route.stops.length - 1 ? 'border-b-[0.5px] border-line' : ''}`}>
                  <View className="flex-1 pr-3">
                    <Text className="text-[11.5px] font-medium text-ink">{stop}</Text>
                    <Text className="mt-1 text-[8.5px] text-muted">{index === 0 ? 'Kalkış noktası' : index === route.stops.length - 1 ? 'Son durak' : 'Ara durak'}</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`text-[10px] font-medium ${index === 0 ? 'text-brand' : 'text-ink'}`}>{index === 0 ? route.departure : `+${index * 16} dk`}</Text>
                    <Text className="mt-1 text-[8px] text-muted">tahmini</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => setFollowedRouteId(isFollowed ? null : route.id)}
          className={`mx-5 mt-5 h-[52px] flex-row items-center justify-center gap-2 rounded-[18px] active:opacity-70 ${isFollowed ? 'border border-brand bg-white' : 'bg-brand'}`}
        >
          <Icon name={isFollowed ? 'check' : 'bell'} size={18} color={isFollowed ? colors.brand : colors.white} />
          <Text className={`text-[13px] font-medium ${isFollowed ? 'text-brand' : 'text-white'}`}>{isFollowed ? 'Servis takip ediliyor' : 'Servisi takip et'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function RouteMap({ route }: { route: (typeof serviceRouteItems)[number] }) {
  const mapRef = useRef<MapView>(null);
  const routeCoordinates = [...route.coordinates];
  const stopCoordinates = [routeCoordinates[0], routeCoordinates[2], routeCoordinates[routeCoordinates.length - 1]];

  const fitRoute = (animated = true) => {
    mapRef.current?.fitToCoordinates(routeCoordinates, {
      animated,
      edgePadding: { top: 54, right: 42, bottom: 54, left: 42 },
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => fitRoute(true), 120);
    return () => clearTimeout(timer);
  }, [route.id]);

  return (
    <View className="h-[290px] overflow-hidden rounded-[26px] bg-[#EAE9E3]">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: routeCoordinates[2].latitude,
          longitude: routeCoordinates[2].longitude,
          latitudeDelta: 0.065,
          longitudeDelta: 0.085,
        }}
        onMapReady={() => fitRoute(false)}
        mapType="standard"
        showsCompass
        showsScale
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {route.stops.map((stop, index) => (
          <Marker
            key={`${route.id}-${stop}`}
            coordinate={stopCoordinates[index]}
            title={stop}
            description={index === 0 ? `${route.departure} kalkış` : index === route.stops.length - 1 ? 'Son durak' : 'Ara durak'}
            pinColor={index === 0 ? colors.brand : index === route.stops.length - 1 ? colors.wine : colors.green}
          />
        ))}

        <Marker coordinate={routeCoordinates[1]} title={`${route.name} servisi`} description={route.plate} anchor={{ x: 0.5, y: 0.5 }}>
          <View className="h-[38px] w-[38px] items-center justify-center rounded-full border-[3px] border-white bg-brand">
            <Icon name="bus" size={18} color={colors.white} />
          </View>
        </Marker>
      </MapView>

      <Pressable onPress={() => fitRoute(true)} className="absolute right-4 top-4 h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-line bg-white/95 active:opacity-70">
        <Icon name="location" size={17} color={colors.brand} />
      </Pressable>
    </View>
  );
}

function ServiceMetric({ icon, label, value }: { icon: 'clock' | 'bus'; label: string; value: string }) {
  return (
    <View className="flex-1 flex-row items-center gap-3 px-2">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F7ECEF]">
        <Icon name={icon} size={16} color={colors.brand} />
      </View>
      <View>
        <Text className="text-[8px] text-muted">{label}</Text>
        <Text className="mt-1 text-[10.5px] font-medium text-ink">{value}</Text>
      </View>
    </View>
  );
}

function NotificationsPage({ onClose, onNavigate, unreadIds, setUnreadIds }: { onClose: () => void; onNavigate: (id: ModalId) => void; unreadIds: string[]; setUnreadIds: Dispatch<SetStateAction<string[]>> }) {
  const insets = useSafeAreaInsets();
  const groups = ['Bugün', 'Dün', 'Bu hafta'] as const;
  const unreadCount = unreadIds.length;

  const markAsRead = (id: string) => {
    setUnreadIds((current) => current.filter((itemId) => itemId !== id));
  };

  const openNotification = (id: string, target: ModalId) => {
    markAsRead(id);
    onNavigate(target);
  };

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
          <Text className="text-[17px] font-medium tracking-[-0.25px] text-ink">Bildirimler</Text>
        </View>
        <View className="h-[52px] flex-1" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 28, 44) }}>
        <View className="px-5 pt-5">
          <View><Text className="text-[17px] font-medium tracking-[-0.25px] text-ink">{unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}</Text><Text className="mt-1.5 text-[8.5px] text-muted">Son 30 günlük kişisel bildirim akışı</Text></View>
        </View>

        <View className="px-5">
          {groups.map((group) => {
            const items = notificationItems.filter((item) => item.group === group);
            if (items.length === 0) return null;
            return (
              <View key={group} className="mt-6">
                <Text className="mb-3 text-[9px] font-semibold tracking-[1.1px] text-muted">{trUpper(group)}</Text>
                <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
                  {items.map((item, index) => {
                    const unread = unreadIds.includes(item.id);
                    return (
                      <Pressable key={item.id} onPress={() => openNotification(item.id, item.target)} className={`min-h-[60px] flex-row items-center gap-3 px-4 active:bg-[#F7F5F1] ${unread ? 'bg-white' : 'bg-[#FCFBF8]'} ${index === items.length - 1 ? '' : 'border-b-[0.5px] border-line'}`}>
                        <View className={`h-2 w-2 rounded-full ${unread ? 'bg-brand' : 'bg-[#D8D3CD]'}`} />
                        <Text className={`flex-1 py-3 text-[10.5px] leading-[15px] text-ink ${unread ? 'font-semibold' : 'font-medium'}`}>{item.title}</Text>
                        <Text className="text-[8px] text-muted">{item.time}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

        </View>
      </ScrollView>
    </View>
  );
}

function NewsDetailPage({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#FCFBF8]">
      <View className="flex-row items-end px-5 pb-2" style={{ paddingTop: Math.max(insets.top, 12) }}>
        <View className="h-[50px] flex-1 justify-center">
          <Pressable hitSlop={12} onPress={onClose} className="h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-line bg-white active:opacity-60">
            <Icon name="back" size={25} color={colors.ink} />
          </Pressable>
        </View>
        <View className="h-[50px] items-center justify-center">
          <Image source={require('../../assets/logo-bayraktar.png')} className="h-[44px] w-[82px]" resizeMode="contain" style={{ tintColor: colors.brand }} />
        </View>
        <View className="h-[50px] flex-1" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 28, 44) }}>
        <View className="mx-5 mt-2 h-[258px] overflow-hidden rounded-[14px] bg-[#E9E5DF]">
          <Image source={item.image} className="h-full w-full" resizeMode="cover" />
        </View>

        <View className="px-5 pt-6">
          <View className="flex-row items-center gap-[9px]">
            <Text className="text-[9px] font-semibold tracking-[1px] text-brand">{trUpper(item.category)}</Text>
            <View className="h-[3px] w-[3px] rounded-full bg-[#C9C4BE]" />
            <Text className="text-[9px] text-muted">{item.date}</Text>
          </View>

          <Text className="mt-4 text-[28px] font-medium leading-[34px] tracking-[-0.65px] text-ink">{item.title}</Text>
          <Text className="mt-4 text-[13px] leading-[21px] text-muted">{item.summary}</Text>

          <View className="my-6 h-[0.5px] bg-line" />

          {item.detail.map((paragraph, index) => <Text key={paragraph} className={`${index === 0 ? '' : 'mt-5'} text-[14px] leading-[24px] text-[#45413E]`}>{paragraph}</Text>)}
        </View>
      </ScrollView>
    </View>
  );
}

function Chat({ messages, assistantName = 'Derya Yıldız', assistantInitials = 'DY' }: { messages: ChatMessage[]; assistantName?: string; assistantInitials?: string }) {
  return (
    <View className="gap-5">
      {messages.map((message, index) => message.user ? (
        <View key={`${message.time}-${index}`} className="items-end">
          <View className="max-w-[82%] rounded-[20px] rounded-br-[6px] bg-brand px-4 py-3">
            <Text className="text-[12px] leading-[19px] text-white">{message.text}</Text>
          </View>
          <Text className="mr-1 mt-1.5 text-[8px] text-muted">{message.time}</Text>
        </View>
      ) : (
        <View key={`${message.time}-${index}`} className="flex-row items-start gap-[10px]">
          <View className="h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F3E3E8]">
            <Text className="text-[9px] font-semibold text-brand">{assistantInitials}</Text>
          </View>
          <View className="max-w-[80%]">
            <View className="mb-1.5 flex-row items-center gap-2">
              <Text className="text-[9px] font-medium text-ink">{assistantName}</Text>
            </View>
            <View className="rounded-[20px] rounded-tl-[6px] bg-[#F3F0EC] px-4 py-3">
              <Text className="text-[12px] leading-[19px] text-ink">{message.text}</Text>
            </View>
            <Text className="ml-1 mt-1.5 text-[8px] text-muted">{message.time}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function HrThinkingIndicator() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const loops = dots.map((dot, index) => Animated.loop(Animated.sequence([
      Animated.delay(index * 140),
      Animated.timing(dot, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(dot, {
        toValue: 0.3,
        duration: 260,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay((2 - index) * 140),
    ])));

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [dots]);

  return (
    <View className="mt-4 flex-row items-start gap-[10px]">
      <View className="h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F3E3E8]">
        <Text className="text-[9px] font-semibold text-brand">DY</Text>
      </View>
      <View>
        <Text className="mb-1.5 text-[9px] font-medium text-ink">{HR_ASSISTANT_NAME} yazıyor</Text>
        <View className="h-[18px] flex-row items-center gap-[5px] pl-0.5">
          {dots.map((dot, index) => (
            <Animated.View
              key={index}
              className="h-[6px] w-[6px] rounded-full bg-brand"
              style={{ opacity: dot, transform: [{ scale: dot }] }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function ChatInput({ draft, onChange, onSend, placeholder = 'Mesaj yazın', disabled = false }: { draft: string; onChange: (value: string) => void; onSend: () => void; placeholder?: string; disabled?: boolean }) {
  return (
    <View className="min-h-[52px] flex-row items-center rounded-[26px] border-[0.5px] border-line bg-[#FCFBF8] pl-4 pr-1.5">
      <TextInput
        value={draft}
        onChangeText={onChange}
        onSubmitEditing={onSend}
        placeholder={placeholder}
        placeholderTextColor="#A5A09B"
        className="h-[50px] flex-1 text-[12px] text-ink"
        returnKeyType="send"
      />
      <Pressable
        disabled={!draft.trim() || disabled}
        onPress={onSend}
        className={`h-10 w-10 items-center justify-center rounded-full bg-brand active:opacity-70 ${draft.trim() && !disabled ? '' : 'opacity-30'}`}
      >
        <Icon name="send" size={17} color={colors.white} />
      </Pressable>
    </View>
  );
}

function SurveyPage({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const surveyScrollRef = useRef<ScrollView>(null);
  const questionTransition = useRef(new Animated.Value(1)).current;
  const transitionDirection = useRef(1);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const selected = answers[step];
  const progress = ((step + 1) / surveyQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    surveyScrollRef.current?.scrollTo({ y: 0, animated: false });
    questionTransition.setValue(0);
    Animated.timing(questionTransition, {
      toValue: 1,
      duration: 230,
      useNativeDriver: true,
    }).start();
  }, [questionTransition, step]);

  const goToStep = (nextStep: number, direction: 1 | -1) => {
    transitionDirection.current = direction;
    setStep(nextStep);
  };

  const handleNext = () => {
    if (selected === undefined) return;
    if (step === surveyQuestions.length - 1) {
      setCompleted(true);
      return;
    }
    goToStep(step + 1, 1);
  };

  if (completed) {
    return <SurveyCompletion answeredCount={answeredCount} onClose={onClose} bottomInset={insets.bottom} />;
  }

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
          <Text className="text-[17px] font-medium tracking-[-0.25px] text-ink">Nabız Anketi</Text>
        </View>
        <View className="h-[52px] flex-1" />
      </View>

      <ScrollView ref={surveyScrollRef} className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[8px] font-semibold tracking-[1px] text-muted">{trUpper('Çalışan deneyimi')}</Text>
            <Text className="text-[9px] font-medium text-brand">Soru {step + 1} / {surveyQuestions.length}</Text>
          </View>
          <View className="mt-3 h-1 overflow-hidden rounded-full bg-[#E9E4DE]">
            <View className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
          </View>

          <Animated.View
            style={{
              opacity: questionTransition,
              transform: [{
                translateX: questionTransition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [transitionDirection.current * 18, 0],
                }),
              }],
            }}
          >
            <View className="pb-5 pt-8">
              <Text className="text-[8px] font-semibold tracking-[1px] text-brand">{trUpper(`${String(step + 1).padStart(2, '0')}. soru`)}</Text>
              <Text className="mt-3 text-[22px] font-medium leading-[29px] tracking-[-0.4px] text-ink">{surveyQuestions[step]}</Text>
              <Text className="mt-3 text-[9px] text-muted">Size en yakın yanıtı seçin.</Text>
            </View>

            <View className="overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
              {surveyAnswerOptions.map((label, index) => {
                const active = selected === index;
                return (
                  <Pressable
                    key={label}
                    onPress={() => setAnswers((current) => ({ ...current, [step]: index }))}
                    className={`relative min-h-[58px] flex-row items-center gap-3 px-4 active:opacity-70 ${active ? 'bg-[#FCF5F7]' : ''} ${index === surveyAnswerOptions.length - 1 ? '' : 'border-b-[0.5px] border-line'}`}
                  >
                    {active ? <View className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-brand" /> : null}
                    <Text className={`w-5 text-[9px] font-medium ${active ? 'text-brand' : 'text-muted'}`}>{String(index + 1).padStart(2, '0')}</Text>
                    <Text className={`flex-1 text-[10.5px] font-medium ${active ? 'text-brand' : 'text-ink'}`}>{label}</Text>
                    <View className={`h-[19px] w-[19px] items-center justify-center rounded-full border-[1.5px] ${active ? 'border-brand' : 'border-[#CEC8C2]'}`}>
                      {active ? <View className="h-[9px] w-[9px] rounded-full bg-brand" /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          <View className="mt-5 border-t-[0.5px] border-line pt-4">
            <Text className="text-[8px] font-semibold tracking-[0.8px] text-green">{trUpper('Gizli değerlendirme')}</Text>
            <Text className="mt-2 text-[8.5px] leading-[14px] text-muted">Yanıtlar bireysel olarak görüntülenmez; yalnızca ekip düzeyinde toplu değerlendirilir.</Text>
          </View>
        </View>
      </ScrollView>

      <View className="flex-row gap-3 border-t-[0.5px] border-line bg-white px-5 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 14) }}>
        <Pressable
          disabled={step === 0}
          onPress={() => goToStep(Math.max(0, step - 1), -1)}
          className={`h-[48px] w-[48px] items-center justify-center rounded-[16px] border-[0.5px] border-line bg-white active:opacity-60 ${step === 0 ? 'opacity-30' : ''}`}
        >
          <Icon name="back" size={24} color={colors.ink} />
        </Pressable>
        <Pressable
          disabled={selected === undefined}
          onPress={handleNext}
          className={`h-[48px] flex-1 flex-row items-center justify-center gap-2 rounded-[16px] bg-brand active:opacity-70 ${selected === undefined ? 'opacity-30' : ''}`}
        >
          <Text className="text-[12px] font-medium text-white">{step === surveyQuestions.length - 1 ? 'Gönder' : 'Devam'}</Text>
          {step === surveyQuestions.length - 1 ? <Icon name="check" size={17} color={colors.white} /> : null}
        </Pressable>
      </View>
    </View>
  );
}

function SurveyCompletion({ answeredCount, onClose, bottomInset }: { answeredCount: number; onClose: () => void; bottomInset: number }) {
  return (
    <View className="flex-1 bg-[#F8F6F2]">
      <StatusBar style="dark" />
      <View className="flex-1 justify-between px-5 pt-[94px]" style={{ paddingBottom: Math.max(bottomInset + 20, 36) }}>
        <View className="overflow-hidden rounded-[24px] border-[0.5px] border-line bg-white">
          <View className="h-1 bg-green" />
          <View className="px-5 py-6">
            <View className="flex-row items-center gap-2"><View className="h-7 w-7 items-center justify-center rounded-full bg-[#EAF5F1]"><Icon name="check" size={14} color={colors.green} /></View><Text className="text-[8.5px] font-medium tracking-[0.7px] text-green">{trUpper('Anket tamamlandı')}</Text></View>
            <Text className="mt-6 max-w-[300px] text-[25px] font-medium leading-[31px] tracking-[-0.5px] text-ink">Katılımınız için teşekkürler.</Text>
            <Text className="mt-3 max-w-[320px] text-[9.5px] leading-[15px] text-muted">Yanıtlarınız kaydedildi ve çalışma deneyimini geliştirmek üzere toplu değerlendirmeye alındı.</Text>

            <View className="mt-6 overflow-hidden border-t-[0.5px] border-line">
              <SurveyCompletionRow label="Tamamlanan" value={`${answeredCount}/${surveyQuestions.length} soru`} />
              <View className="h-[0.5px] bg-line" />
              <SurveyCompletionRow label="Gizlilik" value="Toplu değerlendirme" />
              <View className="h-[0.5px] bg-line" />
              <SurveyCompletionRow label="Durum" value="Kaydedildi" />
            </View>
          </View>
        </View>

        <Pressable onPress={onClose} className="h-[50px] items-center justify-center rounded-[16px] bg-brand active:opacity-80">
          <Text className="text-[12px] font-medium text-white">Tamam</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SurveyCompletionRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-h-[62px] flex-row items-center justify-between gap-4">
      <Text className="text-[9px] text-muted">{label}</Text>
      <Text className="text-[10px] font-medium text-ink">{value}</Text>
    </View>
  );
}

function RecognitionForm({ peers, selectedPerson, note, onSelect, onNote }: { peers: typeof recognitionMembers; selectedPerson: number | null; note: string; onSelect: (index: number) => void; onNote: (value: string) => void }) {
  return (
    <View>
      <View className="border-l-[3px] border-brand py-1 pl-4"><Text className="text-[17px] font-medium tracking-[-0.25px] text-ink">Katkıyı görünür kılın</Text><Text className="mt-2 max-w-[310px] text-[9.5px] leading-[15px] text-muted">Takdir etmek istediğiniz takım arkadaşınızı seçin ve katkısını kısaca anlatın.</Text></View>

      <View className="mt-6 flex-row items-center justify-between"><Text className="text-[13px] font-medium text-ink">Takım arkadaşı</Text><Text className="text-[8px] text-muted">Bir kişi seçin</Text></View>
      <View className="mt-3 overflow-hidden rounded-[22px] border-[0.5px] border-line bg-white">
        {peers.map((member, index) => {
          const selected = selectedPerson === index;
          return (
            <Pressable key={member.name} onPress={() => onSelect(index)} className={`relative min-h-[72px] flex-row items-center gap-3 px-4 active:bg-[#F7F5F1] ${selected ? 'bg-[#FCF5F7]' : ''} ${index === peers.length - 1 ? '' : 'border-b-[0.5px] border-line'}`}>
              {selected ? <View className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-brand" /> : null}
              <Image source={member.photo} className="h-10 w-10 rounded-full" />
              <View className="flex-1"><Text className="text-[11px] font-medium text-ink">{member.name}</Text><Text className="mt-1 text-[8.5px] text-muted">{member.team} · {member.hint}</Text></View>
              <View className={`h-[19px] w-[19px] items-center justify-center rounded-full border-[1.5px] ${selected ? 'border-brand' : 'border-[#CEC8C2]'}`}>{selected ? <View className="h-[9px] w-[9px] rounded-full bg-brand" /> : null}</View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6 flex-row items-center justify-between"><Text className="text-[13px] font-medium text-ink">Takdir notu</Text><Text className="text-[8px] text-muted">{note.length}/240</Text></View>
      <View className="mt-3 rounded-[20px] border-[0.5px] border-line bg-white px-4 py-4"><TextInput value={note} onChangeText={(value) => onNote(value.slice(0, 240))} multiline placeholder="Katkısını kısa ve açık biçimde anlatın…" placeholderTextColor="#AAA5A0" className="min-h-[125px] text-[11px] leading-[18px] text-ink" textAlignVertical="top" /></View>
    </View>
  );
}

function Rows({ rows }: { rows: readonly (readonly string[])[] }) {
  return <View className="border-y-[0.5px] border-line">{rows.map((row, index) => <View key={`${row[0]}-${index}`} className={`min-h-[70px] flex-row items-center gap-3 border-line py-3 ${index === rows.length - 1 ? 'border-b-0' : 'border-b-[0.5px]'}`}><View className="flex-1"><Text className="text-[13px] font-medium text-ink">{row[0]}</Text><Text className="mt-[5px] text-[10.5px] text-muted">{row[1]}</Text></View>{row[2] ? <Text className="overflow-hidden rounded-xl bg-[#F7ECEF] px-[9px] py-1.5 text-[10px] text-brand">{row[2]}</Text> : null}</View>)}</View>;
}

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} className={`h-[50px] items-center justify-center rounded-[15px] bg-brand active:opacity-70 ${disabled ? 'opacity-35' : ''}`}><Text className="text-[14px] font-medium text-white">{label}</Text></Pressable>;
}

function Success({ title, copy }: { title: string; copy: string }) {
  return <View className="items-center pt-10"><View className="h-16 w-16 items-center justify-center rounded-full bg-[#F7ECEF]"><Icon name="check" size={30} color={colors.brand} /></View><Text className="mt-[22px] text-[24px] font-normal leading-[30px] text-ink">{title}</Text><Text className="mt-3 text-center text-[12px] leading-5 text-muted">{copy}</Text></View>;
}
