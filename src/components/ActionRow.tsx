import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';
import type { IconName } from '../types';
import { Icon } from './Icon';

type ActionRowProps = {
  icon: IconName;
  title: string;
  desc: string;
  onPress: () => void;
  last?: boolean;
  variant?: 'card' | 'plain';
};

export function ActionRow({ icon, title, desc, onPress, last = false, variant = 'card' }: ActionRowProps) {
  const plain = variant === 'plain';
  return (
    <Pressable onPress={onPress} className={`flex-row items-center gap-[13px] border-line py-3 active:opacity-60 ${plain ? 'min-h-[66px] px-0' : 'min-h-[74px] px-4'} ${last ? 'border-b-0' : 'border-b-[0.5px]'}`}>
      {plain ? (
        <View className="h-[48px] w-[48px] items-center justify-center rounded-full border-2 border-[#F0D8DE] bg-[#FBF6F7]">
          <View className="h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-[#F5E6E9]"><Icon name={icon} size={20} color={colors.brand} /></View>
        </View>
      ) : (
        <View className="h-[38px] w-[38px] items-center justify-center rounded-[13px] bg-[#F8EFF1]"><Icon name={icon} size={20} color={colors.brand} /></View>
      )}
      <View className="flex-1">
        <Text className="text-[13px] font-medium text-ink">{title}</Text>
        <Text className="mt-1 text-[10.5px] leading-[15px] text-muted">{desc}</Text>
      </View>
      {plain ? null : <MaterialCommunityIcons name="chevron-right" size={20} color="#B1ADA8" />}
    </Pressable>
  );
}
