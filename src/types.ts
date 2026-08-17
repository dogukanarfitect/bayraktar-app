export type TabId = 'home' | 'news' | 'isg' | 'recognition' | 'profile';

export type ModalId =
  | 'hrChat'
  | 'aiChat'
  | 'survey'
  | 'foodMenu'
  | 'serviceRoutes'
  | 'employeeInfo'
  | 'calendar'
  | 'doctorSchedule'
  | 'documents'
  | 'payroll'
  | 'safetyTraining'
  | 'safetyDocs'
  | 'emergencyPhones'
  | 'riskReport'
  | 'feedbackForm'
  | 'send'
  | 'newsDetail'
  | 'notifications';

export type IconName =
  | 'home' | 'news' | 'shield' | 'star' | 'user' | 'food' | 'bus'
  | 'survey' | 'org' | 'calendar' | 'medical' | 'doc' | 'payroll'
  | 'message' | 'phone' | 'back' | 'bell' | 'plus' | 'settings'
  | 'menu' | 'arrowUpRight' | 'send' | 'team' | 'check' | 'clock'
  | 'location' | 'download' | 'close' | 'chevronRight' | 'idCard'
  | 'building' | 'briefcase' | 'filePdf' | 'eye' | 'lock'
  | 'calendarCheck' | 'stethoscope' | 'archive' | 'pencil' | 'info'
  | 'logout' | 'warning' | 'education' | 'procedure';

export type ActionItem = {
  id: ModalId;
  title: string;
  desc: string;
  icon: IconName;
};

export type NewsItem = {
  id: string;
  title: string;
  category: 'Duyuru' | 'İSG' | 'Etkinlik' | 'İK';
  date: string;
  image: string;
  summary: string;
  detail: string;
};

export type RecognitionMember = {
  name: string;
  team: string;
  hint: string;
  photo: number;
  points: string;
};
