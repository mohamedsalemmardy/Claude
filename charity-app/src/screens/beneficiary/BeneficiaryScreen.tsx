import React, { useState, useEffect } from 'react';
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
import { InputField } from '../../components/common/InputField';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../store/AppContext';
import { offlineStorage } from '../../services/offlineStorage';
import { mockBeneficiaryApplications } from '../../services/mockData';
import i18n from '../../i18n';
import type { DonationCategory, BeneficiaryApplication } from '../../types';

type Tab = 'apply' | 'applications';

const NEED_CATEGORIES: { key: DonationCategory; icon: string }[] = [
  { key: 'food', icon: '🍞' },
  { key: 'medical', icon: '🏥' },
  { key: 'education', icon: '📚' },
  { key: 'general', icon: '🤲' },
];

export const BeneficiaryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const isRTL = state.isRTL;
  const [activeTab, setActiveTab] = useState<Tab>('apply');

  // Form state
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [familySize, setFamilySize] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [needCategory, setNeedCategory] = useState<DonationCategory>('general');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch({ type: 'SET_BENEFICIARY_APPS', payload: mockBeneficiaryApplications });
  }, []);

  const resetForm = () => {
    setName('');
    setNationalId('');
    setPhone('');
    setAddress('');
    setFamilySize('');
    setMonthlyIncome('');
    setNeedCategory('general');
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!name || !nationalId || !phone || !address || !description) {
      Alert.alert(
        i18n.t('common.error'),
        state.language === 'ar'
          ? 'يرجى ملء جميع الحقول المطلوبة'
          : 'Please fill in all required fields'
      );
      return;
    }

    setLoading(true);

    const newApp: BeneficiaryApplication = {
      id: `ba-${Date.now()}`,
      applicantName: name,
      nationalId,
      phone,
      address,
      familySize: parseInt(familySize) || 1,
      monthlyIncome: parseFloat(monthlyIncome) || 0,
      needCategory,
      description,
      documents: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Handle offline
    if (!state.isOnline) {
      await offlineStorage.addToQueue({
        type: 'beneficiary_application',
        payload: newApp,
      });
      Alert.alert(i18n.t('common.success'), i18n.t('common.offlineSaved'));
    } else {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch({ type: 'ADD_BENEFICIARY_APP', payload: newApp });
      Alert.alert(i18n.t('common.success'), i18n.t('beneficiary.submitSuccess'));
    }

    setLoading(false);
    resetForm();
    setActiveTab('applications');
  };

  const handlePickDocument = () => {
    Alert.alert(
      i18n.t('beneficiary.uploadDocuments'),
      state.language === 'ar'
        ? 'اختر نوع المستند'
        : 'Select document type',
      [
        { text: i18n.t('beneficiary.idCopy'), onPress: () => {} },
        { text: i18n.t('beneficiary.medicalReport'), onPress: () => {} },
        { text: i18n.t('beneficiary.incomeProof'), onPress: () => {} },
        { text: i18n.t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const renderApplyForm = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Card style={styles.infoCard}>
        <Text style={styles.infoIcon}>📋</Text>
        <Text style={[styles.infoText, isRTL && styles.textRTL]}>
          {state.language === 'ar'
            ? 'يرجى ملء النموذج التالي بدقة. سيتم مراجعة طلبك من قبل فريقنا في أقرب وقت.'
            : 'Please fill out the form accurately. Your application will be reviewed by our team soon.'}
        </Text>
      </Card>

      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
        {i18n.t('beneficiary.personalInfo')}
      </Text>

      <InputField
        label={i18n.t('auth.name')}
        value={name}
        onChangeText={setName}
        placeholder={state.language === 'ar' ? 'الاسم الثلاثي' : 'Full name'}
      />
      <InputField
        label={i18n.t('beneficiary.nationalId')}
        value={nationalId}
        onChangeText={setNationalId}
        keyboardType="numeric"
        placeholder="29XXXXXXXXXX"
      />
      <InputField
        label={i18n.t('auth.phone')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="01XXXXXXXXX"
      />
      <InputField
        label={i18n.t('beneficiary.address')}
        value={address}
        onChangeText={setAddress}
      />
      <InputField
        label={i18n.t('beneficiary.familySize')}
        value={familySize}
        onChangeText={setFamilySize}
        keyboardType="numeric"
      />
      <InputField
        label={i18n.t('beneficiary.monthlyIncome')}
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
        keyboardType="numeric"
      />

      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
        {i18n.t('beneficiary.needCategory')}
      </Text>
      <View style={styles.categoryRow}>
        {NEED_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryChip,
              needCategory === cat.key && styles.categoryChipSelected,
            ]}
            onPress={() => setNeedCategory(cat.key)}
          >
            <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryChipLabel,
                needCategory === cat.key && styles.categoryChipLabelSelected,
              ]}
            >
              {i18n.t(`donor.categories.${cat.key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <InputField
        label={i18n.t('beneficiary.description')}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholder={
          state.language === 'ar'
            ? 'صف حالتك واحتياجاتك بالتفصيل...'
            : 'Describe your case and needs in detail...'
        }
      />

      {/* Document upload */}
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
        {i18n.t('beneficiary.uploadDocuments')}
      </Text>
      <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument}>
        <Text style={styles.uploadIcon}>📎</Text>
        <Text style={styles.uploadText}>
          {state.language === 'ar' ? 'اضغط لرفع المستندات' : 'Tap to upload documents'}
        </Text>
      </TouchableOpacity>

      <Button
        title={i18n.t('beneficiary.applyForAid')}
        onPress={handleSubmit}
        loading={loading}
        icon="📨"
        style={{ marginTop: 20 }}
      />

      <View style={{ height: 30 }} />
    </ScrollView>
  );

  const renderApplications = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      {state.beneficiaryApplications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>{i18n.t('common.noData')}</Text>
        </View>
      ) : (
        state.beneficiaryApplications.map((app) => (
          <Card key={app.id}>
            <View style={[styles.appHeader, isRTL && styles.appHeaderRTL]}>
              <Text style={[styles.appName, isRTL && styles.textRTL]}>
                {app.applicantName}
              </Text>
              <StatusBadge status={app.status} />
            </View>

            <View style={styles.appDetails}>
              <View style={styles.appDetailRow}>
                <Text style={styles.appDetailLabel}>
                  {i18n.t('beneficiary.needCategory')}:
                </Text>
                <Text style={styles.appDetailValue}>
                  {i18n.t(`donor.categories.${app.needCategory}`)}
                </Text>
              </View>
              <View style={styles.appDetailRow}>
                <Text style={styles.appDetailLabel}>
                  {i18n.t('beneficiary.familySize')}:
                </Text>
                <Text style={styles.appDetailValue}>{app.familySize}</Text>
              </View>
              <View style={styles.appDetailRow}>
                <Text style={styles.appDetailLabel}>
                  {i18n.t('beneficiary.monthlyIncome')}:
                </Text>
                <Text style={styles.appDetailValue}>
                  {app.monthlyIncome.toLocaleString()} {i18n.t('common.egp')}
                </Text>
              </View>
            </View>

            <Text style={[styles.appDesc, isRTL && styles.textRTL]} numberOfLines={3}>
              {app.description}
            </Text>

            <Text style={styles.appDate}>
              {new Date(app.createdAt).toLocaleDateString(
                state.language === 'ar' ? 'ar-EG' : 'en-US'
              )}
            </Text>
          </Card>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Header title={i18n.t('beneficiary.title')} />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'apply' && styles.tabActive]}
          onPress={() => setActiveTab('apply')}
        >
          <Text style={[styles.tabText, activeTab === 'apply' && styles.tabTextActive]}>
            {i18n.t('beneficiary.applyForAid')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applications' && styles.tabActive]}
          onPress={() => setActiveTab('applications')}
        >
          <Text
            style={[styles.tabText, activeTab === 'applications' && styles.tabTextActive]}
          >
            {i18n.t('beneficiary.myApplications')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'apply' ? renderApplyForm() : renderApplications()}
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
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.primary },
  infoCard: {
    backgroundColor: Colors.info + '10',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: { fontSize: 28 },
  infoText: { fontSize: 13, color: Colors.info, flex: 1, lineHeight: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  categoryChipIcon: { fontSize: 16 },
  categoryChipLabel: { fontSize: 13, color: Colors.text },
  categoryChipLabelSelected: { color: Colors.primary, fontWeight: '600' },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  uploadIcon: { fontSize: 24 },
  uploadText: { fontSize: 14, color: Colors.textSecondary },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  appHeaderRTL: { flexDirection: 'row-reverse' },
  appName: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  appDetails: { gap: 4, marginBottom: 8 },
  appDetailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  appDetailLabel: { fontSize: 13, color: Colors.textSecondary },
  appDetailValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  appDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  appDate: { fontSize: 11, color: Colors.disabled, marginTop: 8 },
});
