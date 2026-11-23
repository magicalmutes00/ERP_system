import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../store';
import {login} from '../store/slices/authSlice';
import {
  appleTheme,
  appleColors,
  appleSpacing,
  appleRadius,
  appleTypography,
  appleShadow,
  systemFont,
} from '../theme/apple';
import {AppleButton} from '../components/AppleButton';
import {AppleInput} from '../components/AppleInput';

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const {isLoading, error} = useAppSelector(s => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please fill in all fields');
      return;
    }
    try {
      await dispatch(login({email, password})).unwrap();
    } catch (e: any) {
      const msg = typeof e === 'string' ? e : e?.message || 'Something went wrong';
      Alert.alert('Login failed', msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* App icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>C</Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your CampusERP account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AppleInput
            label="Email"
            placeholder="name@campus.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />

          <View style={styles.passwordField}>
            <AppleInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeWrap}
              onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <AppleButton
            title="Sign in"
            onPress={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
            variant="primary"
            style={styles.button}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.footerLink}>Contact your administrator</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appleTheme.colors.secondarySystemBackground,
  },
  scroll: {
    flexGrow: 1,
    padding: appleTheme.spacing.page,
  },
  iconWrapper: {
    alignItems: 'center',
    marginTop: appleTheme.spacing.huge,
    marginBottom: appleTheme.spacing.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: appleTheme.colors.systemBlue,
    alignItems: 'center',
    justifyContent: 'center',
    ...appleShadow.md,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800' as const,
  },
  header: {
    alignItems: 'center',
    marginBottom: appleTheme.spacing.xxl,
  },
  title: {
    fontSize: appleTheme.typography.largeTitle.fontSize,
    fontWeight: appleTheme.typography.largeTitle.fontWeight,
    letterSpacing: appleTheme.typography.largeTitle.letterSpacing,
    color: appleTheme.colors.label,
  },
  subtitle: {
    fontSize: appleTheme.typography.subhead.fontSize,
    color: appleTheme.colors.secondaryLabel,
    marginTop: appleTheme.spacing.sm,
    letterSpacing: appleTheme.typography.subhead.letterSpacing,
  },
  form: {
    width: '100%',
    gap: appleTheme.spacing.lg,
  },
  button: {
    marginTop: appleTheme.spacing.lg,
  },
  passwordField: {
    position: 'relative',
  },
  errorRow: {
    marginHorizontal: -appleTheme.spacing.page,
  },
  errorText: {
    fontSize: appleTheme.typography.caption2.fontSize,
    color: appleTheme.colors.systemRed,
    marginHorizontal: appleTheme.spacing.page,
    marginBottom: appleTheme.spacing.md,
    letterSpacing: appleTheme.typography.caption2.letterSpacing,
  },
  footer: {
    alignItems: 'center',
    marginTop: appleTheme.spacing.xxl,
    paddingBottom: appleTheme.spacing.huge,
  },
  footerText: {
    fontSize: appleTheme.typography.footnote.fontSize,
    color: appleTheme.colors.tertiaryLabel,
    letterSpacing: appleTheme.typography.footnote.letterSpacing,
  },
  footerLink: {
    color: appleTheme.colors.systemBlue,
    fontWeight: '600' as const,
  },
  eyeWrap: {
    position: 'absolute',
    right: 12,
    top: 18,
    paddingHorizontal: 4,
  },
  eyeText: {
    fontSize: 18,
  },
});
