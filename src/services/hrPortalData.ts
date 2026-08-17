import { detailContent, surveyQuestions } from '../data';
import { employeeDocuments, employeePayrollSummary } from '../modals/EmployeeServicesPages';

export const HR_PORTAL_DATA = {
  employee: {
    name: 'Mehmet Yılmaz',
    employeeId: 'BYK-2482',
    title: 'Üretim Operatörü',
    department: 'Üretim · Hat 2',
    facility: 'Tesis 2',
    shift: 'A vardiyası',
    manager: 'Ahmet Demir',
    status: 'Aktif',
  },
  leave: {
    availableBalance: employeePayrollSummary.leaveBalance,
    seniority: employeePayrollSummary.seniority,
    status: 'Aktif',
  },
  payroll: employeePayrollSummary,
  documents: employeeDocuments.map(({ id, title, category, meta, date, badge }) => ({
    id,
    title,
    category,
    meta,
    date,
    badge,
  })),
  calendar: detailContent.calendar.rows.map(([date, title, time]) => ({ date, title, time })),
  survey: {
    status: 'Açık',
    title: 'Ağustos nabız anketi',
    questions: surveyQuestions,
  },
  feedback: {
    categories: ['Görüş', 'Öneri', 'Şikayet'],
    channel: 'Mobil portal',
    lastSubmission: null,
  },
  notifications: detailContent.notifications.rows.map(([title, copy, time]) => ({ title, copy, time })),
} as const;
