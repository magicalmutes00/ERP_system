/**
 * CreateFacultyDialog — Self-contained modal dialog for creating a new faculty member
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
import {departmentsApi, facultyApi} from '../../api';
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

export function CreateFacultyDialog() {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    employeeId: '',
    departmentId: '',
    qualification: '',
    phone: '',
  });

  const {data: departmentsData, isLoading: deptsLoading} = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll({limit: 100}),
  });

  const departments = departmentsData?.data?.data ?? departmentsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      facultyApi.create({
        user: {
          create: {
            email: formData.email,
            password: formData.password,
            phone: formData.phone || undefined,
            role: 'FACULTY',
          },
        },
        firstName: formData.firstName,
        lastName: formData.lastName,
        employeeId: formData.employeeId,
        departmentId: formData.departmentId || undefined,
        qualification: formData.qualification || undefined,
      }),
    onSuccess: () => {
      setVisible(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        employeeId: '',
        departmentId: '',
        qualification: '',
        phone: '',
      });
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
              <Text style={styles.headerTitle}>Create New Faculty</Text>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <AppleInput
                label="Email"
                placeholder="faculty@campus.edu"
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
                placeholder="Dr. Anita"
                value={formData.firstName}
                onChangeText={text => setFormData({...formData, firstName: text})}
                editable={!createMutation.isPending}
              />
              <AppleInput
                label="Last Name"
                placeholder="Desai"
                value={formData.lastName}
                onChangeText={text => setFormData({...formData, lastName: text})}
                editable={!createMutation.isPending}
              />
              <AppleInput
                label="Employee ID"
                placeholder="FAC1001"
                value={formData.employeeId}
                onChangeText={text => setFormData({...formData, employeeId: text})}
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
                label="Qualification"
                placeholder="M.Tech, Ph.D."
                value={formData.qualification}
                onChangeText={text => setFormData({...formData, qualification: text})}
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
                title="Create Faculty"
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
