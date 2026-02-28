import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';
import { useApp } from '../../store/AppContext';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: { label: string; onPress: () => void };
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
  const { state } = useApp();
  const isRTL = state.isRTL;

  return (
    <View style={styles.container}>
      <View style={[styles.content, isRTL && styles.contentRTL]}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={[styles.title, isRTL && styles.titleRTL]}>{title}</Text>
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.rightButton}>
            <Text style={styles.rightText}>{rightAction.label}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  backText: {
    color: Colors.textLight,
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    color: Colors.textLight,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  titleRTL: {
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  rightButton: {
    padding: 8,
  },
  rightText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
});
