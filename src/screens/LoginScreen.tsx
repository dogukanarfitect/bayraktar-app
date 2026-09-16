import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Application from 'expo-application';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeLinearGradient, StripedBackground } from '../components';

const MOCK_USERNAME = 'mehmet.yilmaz';
const MOCK_PASSWORD = 'Bayraktar2026';

export function LoginScreen({
  onLogin,
  topInset,
}: {
  onLogin: () => void;
  topInset: number;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const appVersion = Application.nativeApplicationVersion;

  const heroHeight = Math.max(
    430,
    Math.min(540, height * 0.52)
  );

  const passwordInputRef = useRef<TextInput>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (
      username.trim() === MOCK_USERNAME &&
      password === MOCK_PASSWORD
    ) {
      setError('');
      onLogin();
      return;
    }

    setError('Incorrect username or password.');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-soft"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
          style={{
            height: heroHeight,
            paddingTop: topInset,
          }}
        >
          <StripedBackground />

          <View className="flex-1 items-center justify-center pb-[52px] pt-5">
            <Image
              source={require('../../assets/logo-bayraktar.png')}
              className="h-[140px] w-[140px]"
              resizeMode="contain"
            />

            <Text className="-mt-1 text-[27px] font-normal tracking-[-0.7px] text-white">
              Bayraktar Mobile Portal
            </Text>

            <Text className="mt-4 max-w-[360px] text-center text-[14px] leading-[21px] text-white/90">
              Manage your daily workflows, notifications, and employee
              {Platform.OS === 'ios' ? '\n' : ' '}
              services from a single screen.
            </Text>
          </View>
        </NativeLinearGradient>

        <View
          className="z-10 mx-6 -mt-[54px] rounded-[24px] bg-white px-[22px] pb-[24px] pt-[22px]"
          style={{
            shadowColor: '#2A1D20',
            shadowOffset: {
              width: 0,
              height: 18,
            },
            shadowOpacity: 0.1,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <Text className="mb-[25px] text-[24px] font-normal tracking-[-0.4px] text-ink">
            Sign in to your account
          </Text>

          <Text className="mb-[8px] text-[13px] text-muted">
            Username
          </Text>

          <TextInput
            testID="username-input"
            value={username}
            onChangeText={(value) => {
              setUsername(value);

              if (error) {
                setError('');
              }
            }}
            placeholder="Enter your username"
            placeholderTextColor="#B5B0AB"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            selectionColor="#9F2F4D"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => {
              passwordInputRef.current?.focus();
            }}
            className="h-[54px] rounded-[16px] border border-[#EEEAE7] bg-white px-[16px] text-[14px] text-ink"
          />

          <Text className="mb-[8px] mt-[17px] text-[13px] text-muted">
            Password
          </Text>

          <TextInput
            ref={passwordInputRef}
            testID="password-input"
            value={password}
            onChangeText={(value) => {
              setPassword(value);

              if (error) {
                setError('');
              }
            }}
            placeholder="Enter your password"
            placeholderTextColor="#B5B0AB"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            selectionColor="#9F2F4D"
            className="h-[54px] rounded-[16px] border border-[#EEEAE7] bg-white px-[16px] text-[14px] text-ink"
          />

          {error ? (
            <Text
              testID="login-error"
              className="mt-3 text-[13px] text-[#C43B3B]"
            >
              {error}
            </Text>
          ) : null}

          <Pressable
            testID="login-button"
            onPress={handleLogin}
            className="mx-2 mt-[19px] h-[47px] items-center justify-center rounded-[15px] border border-[#E7B9C5] bg-white active:bg-[#FAF3F5]"
          >
            <Text className="text-[14px] font-medium text-brand">
              Sign In
            </Text>
          </Pressable>
        </View>

        <View
          className="min-h-[44px] flex-1 items-center justify-end"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          {appVersion ? (
            <Text testID="login-app-version" className="text-[12px] tracking-[-0.2px] text-muted">
              Bayraktar App version {appVersion}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}