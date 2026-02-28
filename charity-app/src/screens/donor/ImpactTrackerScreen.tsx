import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../utils/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { useApp } from '../../store/AppContext';
import i18n from '../../i18n';

export const ImpactTrackerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state } = useApp();
  const isRTL = state.isRTL;
  const impact = state.impact;

  const impactItems = [
    { icon: '👨‍👩‍👧‍👦', label: i18n.t('donor.familiesHelped'), value: impact?.familiesHelped || 0, color: Colors.primary },
    { icon: '🍲', label: i18n.t('donor.mealsProvided'), value: impact?.mealsProvided || 0, color: Colors.secondary },
    { icon: '🎓', label: i18n.t('donor.studentsSupported'), value: impact?.studentsSupported || 0, color: Colors.info },
    { icon: '🏥', label: i18n.t('donor.medicalCases'), value: impact?.medicalCasesHelped || 0, color: Colors.error },
  ];

  const totalDonated = state.donations
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <View style={styles.container}>
      <Header title={i18n.t('donor.impactTracker')} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Total */}
        <Card style={styles.totalCard}>
          <Text style={styles.totalLabel}>
            {state.language === 'ar' ? 'إجمالي مساهماتك' : 'Your Total Contributions'}
          </Text>
          <Text style={styles.totalAmount}>
            {totalDonated.toLocaleString()} {i18n.t('common.egp')}
          </Text>
        </Card>

        {/* Impact Grid */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {i18n.t('donor.yourImpact')}
        </Text>
        <View style={styles.impactGrid}>
          {impactItems.map((item, index) => (
            <Card key={index} style={{ ...styles.impactCard, borderLeftColor: item.color }}>
              <Text style={styles.impactIcon}>{item.icon}</Text>
              <Text style={styles.impactValue}>{item.value}</Text>
              <Text style={[styles.impactLabel, isRTL && styles.textRTL]}>{item.label}</Text>
            </Card>
          ))}
        </View>

        {/* Story */}
        {impact?.description && (
          <>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {state.language === 'ar' ? 'قصة أثرك' : 'Your Impact Story'}
            </Text>
            <Card style={styles.storyCard}>
              <Text style={styles.storyIcon}>📖</Text>
              <Text style={[styles.storyText, isRTL && styles.textRTL]}>
                {impact.description}
              </Text>
            </Card>
          </>
        )}

        {/* Donation Breakdown */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {state.language === 'ar' ? 'توزيع تبرعاتك' : 'Donation Breakdown'}
        </Text>
        {state.donations
          .filter((d) => d.status === 'completed')
          .reduce(
            (acc, d) => {
              const existing = acc.find((a) => a.category === d.category);
              if (existing) {
                existing.amount += d.amount;
              } else {
                acc.push({ category: d.category, amount: d.amount });
              }
              return acc;
            },
            [] as { category: string; amount: number }[]
          )
          .sort((a, b) => b.amount - a.amount)
          .map((item, index) => (
            <Card key={index}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownCategory}>
                  {i18n.t(`donor.categories.${item.category}`)}
                </Text>
                <Text style={styles.breakdownAmount}>
                  {item.amount.toLocaleString()} {i18n.t('common.egp')}
                </Text>
              </View>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownFill,
                    {
                      width: `${(item.amount / totalDonated) * 100}%`,
                      backgroundColor: (Colors as Record<string, string>)[item.category] || Colors.primary,
                    },
                  ]}
                />
              </View>
            </Card>
          ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  textRTL: { textAlign: 'right' },
  totalCard: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingVertical: 28,
    marginTop: 8,
  },
  totalLabel: { color: Colors.textLight, fontSize: 14, opacity: 0.9 },
  totalAmount: {
    color: Colors.textLight,
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 0,
    justifyContent: 'space-between',
  },
  impactCard: {
    width: '46%',
    alignItems: 'center',
    paddingVertical: 20,
    borderLeftWidth: 4,
  },
  impactIcon: { fontSize: 32, marginBottom: 8 },
  impactValue: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  impactLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  storyCard: { alignItems: 'center', paddingVertical: 20 },
  storyIcon: { fontSize: 32, marginBottom: 8 },
  storyText: { fontSize: 14, color: Colors.text, lineHeight: 22, textAlign: 'center' },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownCategory: { fontSize: 14, fontWeight: '600', color: Colors.text },
  breakdownAmount: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  breakdownBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: { height: '100%', borderRadius: 3 },
});
