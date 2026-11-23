import React, {useEffect, useState} from 'react';
import {StatusBar, View, Text, ActivityIndicator, StyleSheet, LogBox} from 'react-native';
import {Provider as ReduxProvider} from 'react-redux';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {store} from './src/store';
import {AppNavigator} from './src/navigation/AppNavigator';
import {storage} from './src/services/storage';
import {fetchProfile} from './src/store/slices/authSlice';
import {initializeApp} from './src/store/slices/initSlice';
import {appleTheme} from './src/theme/apple';

LogBox.ignoreLogs(['new NativeEventEmitter']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function App(): React.JSX.Element {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await storage.getAccessToken();
      if (token) {
        store.dispatch(fetchProfile());
      }
      await store.dispatch(initializeApp());
      setHydrated(true);
    })();
  }, []);

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <StatusBar barStyle="light-content" backgroundColor={appleTheme.colors.systemBlue} />
        <View style={styles.logoCircle}>
          <View style={styles.logoInner}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.title}>CampusERP</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <StatusBar barStyle="default" backgroundColor={appleTheme.colors.systemBackground} />
            <AppNavigator />
          </SafeAreaProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: appleTheme.colors.systemBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: appleTheme.spacing.lg,
  },
  logoInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appleTheme.colors.systemBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: appleTheme.typography.title2.fontSize,
    fontWeight: '700' as const,
    letterSpacing: appleTheme.typography.title2.letterSpacing,
  },
});

export default App;
