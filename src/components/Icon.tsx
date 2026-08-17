import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import type { IconName } from '../types';

const iconMap: Record<IconName, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  home: 'home-outline',
  news: 'newspaper-variant-outline',
  shield: 'shield-alert-outline',
  star: 'star-outline',
  user: 'account-outline',
  food: 'silverware-fork-knife',
  bus: 'bus',
  survey: 'clipboard-check-outline',
  org: 'account-group-outline',
  calendar: 'calendar-month-outline',
  medical: 'hospital-box-outline',
  doc: 'file-document-outline',
  payroll: 'credit-card-outline',
  message: 'message-text-outline',
  phone: 'phone-outline',
  back: 'chevron-left',
  bell: 'bell-outline',
  plus: 'plus',
  settings: 'cog-outline',
  menu: 'dots-horizontal',
  arrowUpRight: 'arrow-top-right',
  send: 'send-outline',
  team: 'account-multiple-outline',
  check: 'check',
  clock: 'clock-outline',
  location: 'map-marker-outline',
  download: 'download-outline',
  close: 'close',
  chevronRight: 'chevron-right',
  idCard: 'badge-account-outline',
  building: 'office-building-outline',
  briefcase: 'briefcase-outline',
  filePdf: 'file-pdf-box',
  eye: 'eye-outline',
  lock: 'lock-outline',
  calendarCheck: 'calendar-check-outline',
  stethoscope: 'stethoscope',
  archive: 'archive-outline',
  pencil: 'pencil-outline',
  info: 'information-outline',
  logout: 'logout',
  warning: 'alert-outline',
  education: 'school-outline',
  procedure: 'text-box-check-outline',
};

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

export function Icon({ name, size = 22, color = colors.ink }: IconProps) {
  return <MaterialCommunityIcons name={iconMap[name]} size={size} color={color} />;
}
