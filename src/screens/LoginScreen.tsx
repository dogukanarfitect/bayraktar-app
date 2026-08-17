import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { NativeLinearGradient, StripedBackground } from '../components';

export function LoginScreen({ onLogin, topInset }: { onLogin: () => void; topInset: number }) {
  const { height } = useWindowDimensions();
  const heroHeight = Math.max(430, Math.min(540, height * 0.52));

  return (
    <KeyboardAvoidingView className="flex-1 bg-soft" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow bg-soft"
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <NativeLinearGradient
          colors={['#B54163', '#9E2E4F', '#731A34']}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="items-center overflow-hidden rounded-b-[34px] px-[28px]"
          style={{ height: heroHeight, paddingTop: topInset }}
        >
          <StripedBackground />
          <View className="flex-1 items-center justify-center pb-[52px] pt-5">
            <Image source={require('../../assets/logo-bayraktar.png')} className="h-[140px] w-[140px]" resizeMode="contain" />
            <Text className="-mt-1 text-[27px] font-normal tracking-[-0.7px] text-white">Bayraktar Mobil Portal</Text>
            <Text className="mt-4 max-w-[360px] text-center text-[14px] leading-[21px] text-white/90">
              Günlük akışlarınızı, bildirimlerinizi ve çalışan{Platform.OS === 'ios' ? '\n' : ' '}hizmetlerini tek ekrandan yönetin.
            </Text>
          </View>
        </NativeLinearGradient>

        <View
          className="z-10 mx-6 -mt-[54px] rounded-[24px] bg-white px-[22px] pb-[24px] pt-[22px]"
          style={{
            shadowColor: '#2A1D20',
            shadowOffset: { width: 0, height: 18 },
            shadowOpacity: 0.1,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <Text className="mb-[25px] text-[24px] font-normal tracking-[-0.4px] text-ink">Hesabınıza giriş yapın</Text>

          <Text className="mb-[8px] text-[13px] text-muted">Kullanıcı</Text>
          <TextInput
            value="mehmet.yilmaz"
            editable={false}
            selectionColor="#9F2F4D"
            className="h-[54px] rounded-[16px] border border-[#EEEAE7] bg-white px-[16px] text-[14px] text-ink"
            style={{ shadowColor: '#33282A', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.05, shadowRadius: 12 }}
          />

          <Text className="mb-[8px] mt-[17px] text-[13px] text-muted">Şifre</Text>
          <TextInput
            value="Bayraktar2026"
            editable={false}
            secureTextEntry
            selectionColor="#9F2F4D"
            className="h-[54px] rounded-[16px] border border-[#EEEAE7] bg-white px-[16px] text-[14px] text-ink"
            style={{ shadowColor: '#33282A', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.05, shadowRadius: 12 }}
          />

          <Pressable
            onPress={onLogin}
            className="mx-2 mt-[19px] h-[47px] items-center justify-center rounded-[15px] border border-[#E7B9C5] bg-white active:bg-[#FAF3F5]"
          >
            <Text className="text-[14px] font-medium text-brand">Giriş Yap</Text>
          </Pressable>
        </View>

        <View className="min-h-[44px] flex-1" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
