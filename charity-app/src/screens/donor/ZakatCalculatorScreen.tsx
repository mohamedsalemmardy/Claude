import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../utils/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/InputField';
import { useApp } from '../../store/AppContext';
import { zakatService } from '../../services/zakatService';
import i18n from '../../i18n';
import type { ZakatInput, ZakatResult } from '../../types';

export const ZakatCalculatorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state } = useApp();
  const isRTL = state.isRTL;
  const [input, setInput] = useState<ZakatInput>(zakatService.getDefaultInput());
  const [result, setResult] = useState<ZakatResult | null>(null);

  const fields: { key: keyof ZakatInput; icon: string }[] = [
    { key: 'cash', icon: '💵' },
    { key: 'bankBalance', icon: '🏦' },
    { key: 'goldValue', icon: '🪙' },
    { key: 'silverValue', icon: '🥈' },
    { key: 'investments', icon: '📈' },
    { key: 'businessInventory', icon: '📦' },
    { key: 'debtsOwedToYou', icon: '📋' },
    { key: 'debtsYouOwe', icon: '📝' },
    { key: 'propertyForTrade', icon: '🏠' },
  ];

  const updateField = (key: keyof ZakatInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleCalculate = () => {
    const zakatResult = zakatService.calculate(input);
    setResult(zakatResult);
  };

  return (
    <View style={styles.container}>
      <Header title={i18n.t('zakat.title')} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Subtitle */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoIcon}>🕌</Text>
          <Text style={[styles.infoText, isRTL && styles.textRTL]}>
            {i18n.t('zakat.subtitle')}
          </Text>
        </Card>

        {/* Input Fields */}
        {fields.map((field) => (
          <View key={field.key} style={styles.fieldRow}>
            <Text style={styles.fieldIcon}>{field.icon}</Text>
            <View style={styles.fieldInput}>
              <InputField
                label={i18n.t(`zakat.${field.key}`)}
                value={input[field.key] > 0 ? input[field.key].toString() : ''}
                onChangeText={(val) => updateField(field.key, val)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
        ))}

        <Button
          title={i18n.t('zakat.calculate')}
          onPress={handleCalculate}
          icon="🧮"
          style={{ marginTop: 16 }}
        />

        {/* Result */}
        {result && (
          <Card style={styles.resultCard}>
            <Text style={[styles.resultTitle, isRTL && styles.textRTL]}>
              {i18n.t('zakat.result')}
            </Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{i18n.t('zakat.totalWealth')}</Text>
              <Text style={styles.resultValue}>
                {result.totalWealth.toLocaleString()} {i18n.t('common.egp')}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{i18n.t('zakat.nisab')}</Text>
              <Text style={styles.resultValue}>
                {result.nisab.toLocaleString()} {i18n.t('common.egp')}
              </Text>
            </View>

            <View style={styles.divider} />

            {result.isZakatDue ? (
              <View style={styles.zakatDueContainer}>
                <Text style={styles.zakatDueLabel}>{i18n.t('zakat.zakatDue')}</Text>
                <Text style={styles.zakatDueAmount}>
                  {result.zakatAmount.toLocaleString()} {i18n.t('common.egp')}
                </Text>
                <Button
                  title={i18n.t('zakat.payZakat')}
                  onPress={() =>
                    navigation.navigate('Donate')
                  }
                  icon="💝"
                  style={{ marginTop: 12 }}
                />
              </View>
            ) : (
              <View style={styles.noZakatContainer}>
                <Text style={styles.noZakatText}>{i18n.t('zakat.zakatNotDue')}</Text>
              </View>
            )}

            {/* Breakdown */}
            {result.breakdown.length > 0 && (
              <View style={styles.breakdownSection}>
                {result.breakdown.map((item, index) => (
                  <View key={index} style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{i18n.t(`zakat.${item.label}`)}</Text>
                    <Text
                      style={[
                        styles.breakdownValue,
                        item.value < 0 && styles.breakdownNegative,
                      ]}
                    >
                      {item.value.toLocaleString()} {i18n.t('common.egp')}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Disclaimer */}
        <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>
          {i18n.t('zakat.disclaimer')}
        </Text>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  textRTL: { textAlign: 'right' },
  infoCard: {
    backgroundColor: Colors.primary + '10',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: { fontSize: 32 },
  infoText: { fontSize: 14, color: Colors.primary, flex: 1, fontWeight: '500' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  fieldInput: { flex: 1 },
  resultCard: {
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 4,
    borderTopColor: Colors.primary,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resultLabel: { fontSize: 14, color: Colors.textSecondary },
  resultValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  zakatDueContainer: { alignItems: 'center', paddingVertical: 16 },
  zakatDueLabel: { fontSize: 16, color: Colors.textSecondary },
  zakatDueAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 4,
  },
  noZakatContainer: { alignItems: 'center', paddingVertical: 16 },
  noZakatText: { fontSize: 16, color: Colors.textSecondary, fontStyle: 'italic' },
  breakdownSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: { fontSize: 13, color: Colors.textSecondary },
  breakdownValue: { fontSize: 13, fontWeight: '500', color: Colors.text },
  breakdownNegative: { color: Colors.error },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
});
