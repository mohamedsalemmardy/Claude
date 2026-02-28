import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../utils/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useApp } from '../../store/AppContext';
import i18n from '../../i18n';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const isRTL = state.isRTL;

  const toggleLanguage = () => {
    const newLang = state.language === 'ar' ? 'en' : 'ar';
    dispatch({ type: 'SET_LANGUAGE', payload: newLang });
  };

  const handleLogout = () => {
    Alert.alert(
      i18n.t('auth.logout'),
      state.language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?',
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('auth.logout'),
          style: 'destructive',
          onPress: () => dispatch({ type: 'LOGOUT' }),
        },
      ]
    );
  };

  const menuItems = [
    { icon: '🌐', label: state.language === 'ar' ? 'English' : 'العربية', onPress: toggleLanguage },
    {
      icon: '🔔',
      label: i18n.t('notifications.title'),
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: '📊',
      label: i18n.t('donor.impactTracker'),
      onPress: () => navigation.navigate('ImpactTracker'),
      show: state.user?.role === 'donor',
    },
    {
      icon: '📋',
      label: i18n.t('donor.donationHistory'),
      onPress: () => navigation.navigate('DonationHistory'),
      show: state.user?.role === 'donor',
    },
    {
      icon: '🏆',
      label: i18n.t('volunteer.certificates'),
      onPress: () => {},
      show: state.user?.role === 'volunteer',
    },
    {
      icon: '🔒',
      label: state.language === 'ar' ? 'الخصوصية والأمان' : 'Privacy & Security',
      onPress: () => {},
    },
    {
      icon: 'ℹ️',
      label: state.language === 'ar' ? 'عن التطبيق' : 'About',
      onPress: () => {},
    },
  ].filter((item) => item.show !== false);

  return (
    <View style={styles.container}>
      <Header title={i18n.t('tabs.profile')} />

      <ScrollView style={styles.scroll}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {state.user?.name?.charAt(0) || '?'}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{state.user?.name}</Text>
          <Text style={styles.email}>{state.user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {state.user?.role === 'donor'
                ? i18n.t('auth.donor')
                : state.user?.role === 'volunteer'
                ? i18n.t('auth.volunteer')
                : state.user?.role === 'beneficiary'
                ? i18n.t('auth.beneficiary')
                : state.language === 'ar' ? 'مدير' : 'Admin'}
            </Text>
          </View>
        </Card>

        {/* Connection Status */}
        <Card
          style={{
            ...styles.statusCard,
            backgroundColor: state.isOnline ? Colors.success + '10' : Colors.error + '10',
          }}
        >
          <Text style={styles.statusIcon}>{state.isOnline ? '🟢' : '🔴'}</Text>
          <Text style={styles.statusText}>
            {state.isOnline
              ? state.language === 'ar'
                ? 'متصل بالإنترنت'
                : 'Online'
              : i18n.t('common.offline')}
          </Text>
        </Card>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} onPress={item.onPress}>
            <Card>
              <View style={[styles.menuRow, isRTL && styles.menuRowRTL]}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, isRTL && styles.textRTL]}>{item.label}</Text>
                <Text style={styles.menuArrow}>{isRTL ? '‹' : '›'}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <Button
            title={i18n.t('auth.logout')}
            onPress={handleLogout}
            variant="danger"
            icon="🚪"
          />
        </View>

        <Text style={styles.version}>v1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  textRTL: { textAlign: 'right' },
  profileCard: { alignItems: 'center', paddingVertical: 24, marginTop: 8 },
  avatarContainer: { marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 32, color: Colors.textLight, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  email: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  roleBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  statusIcon: { fontSize: 14 },
  statusText: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuRowRTL: { flexDirection: 'row-reverse' },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text },
  menuArrow: { fontSize: 20, color: Colors.textSecondary },
  version: {
    textAlign: 'center',
    color: Colors.disabled,
    fontSize: 12,
    marginTop: 16,
  },
});
