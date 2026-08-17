import type { ModalId } from '../types';
import { BAYRA_PORTAL_DATA } from './bayraPortalData';

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
};

const REQUEST_TIMEOUT_MS = 12_000;
const modalTargets: ModalId[] = [
  'hrChat', 'aiChat', 'survey', 'foodMenu', 'serviceRoutes', 'employeeInfo', 'calendar',
  'doctorSchedule', 'documents', 'payroll', 'safetyTraining', 'safetyDocs', 'emergencyPhones',
  'riskReport', 'feedbackForm', 'send', 'newsDetail', 'notifications',
];

export function createBayraSessionId() {
  return `bayra-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function requestBayraReply(messages: BayraMessage[], sessionId: string): Promise<BayraReply> {
  const webhookUrl = process.env.EXPO_PUBLIC_BAYRA_WEBHOOK_URL?.trim();
  if (!webhookUrl) throw new Error('BAYRA_WEBHOOK_URL_MISSING');

  const message = [...messages].reverse().find((item) => item.role === 'user')?.text.trim();
  if (!message) throw new Error('BAYRA_MESSAGE_MISSING');
  if (!sessionId.trim()) throw new Error('BAYRA_SESSION_MISSING');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId,
        portalData: BAYRA_PORTAL_DATA,
      }),
      signal: controller.signal,
    });

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`BAYRA_WEBHOOK_${response.status}`);
    return parseWebhookReply(payload);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('BAYRA_TIMEOUT');
    if (error instanceof Error) throw error;
    throw new Error('BAYRA_NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}

export function getBayraErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message === 'BAYRA_WEBHOOK_URL_MISSING') return 'BAYRA bağlantı adresi yapılandırılmamış.';
  if (message === 'BAYRA_TIMEOUT') return 'BAYRA yanıt vermedi. Bağlantınızı kontrol edip tekrar deneyin.';
  if (message.startsWith('BAYRA_WEBHOOK_')) return 'BAYRA servisi şu anda isteği tamamlayamadı. Lütfen tekrar deneyin.';
  return 'BAYRA servisine bağlanılamadı. Lütfen bağlantınızı kontrol edip tekrar deneyin.';
}

function parseWebhookReply(payload: unknown): BayraReply {
  const root = Array.isArray(payload) ? payload[0] : payload;
  if (typeof root === 'string') return parseWebhookText(root);
  if (!root || typeof root !== 'object') throw new Error('BAYRA_EMPTY_RESPONSE');

  const rootRecord = root as Record<string, unknown>;
  const value = rootRecord.data ?? rootRecord;
  if (typeof value === 'string') return parseWebhookText(value);
  if (!value || typeof value !== 'object') throw new Error('BAYRA_EMPTY_RESPONSE');

  const record = value as Record<string, unknown>;
  const nested = [record.output, record.reply, record.response, record.result]
    .find((item) => item !== null && typeof item === 'object');
  if (nested) return parseWebhookReply(nested);

  const textValue = [record.text, record.output, record.reply, record.response, record.message]
    .find((item) => typeof item === 'string');
  if (typeof textValue !== 'string' || !textValue.trim()) throw new Error('BAYRA_EMPTY_RESPONSE');

  const cleaned = textValue.trim();
  if ((cleaned.startsWith('{') && cleaned.endsWith('}')) || (cleaned.startsWith('[') && cleaned.endsWith(']'))) {
    try {
      return parseWebhookReply(JSON.parse(cleaned));
    } catch {
      // JSON görünümündeki düz metinler kullanıcıya olduğu gibi gösterilir.
    }
  }
  return { text: cleaned, action: getResponseAction(record.action) };
}

function parseWebhookText(value: string): BayraReply {
  const cleaned = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  if (!cleaned) throw new Error('BAYRA_EMPTY_RESPONSE');
  try {
    return parseWebhookReply(JSON.parse(cleaned));
  } catch {
    return { text: cleaned };
  }
}

function getResponseAction(action: unknown): BayraAction | undefined {
  if (!action || typeof action !== 'object') return undefined;
  const { label, target } = action as Record<string, unknown>;
  if (typeof label !== 'string' || typeof target !== 'string' || !modalTargets.includes(target as ModalId)) return undefined;
  return { label, target: target as ModalId };
}
