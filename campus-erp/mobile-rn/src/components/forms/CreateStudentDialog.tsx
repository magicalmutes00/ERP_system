/**
 * CreateStudentDialog — Self-contained modal dialog for creating a new student
 * Manages its own visibility state. Renders a trigger button and the modal.
 * 
 * Apple Design principles:
 * - Materials & depth: translucent sheet-like presentation
 * - Response: instant feedback on form submission
 * - Agency: clear cancel path, confirmation on success
 * - Craft: precise form layout, validation
 */

import React, {useState} from 'react';
import {Plus} from 'lucide-react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import {departmentsApi, studentsApi} from '../../api';
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

export function CreateStudentDialog() {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    enrollmentNo: '',
    departmentId: '',
    currentSemester: '1',
    phone: '',
  });

  const {data: departmentsData, isLoading: deptsLoading} = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll({limit: 100}),
  });

  const departments = departmentsData?.data?.data ?? departmentsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      studentsApi.create({
        user: {
          create: {
            email: formData.email,
            password: formData.password,
            phone: formData.phone || undefined,
            role: 'STUDENT',
          },
        },
        firstName: formData.firstName,
        lastName: formData.lastName,
        enrollmentNo: formData.enrollmentNo,
        departmentId: formData.departmentId || undefined,
        currentSemester: parseInt(formData.currentSemester, 10),
      }),
    onSuccess: () => {
      setVisible(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        enrollmentNo: '',
        departmentId: '',
        currentSemester: '1',
        phone: '',
      });
    },
    onError: () => {},
  });

  return (
    <>
      {/* Trigger button - floating add */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.fab}
        hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal */}
      {visible && (
        <View style={styles.overlay} onTouchEnd={() => setVisible(false)}>
          <AppleCard style={styles.card} shadow="xl">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Create New Student</Text>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <AppleInput
                label="Email"
                placeholder="student@campus.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={formData.email}
                onChangeText={text => setFormData({...formData, email: text})}
                editable={!createMutation.isPending}
              />
              <AppleInput
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                value={formData.password}
                onChangeText={text => setFormData({...formData, password: text})}
                editable={!createMutation.isPending}
              />
              <AppleInput
                label="First Name"
                placeholder="Rahul"
                value={formData.firstName}
                onChangeText={text => setFormData({...formData, firstName: text})}
                editable={!createMutation.isPending}
              />
              <AppleInput
                label="Last Name"
                placeholder="Sharma"
                value={formData.lastName}
                onChangeText={text => setFormData({...formData, lastName: text})}
                editable={!createMutation.isPending}
              />
              <AppleInput
                label="Enrollment Number"
                placeholder="CSE24001"
                value={formData.enrollmentNo}
                onChangeText={text => setFormData({...formData, enrollmentNo: text})}
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
                label="Current Semester"
                placeholder="1"
                keyboardType="numeric"
                value={formData.currentSemester}
                onChangeText={text => setFormData({...formData, currentSemester: text})}
                editable={!createMutation.isPending}
              />
              <AppleInput
                label="Phone (optional)"
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={text => setFormData({...formData, phone: text})}
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
                title="Create Student"
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
