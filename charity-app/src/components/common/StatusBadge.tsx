import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';
import i18n from '../../i18n';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { color: string; labelKey: string }> = {
  pending: { color: Colors.pending, labelKey: 'beneficiary.status.pending' },
  approved: { color: Colors.approved, labelKey: 'beneficiary.status.approved' },
  rejected: { color: Colors.rejected, labelKey: 'beneficiary.status.rejected' },
  under_review: { color: Colors.underReview, labelKey: 'beneficiary.status.under_review' },
  completed: { color: Colors.success, labelKey: 'donor.paymentSuccess' },
  failed: { color: Colors.error, labelKey: 'donor.paymentFailed' },
  open: { color: Colors.success, labelKey: 'common.viewAll' },
  closed: { color: Colors.disabled, labelKey: 'common.done' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || { color: Colors.disabled, labelKey: status };

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{i18n.t(config.labelKey)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
