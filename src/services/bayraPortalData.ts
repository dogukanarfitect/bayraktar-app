import { detailContent, weeklyFoodMenus } from '../data';
import { doctorDays, employeeDocuments, employeePayrollSummary } from '../modals/EmployeeServicesPages';
import { pinarbasiServiceData } from '../modals/ServiceRoutesPage';
import { emergencyContacts, safetyDocuments, trainingItems } from '../modals/SafetyServicePages';

export const BAYRA_PORTAL_DATA = {
  employee: {
    name: 'Mehmet Yılmaz',
    employeeId: 'BYK-2482',
    title: 'Üretim Operatörü',
    department: 'Üretim · Hat 2',
    facility: 'Tesis 2',
    shift: 'A vardiyası',
  },
  foodMenus: weeklyFoodMenus,
  service: {
    name: pinarbasiServiceData.name,
    address: pinarbasiServiceData.address,
    departure: pinarbasiServiceData.departure,
    duration: pinarbasiServiceData.duration,
    plate: pinarbasiServiceData.plate,
    stops: pinarbasiServiceData.stops.map(({ name, hint, time }) => ({ name, hint, time })),
  },
  payroll: employeePayrollSummary,
  doctorSchedule: doctorDays,
  documents: employeeDocuments.map(({ title, category, date, badge }) => ({ title, category, date, badge })),
  safetyTrainings: trainingItems,
  safetyProcedures: safetyDocuments.map(({ title, category, revision, updated }) => ({ title, category, revision, updated })),
  emergencyContacts: emergencyContacts.map(({ title, desc, number }) => ({ title, desc, number })),
  calendar: detailContent.calendar.rows.map(([date, title, time]) => ({ date, title, time })),
} as const;
