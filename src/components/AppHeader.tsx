import { Image, Pressable, View } from 'react-native';
import { colors } from '../theme';
import type { ModalId, TabId } from '../types';
import { Icon } from './Icon';

type AppHeaderProps = {
  activeTab: TabId;
  topOffset?: number;
  light?: boolean;
  onTab: (tab: TabId) => void;
  onOpen: (id: ModalId) => void;
};

export function AppHeader({ activeTab, topOffset = 0, light = false, onTab, onOpen }: AppHeaderProps) {
  if (activeTab === 'home') return null;
  const actionIcon = activeTab === 'recognition' ? 'plus' : activeTab === 'profile' ? 'settings' : 'menu';
  const lightContent = light || activeTab === 'recognition';
  const contentColor = lightContent ? colors.white : colors.ink;

  const handleAction = () => {
    if (activeTab === 'recognition') onOpen('send');
  };
  const logo = (
    <Image
      source={require('../../assets/logo-bayraktar.png')}
      className="h-[46px] w-[84px]"
      resizeMode="contain"
      style={{ tintColor: lightContent ? colors.white : colors.brand }}
    />
  );

  return (
    <View className="-mx-5 px-5" style={{ height: 58 + topOffset, paddingTop: topOffset }}>
      {activeTab === 'news' || activeTab === 'profile' || activeTab === 'isg' ? <View className="h-full items-center justify-center">{logo}</View> : (
      <View className="h-full flex-row items-center justify-between">
        {activeTab === 'recognition' ? <View className="h-[38px] w-[38px]" /> : (
          <Pressable hitSlop={12} onPress={() => onTab('home')} className="h-[38px] w-[38px] items-center justify-center active:opacity-60">
            <Icon name="back" size={25} color={contentColor} />
          </Pressable>
        )}
        {logo}
        <Pressable hitSlop={12} onPress={handleAction} className="h-[38px] w-[38px] items-center justify-center active:opacity-60">
          <Icon name={actionIcon} size={21} color={contentColor} />
        </Pressable>
      </View>
      )}
    </View>
  );
}
