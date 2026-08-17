import type { ModalId } from '../types';
import { BAYRA_INSTRUCTIONS } from './bayraPrompt';

export type BayraMessage = {
  role: 'user' | 'assistant';
  text: string;
  action?: BayraAction;
};

export type BayraAction = {
  label: string;
  target: ModalId;
};

export type BayraReply = {
  text: string;
  action?: BayraAction;
  source: 'remote' | 'fallback';
};

const REQUEST_TIMEOUT_MS = 7_000;
const REMOTE_RETRY_COOLDOWN_MS = 60_000;
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const OPENAI_MODEL = 'gpt-5.4';
let remoteUnavailableUntil = 0;
const modalTargets: ModalId[] = [
  'hrChat', 'aiChat', 'survey', 'foodMenu', 'serviceRoutes', 'employeeInfo', 'calendar',
  'doctorSchedule', 'documents', 'payroll', 'safetyTraining', 'safetyDocs', 'emergencyPhones',
  'riskReport', 'feedbackForm', 'send', 'newsDetail', 'notifications',
];

export async function requestBayraReply(messages: BayraMessage[]): Promise<BayraReply> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  if (!apiKey || Date.now() < remoteUnavailableUntil) return getStaticBayraReply(messages);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        reasoning: { effort: 'none' },
        instructions: BAYRA_INSTRUCTIONS,
        input: messages.map(({ role, text }) => ({ role, content: text })),
        max_output_tokens: 600,
        store: false,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
    if (!response.ok) {
      throw new Error(`OPENAI_API_${response.status}`);
    }

    const outputText = getOpenAIOutputText(payload);
    if (!outputText) throw new Error('BAYRA_EMPTY_RESPONSE');

    remoteUnavailableUntil = 0;
    return { ...parseBayraReply(outputText), source: 'remote' };
  } catch (error) {
    remoteUnavailableUntil = Date.now() + REMOTE_RETRY_COOLDOWN_MS;
    return getStaticBayraReply(messages);
  } finally {
    clearTimeout(timeout);
  }
}

export function getStaticBayraReply(messages: BayraMessage[]): BayraReply {
  const userMessages = messages.filter((message) => message.role === 'user').slice(-3);
  const currentQuestion = userMessages.at(-1)?.text ?? '';
  const context = userMessages.map((message) => message.text).join(' ').toLocaleLowerCase('tr-TR');
  const question = currentQuestion.toLocaleLowerCase('tr-TR');
  const domainTerms = [
    'servis', 'güzergah', 'otobüs', 'yemek', 'menü', 'öğle', 'izin', 'bakiye',
    'bordro', 'maaş', 'ücret', 'doküman', 'belge', 'el kitabı', 'prosedür',
    'doktor', 'revir', 'sağlık', 'takvim', 'önemli gün', 'etkinlik', 'isg',
    'eğitim', 'güvenlik', 'risk', 'acil', 'telefon', 'yardım', 'sos',
  ];
  const topicText = includesAny(question, domainTerms) ? question : context;

  if (includesAny(question, ['merhaba', 'selam', 'günaydın', 'iyi günler'])) {
    return fallback('Merhaba Mehmet. Size servis, yemek, izin, bordro, doküman ve İSG süreçleriyle ilgili demo veriler üzerinden yardımcı olabilirim.');
  }
  if (includesAny(question, ['teşekkür', 'sağ ol', 'sağol'])) {
    return fallback('Rica ederim. Başka bir çalışan hizmeti hakkında da soru sorabilirsiniz.');
  }
  if (includesAny(question, ['ne yapabilirsin', 'nasıl yardımcı', 'hangi konular'])) {
    return fallback('Servis saatleri, günlük yemek menüsü, izin bakiyesi, bordro, çalışan dokümanları, doktor takvimi ve İSG süreçleri hakkında demo yanıtlar verebilirim.');
  }
  if (includesAny(topicText, ['servis', 'güzergah', 'otobüs'])) {
    return fallback('Sincan–Eryaman servisi 18:10’da, Etimesgut servisi 18:20’de ve Batıkent servisi 18:25’te ana kapıdan hareket edecek.', 'Servisleri aç', 'serviceRoutes');
  }
  if (includesAny(topicText, ['yemek', 'menü', 'öğle'])) {
    return fallback('Bugünün menüsünde mercimek çorbası, etli türlü, pirinç pilavı, mevsim salata ve sütlaç bulunuyor.', 'Yemek listesini aç', 'foodMenu');
  }
  if (includesAny(topicText, ['izin', 'yıllık izin', 'bakiye'])) {
    return fallback('Demo çalışan verisine göre kullanılabilir yıllık izin bakiyeniz 9 gün.', 'Özlük bilgilerini aç', 'employeeInfo');
  }
  if (includesAny(topicText, ['bordro', 'maaş', 'ücret'])) {
    return fallback('Temmuz 2026 bordronuz hazır görünüyor. Bordro ve Özlük alanından görüntüleyebilirsiniz.', 'Bordroyu aç', 'payroll');
  }
  if (includesAny(topicText, ['doküman', 'belge', 'el kitabı', 'prosedür'])) {
    return fallback('Çalışan El Kitabı, İzin Süreci Rehberi ve güncel şirket dokümanları Dokümanlar alanında yer alıyor.', 'Dokümanları aç', 'documents');
  }
  if (includesAny(topicText, ['doktor', 'revir', 'sağlık'])) {
    return fallback('Demo takvime göre bugün revirde Dr. Ayşe Akın 09:00–16:00 saatleri arasında görevli.', 'Doktor takvimini aç', 'doctorSchedule');
  }
  if (includesAny(topicText, ['takvim', 'önemli gün', 'etkinlik'])) {
    return fallback('Yaklaşan kayıtlarda 14 Ağustos İSG saha denetimi ve 18 Ağustos aile buluşması kayıt sonu bulunuyor.', 'Takvimi aç', 'calendar');
  }
  if (includesAny(topicText, ['isg', 'eğitim', 'güvenlik', 'risk'])) {
    return fallback('Risk Farkındalığı eğitiminiz atanmış durumda. Acil olmayan risk bildirimlerini İSG araçlarından iletebilirsiniz.', 'İSG eğitimlerini aç', 'safetyTraining');
  }
  if (includesAny(topicText, ['acil', 'telefon', 'yardım', 'sos'])) {
    return fallback('Acil durumda uygulamadaki SOS alanını kullanın. İşyeri Güvenliği dahili numarası 2222, Tesis Reviri dahili numarası 2230’dur.', 'Acil telefonları aç', 'emergencyPhones');
  }

  return fallback('Şu anda yerel yanıt modundayım. Servis, yemek, izin, bordro, doküman, doktor takvimi veya İSG hakkında soru sorabilirsiniz.');
}

