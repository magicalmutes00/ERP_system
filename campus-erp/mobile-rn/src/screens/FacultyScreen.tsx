import React from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {facultyApi} from '../api';
import {
  appleTheme,
  appleSpacing,
  appleRadius,
  appleTypography,
  appleShadow,
} from '../theme/apple';
import {AppleNavBar} from '../components/AppleNavBar';
import {AppleCard} from '../components/AppleCard';
import {AppleListItem} from '../components/AppleListItem';
import {AppleButton} from '../components/AppleButton';
import {Plus} from 'lucide-react-native';
import {CreateFacultyDialog} from '../components/forms/CreateFacultyDialog';

export function FacultyScreen() {
  const {data, isLoading, error} = useQuery({
    queryKey: ['faculty'],
    queryFn: () => facultyApi.getAll(),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={appleTheme.colors.systemBlue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load faculty</Text>
      </View>
    );
  }

  const faculty = data?.data?.data ?? data?.data ?? [];

  return (
    <View style={styles.container}>
      <AppleNavBar title="Faculty" />
      <CreateFacultyDialog />
      <FlatList
        data={faculty}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}: any) => (
          <AppleListItem
            title={`${item.firstName} ${item.lastName}`}
            subtitle={item.employeeId}
            chevron
            style={styles.row}
          />
        )}
        ListEmptyComponent={
          <AppleCard shadow="none" style={styles.emptyCard}>
            <Text style={styles.empty}>No faculty yet</Text>
          </AppleCard>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appleTheme.colors.secondarySystemBackground,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appleTheme.colors.secondarySystemBackground,
  },
  list: {
    paddingHorizontal: appleTheme.spacing.page,
    paddingBottom: appleTheme.spacing.huge,
  },
  row: {
    marginBottom: appleTheme.spacing.sm,
  },
  emptyCard: {
    marginHorizontal: appleTheme.spacing.page,
    marginTop: appleTheme.spacing.lg,
  },
  empty: {
    fontSize: appleTheme.typography.body.fontSize,
    color: appleTheme.colors.tertiaryLabel,
    textAlign: 'center',
    paddingVertical: appleTheme.spacing.xxl,
  },
  error: {
    fontSize: appleTheme.typography.body.fontSize,
    color: appleTheme.colors.systemRed,
  },
});
