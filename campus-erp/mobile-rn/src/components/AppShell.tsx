import React, {ReactNode} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useAppSelector} from '../store';
import {colors, spacing, fontSize, fontWeight} from '../theme';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  noGradient?: boolean;
}

export function AppShell({
  children,
  title,
  subtitle,
  scroll = true,
  refreshing = false,
  onRefresh,
  noGradient = false,
}: AppShellProps) {
  const {user} = useAppSelector(s => s.auth);
  const Content = scroll ? ScrollView : View;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      {!noGradient && (
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.header}>
          {title ? (
            <>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </>
          ) : (
            <Text style={styles.title}>Hello, {user?.email ?? 'User'}</Text>
          )}
        </LinearGradient>
      )}
      <Content
        style={styles.body}
        contentContainerStyle={scroll ? styles.bodyContent : undefined}
        refreshControl={
          scroll && onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          ) : undefined
        }>
        {children}
      </Content>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    padding: spacing.lg,
    paddingTop: spacing.huge,
    minHeight: 100,
  },
  title: {color: '#FFFFFF', fontSize: fontSize.xxl, fontWeight: fontWeight.bold},
  subtitle: {color: '#FFFFFFCC', fontSize: fontSize.sm, marginTop: spacing.xs},
  body: {flex: 1},
  bodyContent: {padding: spacing.lg, paddingBottom: spacing.huge},
});
