import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../utils/colors';
import { Card } from '../../components/common/Card';
import { OfflineBanner } from '../../components/common/OfflineBanner';
import { useApp } from '../../store/AppContext';
import { mockDonations, mockImpact, mockNotifications } from '../../services/mockData';
import i18n from '../../i18n';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const isRTL = state.isRTL;

  useEffect(() => {
    dispatch({ type: 'SET_DONATIONS', payload: mockDonations });
    dispatch({ type: 'SET_IMPACT', payload: mockImpact });
    dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications });
  }, []);

  const totalDonated = state.donations
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <OfflineBanner />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
          <View>
            <Text style={[styles.greeting, isRTL && styles.textRTL]}>
              {i18n.t('common.welcome')} 👋
            </Text>
            <Text style={[styles.userName, isRTL && styles.textRTL]}>
              {state.user?.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notifIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Total Donated Card */}
        <Card style={styles.totalCard}>
          <Text style={[styles.totalLabel, isRTL && styles.textRTL]}>
            {state.language === 'ar' ? 'إجمالي تبرعاتك' : 'Total Donated'}
          </Text>
          <Text style={styles.totalAmount}>
            {totalDonated.toLocaleString()} {i18n.t('common.egp')}
          </Text>
          <View style={styles.impactRow}>
            {state.impact && (
              <>
                <View style={styles.impactItem}>
                  <Text style={styles.impactNumber}>{state.impact.familiesHelped}</Text>
                  <Text style={styles.impactLabel}>{i18n.t('donor.familiesHelped')}</Text>
                </View>
                <View style={styles.impactItem}>
                  <Text style={styles.impactNumber}>{state.impact.mealsProvided}</Text>
                  <Text style={styles.impactLabel}>{i18n.t('donor.mealsProvided')}</Text>
                </View>
                <View style={styles.impactItem}>
                  <Text style={styles.impactNumber}>{state.impact.studentsSupported}</Text>
                  <Text style={styles.impactLabel}>{i18n.t('donor.studentsSupported')}</Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {state.language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
        </Text>
        <View style={styles.quickActions}>
          {[
            { icon: '💝', label: i18n.t('donor.donateNow'), screen: 'Donate' },
            { icon: '🧮', label: i18n.t('donor.zakatCalculator'), screen: 'ZakatCalculator' },
            { icon: '📊', label: i18n.t('donor.impactTracker'), screen: 'ImpactTracker' },
            { icon: '📋', label: i18n.t('donor.donationHistory'), screen: 'DonationHistory' },
          ].map((action) => (
            <TouchableOpacity
              key={action.screen}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Donations */}
        <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
          <Text style={styles.sectionTitle}>
            {state.language === 'ar' ? 'آخر التبرعات' : 'Recent Donations'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('DonationHistory')}>
            <Text style={styles.viewAllText}>{i18n.t('common.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        {state.donations.slice(0, 3).map((donation) => (
          <Card key={donation.id}>
            <View style={[styles.donationRow, isRTL && styles.donationRowRTL]}>
              <View>
                <Text style={[styles.donationCategory, isRTL && styles.textRTL]}>
                  {i18n.t(`donor.categories.${donation.category}`)}
                </Text>
                <Text style={[styles.donationDate, isRTL && styles.textRTL]}>
                  {new Date(donation.createdAt).toLocaleDateString(
                    state.language === 'ar' ? 'ar-EG' : 'en-US'
                  )}
                </Text>
              </View>
              <View style={styles.donationRight}>
                <Text style={styles.donationAmount}>
                  {donation.amount} {i18n.t('common.egp')}
                </Text>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        donation.status === 'completed' ? Colors.success : Colors.pending,
                    },
                  ]}
                />
              </View>
            </View>
          </Card>
        ))}

        {/* Urgent Cases */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL, { marginTop: 16 }]}>
          {state.language === 'ar' ? 'حالات عاجلة' : 'Urgent Cases'}
        </Text>
        <Card style={styles.urgentCard}>
          <Text style={styles.urgentIcon}>🚨</Text>
          <Text style={[styles.urgentTitle, isRTL && styles.textRTL]}>
            {state.language === 'ar'
              ? 'طفل يحتاج لعملية قلب عاجلة'
              : 'Child needs urgent heart surgery'}
          </Text>
          <Text style={[styles.urgentDesc, isRTL && styles.textRTL]}>
            {state.language === 'ar'
              ? 'المبلغ المطلوب: 50,000 ج.م | تم جمع: 32,000 ج.م'
              : 'Required: 50,000 EGP | Collected: 32,000 EGP'}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '64%' }]} />
          </View>
          <TouchableOpacity
            style={styles.urgentButton}
            onPress={() => navigation.navigate('Donate')}
          >
            <Text style={styles.urgentButtonText}>{i18n.t('donor.donateNow')}</Text>
          </TouchableOpacity>
        </Card>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContentRTL: { flexDirection: 'row-reverse' },
  greeting: { color: Colors.textLight, fontSize: 14, opacity: 0.9 },
  userName: { color: Colors.textLight, fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  textRTL: { textAlign: 'right' },
  notifButton: { position: 'relative', padding: 8 },
  notifIcon: { fontSize: 24 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  scroll: { flex: 1 },
  totalCard: {
    backgroundColor: Colors.primaryDark,
    marginTop: -10,
    alignItems: 'center',
    paddingVertical: 24,
  },
  totalLabel: { color: Colors.textLight, fontSize: 14, opacity: 0.8 },
  totalAmount: {
    color: Colors.textLight,
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  impactRow: { flexDirection: 'row', marginTop: 12, gap: 24 },
  impactItem: { alignItems: 'center' },
  impactNumber: { color: Colors.secondaryLight, fontSize: 20, fontWeight: 'bold' },
  impactLabel: { color: Colors.textLight, fontSize: 11, opacity: 0.8, marginTop: 2 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeaderRTL: { flexDirection: 'row-reverse' },
  viewAllText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 13, color: Colors.text, fontWeight: '600', textAlign: 'center' },
  donationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donationRowRTL: { flexDirection: 'row-reverse' },
  donationCategory: { fontSize: 15, fontWeight: '600', color: Colors.text },
  donationDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  donationRight: { alignItems: 'flex-end' },
  donationAmount: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  urgentCard: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    alignItems: 'center',
  },
  urgentIcon: { fontSize: 32, marginBottom: 8 },
  urgentTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, textAlign: 'center' },
  urgentDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.success, borderRadius: 4 },
  urgentButton: {
    backgroundColor: Colors.error,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 12,
  },
  urgentButtonText: { color: Colors.textLight, fontWeight: '700', fontSize: 14 },
});