function fallback(text: string, label?: string, target?: ModalId): BayraReply {
  return {
    text,
    action: label && target ? { label, target } : undefined,
    source: 'fallback',
  };
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

export function getBayraErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message === 'OPENAI_API_KEY_MISSING') {
    return 'BAYRA prototip anahtarı henüz tanımlanmamış.';
  }
  if (message === 'BAYRA_TIMEOUT') {
    return 'Yanıt beklenenden uzun sürdü. Lütfen bağlantınızı kontrol edip tekrar deneyin.';
  }
  return 'Şu anda BAYRA hizmetine bağlanamıyorum. Lütfen biraz sonra tekrar deneyin.';
}

function getOpenAIOutputText(payload: Record<string, unknown> | null) {
  if (!payload) return '';

  const output = Array.isArray(payload.output) ? payload.output : [];
  return output
    .flatMap((item) => item && typeof item === 'object' && Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : [])
    .filter((item) => item && typeof item === 'object' && (item as { type?: unknown }).type === 'output_text')
    .map((item) => (item as { text?: unknown }).text)
    .filter((text): text is string => typeof text === 'string')
    .join('')
    .trim();
}

function parseBayraReply(outputText: string): Omit<BayraReply, 'source'> {
  const cleaned = outputText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const payload = JSON.parse(cleaned) as Record<string, unknown>;
    const text = typeof payload.text === 'string' ? payload.text.trim() : '';
    if (!text) throw new Error('BAYRA_EMPTY_RESPONSE');
    return { text, action: getResponseAction(payload.action) };
  } catch (error) {
    if (error instanceof Error && error.message === 'BAYRA_EMPTY_RESPONSE') throw error;
    return { text: cleaned };
  }
}

function getResponseAction(action: unknown): BayraAction | undefined {
  if (!action || typeof action !== 'object') return undefined;

  const { label, target } = action as Record<string, unknown>;
  if (typeof label !== 'string' || typeof target !== 'string' || !modalTargets.includes(target as ModalId)) return undefined;
  return { label, target: target as ModalId };
}
