import React, { useState } from 'react';
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
import { useApp } from '../../store/AppContext';
import { paymentService } from '../../services/paymentService';
import { offlineStorage } from '../../services/offlineStorage';
import i18n from '../../i18n';
import type { DonationCategory, PaymentMethod, Donation } from '../../types';

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 5000];

const CATEGORIES: { key: DonationCategory; icon: string }[] = [
  { key: 'zakat', icon: '🕌' },
  { key: 'sadaqah', icon: '💚' },
  { key: 'kafala', icon: '👶' },
  { key: 'food', icon: '🍞' },
  { key: 'medical', icon: '🏥' },
  { key: 'education', icon: '📚' },
  { key: 'general', icon: '🤲' },
];

const PAYMENT_METHODS: { key: PaymentMethod; icon: string; labelKey: string }[] = [
  { key: 'vodafone_cash', icon: '📱', labelKey: 'donor.vodafoneCash' },
  { key: 'instapay', icon: '🏦', labelKey: 'donor.instaPay' },
  { key: 'bank_transfer', icon: '💳', labelKey: 'donor.bankTransfer' },
  { key: 'qr_code', icon: '📷', labelKey: 'donor.qrCode' },
];

export const DonateScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const isRTL = state.isRTL;
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<DonationCategory>('general');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone_cash');
  const [phone, setPhone] = useState(state.user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);

  const handleDonate = async () => {
    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount <= 0) {
      Alert.alert(i18n.t('common.error'), state.language === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount');
      return;
    }

    setLoading(true);

    // Handle offline scenario
    if (!state.isOnline) {
      await offlineStorage.addToQueue({
        type: 'donation',
        payload: { amount: donationAmount, category, paymentMethod, phone },
      });
      Alert.alert(i18n.t('common.success'), i18n.t('common.offlineSaved'));
      setLoading(false);
      navigation.goBack();
      return;
    }

    try {
      let response;

      if (paymentMethod === 'vodafone_cash') {
        response = await paymentService.initiateVodafoneCash({
          amount: donationAmount,
          category,
          method: paymentMethod,
          phone,
          donorName: state.user?.name,
          donorEmail: state.user?.email,
        });
      } else if (paymentMethod === 'instapay' || paymentMethod === 'qr_code') {
        response = paymentService.generateInstaPayQR(donationAmount, category);
        if (response.qrData) {
          setQrData(response.qrData);
        }
      } else {
        // Bank transfer - show details
        response = { success: true, transactionRef: `BT-${Date.now()}`, message: '' };
      }

      // Create donation record
      const donation: Donation = {
        id: `d-${Date.now()}`,
        donorId: state.user?.id || '',
        amount: donationAmount,
        currency: 'EGP',
        category,
        paymentMethod,
        status: paymentMethod === 'vodafone_cash' ? 'pending' : 'completed',
        transactionRef: response?.transactionRef,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_DONATION', payload: donation });

      setStep(4); // Success step
    } catch {
      Alert.alert(i18n.t('common.error'), i18n.t('donor.paymentFailed'));
    }

    setLoading(false);
  };

  const renderStep1 = () => (
    <>
      <Text style={[styles.stepTitle, isRTL && styles.textRTL]}>
        {i18n.t('donor.selectCategory')}
      </Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryCard, category === cat.key && styles.categorySelected]}
            onPress={() => setCategory(cat.key)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                category === cat.key && styles.categoryLabelSelected,
              ]}
            >
              {i18n.t(`donor.categories.${cat.key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.stepTitle, isRTL && styles.textRTL, { marginTop: 20 }]}>
        {i18n.t('donor.amount')} ({i18n.t('common.egp')})
      </Text>
      <View style={styles.presetRow}>
        {PRESET_AMOUNTS.map((preset) => (
          <TouchableOpacity
            key={preset}
            style={[styles.presetButton, amount === preset.toString() && styles.presetSelected]}
            onPress={() => setAmount(preset.toString())}
          >
            <Text
              style={[
                styles.presetText,
                amount === preset.toString() && styles.presetTextSelected,
              ]}
            >
              {preset}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <InputField
        label={state.language === 'ar' ? 'أو أدخل مبلغاً آخر' : 'Or enter custom amount'}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0"
      />
      <Button
        title={i18n.t('common.next')}
        onPress={() => setStep(2)}
        disabled={!amount || parseFloat(amount) <= 0}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={[styles.stepTitle, isRTL && styles.textRTL]}>
        {i18n.t('donor.selectPayment')}
      </Text>
      {PAYMENT_METHODS.map((method) => (
        <Card
          key={method.key}
          onPress={() => setPaymentMethod(method.key)}
          style={paymentMethod === method.key ? styles.paymentSelected : undefined}
        >
          <View style={[styles.paymentRow, isRTL && styles.paymentRowRTL]}>
            <Text style={styles.paymentIcon}>{method.icon}</Text>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentLabel, isRTL && styles.textRTL]}>
                {i18n.t(method.labelKey)}
              </Text>
              {method.key === 'vodafone_cash' && (
                <Text style={[styles.paymentDesc, isRTL && styles.textRTL]}>
                  {state.language === 'ar'
                    ? 'عبر Paymob - سيصلك طلب دفع USSD'
                    : 'Via Paymob - USSD payment request'}
                </Text>
              )}
              {method.key === 'instapay' && (
                <Text style={[styles.paymentDesc, isRTL && styles.textRTL]}>
                  {state.language === 'ar'
                    ? 'تحويل عبر رمز QR أو الحساب البنكي'
                    : 'Transfer via QR code or bank account'}
                </Text>
              )}
            </View>
            {paymentMethod === method.key && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </Card>
      ))}

      {(paymentMethod === 'vodafone_cash') && (
        <InputField
          label={i18n.t('donor.enterPhone')}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="01XXXXXXXXX"
        />
      )}

      <View style={styles.buttonRow}>
        <Button title={i18n.t('common.back')} onPress={() => setStep(1)} variant="outline" style={{ flex: 1 }} />
        <View style={{ width: 12 }} />
        <Button title={i18n.t('common.next')} onPress={() => setStep(3)} style={{ flex: 1 }} />
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={[styles.stepTitle, isRTL && styles.textRTL]}>
        {i18n.t('common.confirm')}
      </Text>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{i18n.t('donor.selectCategory')}</Text>
          <Text style={styles.summaryValue}>{i18n.t(`donor.categories.${category}`)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{i18n.t('donor.amount')}</Text>
          <Text style={styles.summaryValueLarge}>{amount} {i18n.t('common.egp')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{i18n.t('donor.selectPayment')}</Text>
          <Text style={styles.summaryValue}>
            {i18n.t(`donor.${paymentMethod === 'vodafone_cash' ? 'vodafoneCash' : paymentMethod === 'instapay' ? 'instaPay' : paymentMethod === 'bank_transfer' ? 'bankTransfer' : 'qrCode'}`)}
          </Text>
        </View>
      </Card>

      <View style={styles.buttonRow}>
        <Button title={i18n.t('common.back')} onPress={() => setStep(2)} variant="outline" style={{ flex: 1 }} />
        <View style={{ width: 12 }} />
        <Button title={i18n.t('common.confirm')} onPress={handleDonate} loading={loading} style={{ flex: 1 }} />
      </View>
    </>
  );

  const renderStep4 = () => (
    <View style={styles.successContainer}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={[styles.successTitle, isRTL && styles.textRTL]}>
        {i18n.t('donor.paymentSuccess')}
      </Text>
      <Text style={[styles.successDesc, isRTL && styles.textRTL]}>
        {state.language === 'ar'
          ? `تم تسجيل تبرعك بمبلغ ${amount} ج.م بنجاح. جزاك الله خيراً!`
          : `Your donation of ${amount} EGP has been recorded. May Allah reward you!`}
      </Text>

      {qrData && (
        <Card style={styles.qrCard}>
          <Text style={[styles.qrTitle, isRTL && styles.textRTL]}>
            {i18n.t('donor.scanQR')}
          </Text>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderText}>QR Code</Text>
            <Text style={styles.qrDetails}>
              {state.language === 'ar' ? 'امسح الكود من تطبيق البنك' : 'Scan from your bank app'}
            </Text>
          </View>
        </Card>
      )}

      <Button
        title={i18n.t('tabs.home')}
        onPress={() => navigation.navigate('HomeTab')}
        style={{ marginTop: 20 }}
      />
      <Button
        title={i18n.t('donor.donateNow')}
        onPress={() => {
          setStep(1);
          setAmount('');
          setQrData(null);
        }}
        variant="outline"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={i18n.t('donor.donateNow')}
        onBack={step > 1 && step < 4 ? () => setStep(step - 1) : undefined}
      />

      {/* Step indicator */}
      {step < 4 && (
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.stepDot, s <= step && styles.stepDotActive]} />
          ))}
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  textRTL: { textAlign: 'right' },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  stepDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: '30%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categorySelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  categoryIcon: { fontSize: 28, marginBottom: 6 },
  categoryLabel: { fontSize: 12, color: Colors.text, fontWeight: '600', textAlign: 'center' },
  categoryLabelSelected: { color: Colors.primary },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  presetSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  presetText: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  presetTextSelected: { color: Colors.textLight },
  paymentSelected: { borderWidth: 2, borderColor: Colors.primary },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentRowRTL: { flexDirection: 'row-reverse' },
  paymentIcon: { fontSize: 28, marginRight: 12 },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 16, fontWeight: '600', color: Colors.text },
  paymentDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  checkmark: { fontSize: 20, color: Colors.primary, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', marginTop: 20 },
  summaryCard: { backgroundColor: Colors.surface },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  summaryValueLarge: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  successContainer: { alignItems: 'center', paddingTop: 40 },
  successIcon: { fontSize: 60, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.success },
  successDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  qrCard: { alignItems: 'center', marginTop: 20, width: '100%' },
  qrTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  qrPlaceholderText: { fontSize: 18, fontWeight: 'bold', color: Colors.textSecondary },
  qrDetails: { fontSize: 12, color: Colors.textSecondary, marginTop: 8 },
});
