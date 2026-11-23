import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useAppDispatch, useAppSelector} from '../store';
import {login} from '../store/slices/authSlice';
import {appleTheme, appleSpacing, appleRadius, appleTypography, appleShadow} from '../theme/apple';
import {AppleButton} from '../components/AppleButton';
import {AppleInput} from '../components/AppleInput';

export function SplashScreen() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!hydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={appleTheme.colors.systemBlue} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appleTheme.colors.systemBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
