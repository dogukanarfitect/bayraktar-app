import { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { detailContent } from '../data';
import { colors } from '../theme';
import { trLower, trUpper } from '../turkishText';
import type { ModalId } from '../types';
import { Icon } from './Icon';

type AiMessage = {
  role: 'user' | 'assistant';
  text: string;
  action?: { label: string; target: ModalId };
};

type BayraResponse = {
  text: string;
  action?: { label: string; target: ModalId };
};

type ReplyPhase = 'idle' | 'thinking' | 'streaming';

const AI_ASSISTANT_NAME = 'BAYRA';
const AI_WELCOME_MESSAGE = 'Merhaba Mehmet, ben BAYRA – Bayraktar Akıllı Hizmet Asistanı. İzin bakiyeniz, servis saatleri, günlük yemek menüsü, bordro, dokümanlar ve İSG konularında size hızlıca yardımcı olabilirim. Nasıl yardımcı olabilirim?';
const suggestions = ['Bugünkü yemek menüsü nedir?', 'Servisim saat kaçta?', 'Kaç gün iznim kaldı?'];

export function BayraChatPage({ onClose, onNavigate }: { onClose: () => void; onNavigate: (id: ModalId) => void }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const replyDelayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [draft, setDraft] = useState('');
  const [replyPhase, setReplyPhase] = useState<ReplyPhase>('idle');
  const [conversation, setConversation] = useState<AiMessage[]>([{ role: 'assistant', text: AI_WELCOME_MESSAGE }]);
  const showSuggestions = !conversation.some((message) => message.role === 'user');
  const replying = replyPhase !== 'idle';

  useEffect(() => () => {
    if (replyDelayTimer.current) clearTimeout(replyDelayTimer.current);
    if (streamTimer.current) clearInterval(streamTimer.current);
  }, []);

  const sendMessage = (value = draft) => {
    const question = value.trim();
    if (!question || replying) return;
    setDraft('');
    setReplyPhase('thinking');
    setConversation((current) => [...current, { role: 'user', text: question }]);
    const response = getBayraResponse(question);

    replyDelayTimer.current = setTimeout(() => {
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
    }, 320);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#FCFBF8]" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-row items-end border-b-[0.5px] border-line px-5 pb-2" style={{ paddingTop: Math.max(insets.top, 12) }}>
        <View className="h-[52px] flex-1 justify-center">
          <Pressable hitSlop={12} onPress={onClose} className="h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-line bg-white active:opacity-60">
            <Icon name="back" size={25} color={colors.ink} />
          </Pressable>
        </View>
        <View className="h-[52px] flex-row items-center justify-center gap-[9px]">
          <Image source={require('../../assets/chatbot-icon.png')} resizeMode="contain" style={{ width: 30, height: 30, tintColor: colors.brand }} />
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
                <Image source={require('../../assets/chatbot-icon.png')} resizeMode="contain" style={{ width: 18, height: 18, tintColor: colors.brand }} />
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

          {replyPhase === 'thinking' ? (
            <View className="flex-row items-center gap-2">
              <View className="h-1.5 w-1.5 rounded-full bg-brand/70" />
              <Text className="text-[10px] text-muted">{AI_ASSISTANT_NAME} yanıt hazırlıyor…</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View className="border-t-[0.5px] border-line bg-white px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <View className="min-h-[50px] flex-row items-center rounded-[22px] border-[0.5px] border-line bg-[#FCFBF8] pl-4 pr-[5px]">
          <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={() => sendMessage()} placeholder="Mesajınızı yazın" placeholderTextColor="#A5A09B" className="h-[48px] flex-1 text-[12px] text-ink" returnKeyType="send" />
          <Pressable disabled={!draft.trim() || replying} onPress={() => sendMessage()} className={`h-10 w-10 items-center justify-center rounded-full bg-brand active:opacity-70 ${!draft.trim() || replying ? 'opacity-30' : ''}`}>
            <Icon name="send" size={17} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function getBayraResponse(message: string): BayraResponse {
  const normalized = trLower(message);

  if (normalized.includes('servis')) {
    return { text: 'Pınarbaşı Hattı servisi 17:40’ta hareket ediyor. Tahmini yolculuk süresi 32 dakika. Güncel durak ve güzergâh bilgilerini Servisler sayfasından görüntüleyebilirsiniz.', action: { label: 'Servis hattını aç', target: 'serviceRoutes' } };
  }

  if (normalized.includes('yemek') || normalized.includes('menü')) {
    const menuItems = detailContent.foodMenu.rows.map((row) => row[1]).join(', ');
    return { text: `Bugünün menüsü: ${menuItems}. Ayrıntılı haftalık listeyi Yemek Listesi sayfasından görebilirsiniz.`, action: { label: 'Yemek listesini aç', target: 'foodMenu' } };
  }

  if (normalized.includes('izin')) {
    return { text: 'Güncel izin bakiyeniz güvenlik nedeniyle burada maskeli gösteriliyor. Bordro ve özlük özetinizden kontrol edebilirsiniz.', action: { label: 'Bordro ve izinleri aç', target: 'payroll' } };
  }

  if (normalized.includes('bordro') || normalized.includes('maaş')) {
    return { text: 'Güncel bordronuz hazır. Bordro sayfasından görüntüleyebilir veya PDF olarak indirebilirsiniz.', action: { label: 'Bordroyu aç', target: 'payroll' } };
  }

  if (normalized.includes('doküman') || normalized.includes('belge')) {
    return { text: 'Güncel çalışan belgeleri ve şirket dokümanları Dokümanlar sayfasında kategori bazında listeleniyor.', action: { label: 'Dokümanları aç', target: 'documents' } };
  }

  if (normalized.includes('doktor') || normalized.includes('revir') || normalized.includes('randevu')) {
    return { text: 'Revir ve doktor uygunluk saatlerini görüntüleyebilir, uygun tarih ve saat seçerek randevu talebi oluşturabilirsiniz.', action: { label: 'Doktor takvimini aç', target: 'doctorSchedule' } };
  }

  if (normalized.includes('sos') || normalized.includes('acil') || normalized.includes('telefon')) {
    return { text: 'Hayati tehlike varsa uygulamadaki SOS alanını kullanın. Tesis güvenliği ve revir numaraları Acil Telefonlar sayfasında yer alıyor.', action: { label: 'Acil telefonları aç', target: 'emergencyPhones' } };
  }

  if (normalized.includes('isg') || normalized.includes('güvenlik') || normalized.includes('eğitim')) {
    return { text: 'Atanmış İSG eğitimlerinizi ve tamamlanma durumlarını İSG Eğitimleri sayfasından takip edebilirsiniz.', action: { label: 'İSG eğitimlerini aç', target: 'safetyTraining' } };
  }

  return { text: 'Ben BAYRA. Servis, yemek, izin, bordro, doküman, doktor takvimi ve İSG ekranlarındaki bilgilerle yardımcı olabilirim. Hangi bilgiyi görmek istediğinizi yazabilirsiniz.' };
}
