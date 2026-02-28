import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';
import { useApp } from '../../store/AppContext';
import i18n from '../../i18n';

export const OfflineBanner: React.FC = () => {
  const { state } = useApp();

  if (state.isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚡ {i18n.t('common.offline')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.warning,
    paddingVertical: 8,
    alignItems: 'center',
  },
  text: {
    color: Colors.textLight,
    fontSize: 13,
    fontWeight: '600',
  },
});
