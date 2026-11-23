import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';
import {useAppDispatch, useAppSelector} from '../store';
import {logout} from '../store/slices/authSlice';
import {Bell, Moon, Globe, Shield, LogOut, ChevronRight} from 'lucide-react-native';

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(s => s.auth);
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);
  const [bio, setBio] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{user?.email ?? 'User'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{user?.role}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>Notifications</Text>
            </View>
            <Switch value={notif} onValueChange={setNotif} trackColor={{true: colors.primary}} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Moon size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>Dark Mode</Text>
            </View>
            <Switch value={dark} onValueChange={setDark} trackColor={{true: colors.primary}} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Shield size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>Biometric Login</Text>
            </View>
            <Switch value={bio} onValueChange={setBio} trackColor={{true: colors.primary}} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>More</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert('Language', 'English (US)')}>
            <View style={styles.rowLeft}>
              <Globe size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>Language</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.muted}>English</Text>
              <ChevronRight size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logout}
        onPress={() => {
          Alert.alert('Logout', 'Are you sure?', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Logout', style: 'destructive', onPress: () => dispatch(logout())},
          ]);
        }}>
        <LogOut size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>CampusERP v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    padding: spacing.lg,
  },
  section: {paddingHorizontal: spacing.lg, marginBottom: spacing.lg},
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  card: {backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm},
  rowLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  rowRight: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  rowLabel: {fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.medium},
  label: {fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2},
  value: {fontSize: fontSize.md, color: colors.text, fontWeight: fontWeight.semibold},
  muted: {color: colors.textSecondary, fontSize: fontSize.sm},
  divider: {height: 1, backgroundColor: colors.border},
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {color: colors.danger, fontWeight: fontWeight.semibold, fontSize: fontSize.md},
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginVertical: spacing.xl,
  },
});
