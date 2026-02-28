import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../../utils/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../store/AppContext';
import {
  mockDashboardStats,
  mockBeneficiaryApplications,
} from '../../services/mockData';
import i18n from '../../i18n';
import type { BeneficiaryApplication, BeneficiaryStatus } from '../../types';

type AdminTab = 'dashboard' | 'applications' | 'reports';

export const AdminDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const isRTL = state.isRTL;
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    dispatch({ type: 'SET_DASHBOARD_STATS', payload: mockDashboardStats });
    dispatch({ type: 'SET_BENEFICIARY_APPS', payload: mockBeneficiaryApplications });
  }, []);

  const stats = state.dashboardStats;

  const handleUpdateStatus = (app: BeneficiaryApplication, newStatus: BeneficiaryStatus) => {
    dispatch({
      type: 'UPDATE_BENEFICIARY_APP',
      payload: { ...app, status: newStatus, updatedAt: new Date().toISOString() },
    });
    Alert.alert(
      i18n.t('common.success'),
      state.language === 'ar' ? 'تم تحديث حالة الطلب' : 'Application status updated'
    );
  };

  const renderDashboard = () => (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {[
          {
            icon: '💰',
            label: i18n.t('admin.totalDonations'),
            value: stats?.totalDonations || 0,
            color: Colors.primary,
          },
          {
            icon: '💵',
            label: i18n.t('admin.totalAmount'),
            value: `${((stats?.totalAmount || 0) / 1000).toFixed(0)}K`,
            color: Colors.secondary,
          },
          {
            icon: '🙋',
            label: i18n.t('admin.totalVolunteers'),
            value: stats?.totalVolunteers || 0,
            color: Colors.accent,
          },
          {
            icon: '🤝',
            label: i18n.t('admin.totalBeneficiaries'),
            value: stats?.totalBeneficiaries || 0,
            color: Colors.info,
          },
          {
            icon: '⏳',
            label: i18n.t('admin.pendingApps'),
            value: stats?.pendingApplications || 0,
            color: Colors.warning,
          },
          {
            icon: '📋',
            label: i18n.t('admin.activeOpportunities'),
            value: stats?.activeOpportunities || 0,
            color: Colors.success,
          },
        ].map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderTopColor: stat.color }]}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={[styles.statLabel, isRTL && styles.textRTL]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Monthly Trend Chart */}
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
        {i18n.t('admin.monthlyTrend')}
      </Text>
      <Card>
        <View style={styles.chartContainer}>
          {stats?.monthlyTrend.map((item, index) => {
            const maxAmount = Math.max(...(stats?.monthlyTrend.map((t) => t.amount) || [1]));
            const height = (item.amount / maxAmount) * 120;
            return (
              <View key={index} style={styles.chartBar}>
                <Text style={styles.chartAmount}>{(item.amount / 1000).toFixed(0)}K</Text>
                <View style={[styles.bar, { height, backgroundColor: Colors.primary }]} />
                <Text style={styles.chartLabel}>{item.month}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Category Breakdown */}
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
        {i18n.t('admin.categoryBreakdown')}
      </Text>
      <Card>
        {stats?.categoryBreakdown.map((item, index) => (
          <View key={index} style={styles.categoryRow}>
            <View style={[styles.categoryInfo, isRTL && styles.categoryInfoRTL]}>
              <Text style={styles.categoryName}>
                {i18n.t(`donor.categories.${item.category}`)}
              </Text>
              <Text style={styles.categoryAmount}>
                {item.amount.toLocaleString()} {i18n.t('common.egp')}
              </Text>
            </View>
            <View style={styles.categoryBar}>
              <View
                style={[
                  styles.categoryFill,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor:
                      (Colors as Record<string, string>)[item.category] || Colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.categoryPercent}>{item.percentage}%</Text>
          </View>
        ))}
      </Card>

      <View style={{ height: 30 }} />
    </ScrollView>
  );

  const renderApplications = () => (
    <ScrollView style={styles.scroll}>
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
        {i18n.t('admin.manageApplications')}
      </Text>

      {state.beneficiaryApplications.map((app) => (
        <Card key={app.id}>
          <View style={[styles.appHeader, isRTL && styles.appHeaderRTL]}>
            <Text style={[styles.appName, isRTL && styles.textRTL]}>
              {app.applicantName}
            </Text>
            <StatusBadge status={app.status} />
          </View>

          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>
              📞 {app.phone} | 🏠 {i18n.t('beneficiary.familySize')}: {app.familySize}
            </Text>
            <Text style={styles.appInfoText}>
              💰 {i18n.t('beneficiary.monthlyIncome')}: {app.monthlyIncome} {i18n.t('common.egp')}
            </Text>
            <Text style={styles.appInfoText}>
              📂 {i18n.t(`donor.categories.${app.needCategory}`)}
            </Text>
          </View>

          <Text style={[styles.appDesc, isRTL && styles.textRTL]} numberOfLines={3}>
            {app.description}
          </Text>

          {app.status === 'pending' || app.status === 'under_review' ? (
            <View style={styles.actionButtons}>
              <Button
                title={i18n.t('admin.approve')}
                onPress={() => handleUpdateStatus(app, 'approved')}
                style={{ flex: 1 }}
              />
              <View style={{ width: 8 }} />
              <Button
                title={i18n.t('admin.reject')}
                onPress={() => handleUpdateStatus(app, 'rejected')}
                variant="danger"
                style={{ flex: 1 }}
              />
            </View>
          ) : null}
        </Card>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
        {i18n.t('admin.financialReports')}
      </Text>

      <Card style={styles.reportCard}>
        <Text style={styles.reportTitle}>
          {state.language === 'ar' ? 'التقرير الشهري - يناير 2025' : 'Monthly Report - January 2025'}
        </Text>
        <View style={styles.reportRow}>
          <Text style={styles.reportLabel}>
            {state.language === 'ar' ? 'إجمالي الإيرادات' : 'Total Income'}
          </Text>
          <Text style={[styles.reportValue, { color: Colors.success }]}>42,000 {i18n.t('common.egp')}</Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.reportLabel}>
            {state.language === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}
          </Text>
          <Text style={[styles.reportValue, { color: Colors.error }]}>35,000 {i18n.t('common.egp')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.reportRow}>
          <Text style={[styles.reportLabel, { fontWeight: 'bold' }]}>
            {state.language === 'ar' ? 'صافي الرصيد' : 'Net Balance'}
          </Text>
          <Text style={[styles.reportValue, { fontWeight: 'bold' }]}>7,000 {i18n.t('common.egp')}</Text>
        </View>
      </Card>

      <Card style={styles.reportCard}>
        <Text style={styles.reportTitle}>
          {state.language === 'ar' ? 'التقرير الشهري - ديسمبر 2024' : 'Monthly Report - December 2024'}
        </Text>
        <View style={styles.reportRow}>
          <Text style={styles.reportLabel}>
            {state.language === 'ar' ? 'إجمالي الإيرادات' : 'Total Income'}
          </Text>
          <Text style={[styles.reportValue, { color: Colors.success }]}>55,000 {i18n.t('common.egp')}</Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.reportLabel}>
            {state.language === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}
          </Text>
          <Text style={[styles.reportValue, { color: Colors.error }]}>48,000 {i18n.t('common.egp')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.reportRow}>
          <Text style={[styles.reportLabel, { fontWeight: 'bold' }]}>
            {state.language === 'ar' ? 'صافي الرصيد' : 'Net Balance'}
          </Text>
          <Text style={[styles.reportValue, { fontWeight: 'bold' }]}>7,000 {i18n.t('common.egp')}</Text>
        </View>
      </Card>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Header title={i18n.t('admin.title')} />

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['dashboard', 'applications', 'reports'] as AdminTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'dashboard'
                ? i18n.t('admin.dashboard')
                : tab === 'applications'
                ? i18n.t('admin.manageApplications')
                : i18n.t('admin.financialReports')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'applications' && renderApplications()}
      {activeTab === 'reports' && renderReports()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  textRTL: { textAlign: 'right' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.primary },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 170,
    paddingTop: 20,
  },
  chartBar: { alignItems: 'center', flex: 1 },
  chartAmount: { fontSize: 10, color: Colors.textSecondary, marginBottom: 4 },
  bar: { width: 28, borderRadius: 4 },
  chartLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 6 },
  categoryRow: { marginBottom: 12 },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryInfoRTL: { flexDirection: 'row-reverse' },
  categoryName: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  categoryAmount: { fontSize: 13, color: Colors.textSecondary },
  categoryBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryFill: { height: '100%', borderRadius: 3 },
  categoryPercent: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appHeaderRTL: { flexDirection: 'row-reverse' },
  appName: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  appInfo: { gap: 2, marginBottom: 8 },
  appInfoText: { fontSize: 12, color: Colors.textSecondary },
  appDesc: { fontSize: 13, color: Colors.text, lineHeight: 20 },
  actionButtons: { flexDirection: 'row', marginTop: 12 },
  reportCard: { marginHorizontal: 0 },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  reportLabel: { fontSize: 14, color: Colors.textSecondary },
  reportValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 6 },
});
