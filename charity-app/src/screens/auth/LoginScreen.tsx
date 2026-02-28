import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../utils/colors';
import { InputField } from '../../components/common/InputField';
import { Button } from '../../components/common/Button';
import { useApp } from '../../store/AppContext';
import { mockUser, mockAdminUser } from '../../services/mockData';
import i18n from '../../i18n';
import type { UserRole } from '../../types';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role?: UserRole) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (role === 'admin') {
      dispatch({ type: 'SET_USER', payload: mockAdminUser });
    } else {
      dispatch({
        type: 'SET_USER',
        payload: { ...mockUser, role: role || 'donor' },
      });
    }
    setLoading(false);
  };

  const toggleLanguage = () => {
    const newLang = state.language === 'ar' ? 'en' : 'ar';
    dispatch({ type: 'SET_LANGUAGE', payload: newLang });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Language toggle */}
        <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage}>
          <Text style={styles.langText}>
            {state.language === 'ar' ? 'English' : 'العربية'}
          </Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🤲</Text>
          </View>
          <Text style={styles.appName}>{i18n.t('common.appName')}</Text>
          <Text style={styles.subtitle}>
            {state.language === 'ar'
              ? 'معاً نصنع الفرق'
              : 'Together We Make a Difference'}
          </Text>
        </View>

        {/* Login form */}
        <View style={styles.form}>
          <InputField
            label={i18n.t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
          />
          <InputField
            label={i18n.t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotLink}>
            <Text style={[styles.forgotText, state.isRTL && styles.textRTL]}>
              {i18n.t('auth.forgotPassword')}
            </Text>
          </TouchableOpacity>

          <Button
            title={i18n.t('auth.login')}
            onPress={() => handleLogin()}
            loading={loading}
          />
        </View>

        {/* Quick role access (demo) */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>
            {state.language === 'ar' ? 'دخول سريع (عرض تجريبي)' : 'Quick Access (Demo)'}
          </Text>
          <View style={styles.roleButtons}>
            {(['donor', 'volunteer', 'beneficiary', 'admin'] as UserRole[]).map((role) => (
              <TouchableOpacity
                key={role}
                style={styles.roleButton}
                onPress={() => handleLogin(role)}
              >
                <Text style={styles.roleIcon}>
                  {role === 'donor' ? '💝' : role === 'volunteer' ? '🙋' : role === 'beneficiary' ? '🤝' : '⚙️'}
                </Text>
                <Text style={styles.roleLabel}>{i18n.t(`auth.${role === 'admin' ? 'login' : role}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Register link */}
        <TouchableOpacity style={styles.registerLink}>
          <Text style={styles.registerText}>
            {state.language === 'ar' ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
            <Text style={styles.registerBold}>{i18n.t('auth.register')}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  langToggle: {
    alignSelf: 'flex-end',
    marginTop: 50,
    marginRight: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '15',
    borderRadius: 20,
  },
  langText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  form: {
    paddingHorizontal: 24,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: 13,
  },
  textRTL: {
    textAlign: 'right',
  },
  demoSection: {
    marginTop: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  roleButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  registerBold: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
