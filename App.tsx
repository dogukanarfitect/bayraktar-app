import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Easing, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, BottomNav, SplashScreen } from './src/components';
import { DetailModal } from './src/modals';
import { HomeScreen, LoginScreen, NewsScreen, ProfileScreen, RecognitionScreen, SafetyScreen } from './src/screens';
import type { ModalId, NewsItem, TabId } from './src/types';
import { ForceUpdateScreen } from './src/update/ForceUpdateScreen';
import { OptionalUpdateModal } from './src/update/OptionalUpdateModal';
import { useIosUpdateGate } from './src/update/useIosUpdateGate';
import './global.css';

export default function App() {
  return <SafeAreaProvider><Portal /></SafeAreaProvider>;
}

function Portal() {
  const insets = useSafeAreaInsets();
  const updateGate = useIosUpdateGate();
  const [splashVisible, setSplashVisible] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginTransition, setLoginTransition] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [modal, setModal] = useState<ModalId | null>(null);
  const [returnModal, setReturnModal] = useState<ModalId | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [sosActive, setSosActive] = useState(false);
  const [sentRecognitionCount, setSentRecognitionCount] = useState(8);
  const homeIsVisible = loggedIn && activeTab === 'home';
  const recognitionIsVisible = loggedIn && activeTab === 'recognition';
  const profileIsVisible = loggedIn && activeTab === 'profile';
  const heroIsVisible = homeIsVisible || recognitionIsVisible || profileIsVisible;
  const lightStatusBar = !loggedIn || heroIsVisible;

  const openModal = useCallback((id: ModalId) => {
    if (id === 'notifications') setNotificationCount(0);
    setReturnModal(null);
    setModal(id);
  }, []);

  const navigateModal = useCallback((id: ModalId) => {
    setReturnModal(modal);
    setModal(id);
  }, [modal]);

  const closeModal = useCallback(() => {
    if (returnModal) {
      setModal(returnModal);
      setReturnModal(null);
      return;
    }
    setModal(null);
    setSelectedNews(null);
  }, [returnModal]);

  const openNews = useCallback((item: NewsItem) => {
    setSelectedNews(item);
    setModal('newsDetail');
  }, []);

  const finishLogin = useCallback(() => {
    setLoginTransition(true);
    setTimeout(() => {
      setLoggedIn(true);
      setLoginTransition(false);
    }, 1200);
  }, []);

  const logout = useCallback(() => {
    closeModal();
    setActiveTab('home');
    setLoggedIn(false);
  }, [closeModal]);

  useEffect(() => {
    if (updateGate.decision.kind === 'force') {
      setModal(null);
      setReturnModal(null);
      setSelectedNews(null);
    }
  }, [updateGate.decision.kind]);

  // Replace the entire portal so native modals and other interactive content unmount.
  if (updateGate.decision.kind === 'force' && updateGate.decision.policy) {
    return (
      <View className="flex-1 bg-brand">
        <StatusBar style="light" />
        <ForceUpdateScreen
          policy={updateGate.decision.policy}
          refreshing={updateGate.initializing || updateGate.refreshing}
          onUpdate={() => { void updateGate.openStore(); }}
          onRetry={() => { void updateGate.refresh(); }}
        />
      </View>
    );
  }

  if (updateGate.initializing) {
    return (
      <View testID="ios-update-loading" className="flex-1 items-center justify-center bg-brand" accessibilityRole="progressbar" accessibilityLabel="Güncelleme kontrol ediliyor">
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="mt-4 text-[14px] text-white">Güncelleme kontrol ediliyor…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style={lightStatusBar ? 'light' : 'dark'} />
      <View style={{ height: lightStatusBar ? 0 : insets.top, backgroundColor: '#F7F6F2' }} />

      {loggedIn ? (
        <View className="flex-1">
          <View className={activeTab === 'home' || activeTab === 'profile' || activeTab === 'recognition' ? 'flex-1 bg-[#AD4565]' : 'flex-1 bg-soft'}>
            <TabScene key={activeTab}>
              <ActiveScreen
                activeTab={activeTab}
                topInset={insets.top}
                sentRecognitionCount={sentRecognitionCount}
                notificationCount={notificationCount}
                sosActive={sosActive}
                onOpen={openModal}
                onNews={openNews}
                onTab={setActiveTab}
                onLogout={logout}
                onToggleSos={() => setSosActive((value) => !value)}
              />
            </TabScene>
          </View>
          <BottomNav activeTab={activeTab} bottomInset={insets.bottom} sosActive={sosActive} onTab={setActiveTab} onAiNavigate={openModal} />
        </View>
      ) : <LoginScreen topInset={insets.top} onLogin={finishLogin} />}

      {splashVisible || loginTransition ? <SplashScreen onDone={() => setSplashVisible(false)} persistent={loginTransition} /> : null}
      <DetailModal modal={modal} selectedNews={selectedNews} onClose={closeModal} onNavigate={navigateModal} onSent={() => setSentRecognitionCount((value) => value + 1)} />
      {updateGate.decision.kind === 'optional' && updateGate.decision.policy ? (
        <OptionalUpdateModal
          policy={updateGate.decision.policy}
          onUpdate={() => { void updateGate.openStore(); }}
          onLater={updateGate.dismissOptional}
        />
      ) : null}
    </View>
  );
}

function TabScene({ children }: { children: ReactNode }) {
  const transition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(transition, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [transition]);

  return (
    <Animated.View
      className="flex-1"
      style={{
        opacity: transition,
        transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

type ActiveScreenProps = {
  activeTab: TabId;
  topInset: number;
  sentRecognitionCount: number;
  notificationCount: number;
  sosActive: boolean;
  onOpen: (id: ModalId) => void;
  onNews: (item: NewsItem) => void;
  onTab: (tab: TabId) => void;
  onLogout: () => void;
  onToggleSos: () => void;
};

function ActiveScreen({ activeTab, topInset, sentRecognitionCount, notificationCount, sosActive, onOpen, onNews, onTab, onLogout, onToggleSos }: ActiveScreenProps) {
  const profileHero = activeTab === 'profile';
  const header = <AppHeader activeTab={activeTab} topOffset={activeTab === 'recognition' || profileHero ? topInset : 0} light={profileHero} onTab={onTab} onOpen={onOpen} />;

  switch (activeTab) {
    case 'news': return <NewsScreen header={header} onNews={onNews} />;
    case 'isg': return <SafetyScreen header={header} active={sosActive} onToggle={onToggleSos} onOpen={onOpen} />;
    case 'recognition': return <RecognitionScreen header={header} sentCount={sentRecognitionCount} onOpen={onOpen} />;
    case 'profile': return <ProfileScreen header={header} onOpen={onOpen} onLogout={onLogout} />;
    default: return <HomeScreen topInset={topInset} notifCount={notificationCount} onOpen={onOpen} onNews={onNews} onProfile={() => onTab('profile')} />;
  }
}
