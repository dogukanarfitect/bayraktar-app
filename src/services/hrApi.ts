import { HR_PORTAL_DATA } from './hrPortalData';

export type HrReply = {
  text: string;
};

const REQUEST_TIMEOUT_MS = 12_000;

export function createHrSessionId() {
  return `hr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function requestHrReply(message: string, sessionId: string): Promise<HrReply> {
  const webhookUrl = process.env.EXPO_PUBLIC_HR_WEBHOOK_URL?.trim();
  if (!webhookUrl) throw new Error('HR_WEBHOOK_URL_MISSING');

  const cleanedMessage = message.trim();
  if (!cleanedMessage) throw new Error('HR_MESSAGE_MISSING');
  if (!sessionId.trim()) throw new Error('HR_SESSION_MISSING');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: cleanedMessage,
        sessionId,
        portalData: HR_PORTAL_DATA,
      }),
      signal: controller.signal,
    });

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`HR_WEBHOOK_${response.status}`);
    return parseWebhookReply(payload);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('HR_TIMEOUT');
    if (error instanceof Error) throw error;
    throw new Error('HR_NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}

export function getHrErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message === 'HR_WEBHOOK_URL_MISSING') return 'İK asistanı bağlantı adresi yapılandırılmamış.';
  if (message === 'HR_TIMEOUT') return 'İK asistanı yanıt vermedi. Bağlantınızı kontrol edip tekrar deneyin.';
  if (message.startsWith('HR_WEBHOOK_')) return 'İK asistanı şu anda isteği tamamlayamadı. Lütfen tekrar deneyin.';
  return 'İK asistanına bağlanılamadı. Lütfen bağlantınızı kontrol edip tekrar deneyin.';
}

function parseWebhookReply(payload: unknown): HrReply {
  const root = Array.isArray(payload) ? payload[0] : payload;
  if (typeof root === 'string') return parseWebhookText(root);
  if (!root || typeof root !== 'object') throw new Error('HR_EMPTY_RESPONSE');

  const rootRecord = root as Record<string, unknown>;
  const value = rootRecord.data ?? rootRecord;
  if (typeof value === 'string') return parseWebhookText(value);
  if (!value || typeof value !== 'object') throw new Error('HR_EMPTY_RESPONSE');

  const record = value as Record<string, unknown>;
  const nested = [record.output, record.reply, record.response, record.result]
    .find((item) => item !== null && typeof item === 'object');
  if (nested) return parseWebhookReply(nested);

  const textValue = [record.text, record.output, record.reply, record.response, record.message]
    .find((item) => typeof item === 'string');
  if (typeof textValue !== 'string' || !textValue.trim()) throw new Error('HR_EMPTY_RESPONSE');

  const cleaned = textValue.trim();
  if ((cleaned.startsWith('{') && cleaned.endsWith('}')) || (cleaned.startsWith('[') && cleaned.endsWith(']'))) {
    try {
      return parseWebhookReply(JSON.parse(cleaned));
    } catch {
      // JSON görünümündeki düz metinler kullanıcıya olduğu gibi gösterilir.
    }
  }
  return { text: cleaned };
}

function parseWebhookText(value: string): HrReply {
  const cleaned = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  if (!cleaned) throw new Error('HR_EMPTY_RESPONSE');
  try {
    return parseWebhookReply(JSON.parse(cleaned));
  } catch {
    return { text: cleaned };
  }
}
