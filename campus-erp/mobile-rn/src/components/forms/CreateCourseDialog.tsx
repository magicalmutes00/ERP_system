/**
 * CreateCourseDialog — Self-contained modal dialog for creating a new course
 */

import React, {useState} from 'react';
import {Plus} from 'lucide-react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import {departmentsApi, coursesApi} from '../../api';
import {
  appleTheme,
  appleSpacing,
  appleRadius,
  appleTypography,
  appleShadow,
} from '../../theme/apple';
import {AppleCard} from '../AppleCard';
import {AppleButton} from '../AppleButton';
import {AppleInput} from '../AppleInput';
import {AppleListItem} from '../AppleListItem';

export function CreateCourseDialog() {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: '3',
    departmentId: '',
  });

  const {data: departmentsData, isLoading: deptsLoading} = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll({limit: 100}),
  });

  const departments = departmentsData?.data?.data ?? departmentsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      coursesApi.create({
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        credits: parseInt(formData.credits, 10),
        departmentId: formData.departmentId || undefined,
      }),
    onSuccess: () => {
      setVisible(false);
      setFormData({name: '', code: '', description: '', credits: '3', departmentId: ''});
    },
    onError: () => {},
  });

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.fab}
        hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {visible && (
        <View style={styles.overlay} onTouchEnd={() => setVisible(false)}>
          <AppleCard style={styles.card} shadow="xl">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Create New Course</Text>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <AppleInput
                label="Course Name"
                placeholder="Data Structures & Algorithms"
                value={formData.name}
                onChangeText={text => setFormData({...formData, name: text})}
                editable={!createMutation.isPending}
              />
              <AppleInput
                label="Course Code"
                placeholder="CSE101"
                value={formData.code}
                onChangeText={text => setFormData({...formData, code: text})}
                editable={!createMutation.isPending}
              />
              <AppleInput
                label="Credits"
                placeholder="3"
                keyboardType="numeric"
                value={formData.credits}
                onChangeText={text => setFormData({...formData, credits: text})}
                editable={!createMutation.isPending}
              />
              {deptsLoading ? (
                <AppleListItem title="Loading departments…" style={styles.deptRow} />
              ) : (
                <AppleListItem
                  title="Department"
                  subtitle={
                    departments.find((d: any) => d.id === formData.departmentId)?.name ||
                    'Select department'
                  }
                  chevron
                  style={styles.deptRow}
                />
              )}
              <AppleInput
                label="Description"
                placeholder="Course description..."
                value={formData.description}
                onChangeText={text => setFormData({...formData, description: text})}
                editable={!createMutation.isPending}
              />
            </ScrollView>
            <View style={styles.actions}>
              <AppleButton
                title="Cancel"
                variant="ghost"
                onPress={() => setVisible(false)}
                style={styles.cancelBtn}
              />
              <AppleButton
                title="Create Course"
                variant="primary"
                onPress={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                loading={createMutation.isPending}
                style={styles.createBtn}
              />
            </View>
          </AppleCard>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: appleTheme.spacing.page,
    bottom: appleTheme.spacing.page,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: appleTheme.colors.systemBlue,
    alignItems: 'center',
    justifyContent: 'center',
    ...appleTheme.shadow.lg,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: appleTheme.spacing.page,
  },
  card: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: appleTheme.colors.systemBackground,
    ...appleTheme.shadow.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: appleTheme.spacing.lg,
    paddingVertical: appleTheme.spacing.md,
    borderBottomWidth: 1 / 3,
    borderBottomColor: appleTheme.colors.separator,
  },
  headerTitle: {
    fontSize: appleTheme.typography.title3.fontSize,
    fontWeight: appleTheme.typography.title3.fontWeight,
    color: appleTheme.colors.label,
    letterSpacing: appleTheme.typography.title3.letterSpacing,
  },
  closeBtn: {
    padding: appleTheme.spacing.sm,
  },
  closeText: {
    fontSize: appleTheme.typography.body.fontSize,
    color: appleTheme.colors.tertiaryLabel,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: appleTheme.spacing.lg,
    gap: appleTheme.spacing.md,
  },
  deptRow: {
    marginBottom: appleTheme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: appleTheme.spacing.md,
    padding: appleTheme.spacing.lg,
    borderTopWidth: 1 / 3,
    borderTopColor: appleTheme.colors.separator,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: appleTheme.colors.separator,
  },
  createBtn: {
    flex: 1,
  },
});
