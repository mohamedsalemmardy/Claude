import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '../../utils/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { useApp } from '../../store/AppContext';
import i18n from '../../i18n';

const typeIcons: Record<string, string> = {
  donation: '💰',
  volunteer: '🙋',
  beneficiary: '🤝',
  system: 'ℹ️',
  urgent: '🚨',
};

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const isRTL = state.isRTL;

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  return (
    <View style={styles.container}>
      <Header title={i18n.t('notifications.title')} onBack={() => navigation.goBack()} />

      <FlatList
        data={state.notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyText}>{i18n.t('notifications.noNotifications')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => markAsRead(item.id)}>
            <Card style={!item.read ? styles.unreadCard : undefined}>
              <View style={[styles.row, isRTL && styles.rowRTL]}>
                <View style={[styles.iconContainer, item.type === 'urgent' && styles.urgentIcon]}>
                  <Text style={styles.icon}>{typeIcons[item.type] || 'ℹ️'}</Text>
                </View>
                <View style={styles.content}>
                  <Text style={[styles.title, isRTL && styles.textRTL]}>
                    {state.language === 'ar' ? item.titleAr : item.title}
                  </Text>
                  <Text style={[styles.body, isRTL && styles.textRTL]} numberOfLines={2}>
                    {state.language === 'ar' ? item.bodyAr : item.body}
                  </Text>
                  <Text style={styles.time}>
                    {new Date(item.createdAt).toLocaleDateString(
                      state.language === 'ar' ? 'ar-EG' : 'en-US'
                    )}
                  </Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { textAlign: 'right' },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentIcon: { backgroundColor: Colors.error + '15' },
  icon: { fontSize: 20 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.text },
  body: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, color: Colors.disabled, marginTop: 4 },
  unreadCard: { backgroundColor: Colors.primary + '05', borderLeftWidth: 3, borderLeftColor: Colors.primary },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
});
