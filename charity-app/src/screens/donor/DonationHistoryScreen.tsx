import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../../utils/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../store/AppContext';
import i18n from '../../i18n';

export const DonationHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state } = useApp();
  const isRTL = state.isRTL;

  const getPaymentLabel = (method: string) => {
    const map: Record<string, string> = {
      vodafone_cash: i18n.t('donor.vodafoneCash'),
      instapay: i18n.t('donor.instaPay'),
      bank_transfer: i18n.t('donor.bankTransfer'),
      qr_code: i18n.t('donor.qrCode'),
    };
    return map[method] || method;
  };

  return (
    <View style={styles.container}>
      <Header title={i18n.t('donor.donationHistory')} onBack={() => navigation.goBack()} />

      <FlatList
        data={state.donations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>{i18n.t('common.noData')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={[styles.row, isRTL && styles.rowRTL]}>
              <View style={styles.left}>
                <Text style={[styles.category, isRTL && styles.textRTL]}>
                  {i18n.t(`donor.categories.${item.category}`)}
                </Text>
                <Text style={[styles.date, isRTL && styles.textRTL]}>
                  {new Date(item.createdAt).toLocaleDateString(
                    state.language === 'ar' ? 'ar-EG' : 'en-US'
                  )}
                </Text>
                <Text style={[styles.payment, isRTL && styles.textRTL]}>
                  {getPaymentLabel(item.paymentMethod)}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.amount}>
                  {item.amount.toLocaleString()} {i18n.t('common.egp')}
                </Text>
                <StatusBadge status={item.status} />
                {item.transactionRef && (
                  <Text style={styles.ref}>#{item.transactionRef}</Text>
                )}
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 0, paddingBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { textAlign: 'right' },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  category: { fontSize: 16, fontWeight: '600', color: Colors.text },
  date: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  payment: { fontSize: 12, color: Colors.accent, marginTop: 2 },
  amount: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  ref: { fontSize: 10, color: Colors.textSecondary },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
});
