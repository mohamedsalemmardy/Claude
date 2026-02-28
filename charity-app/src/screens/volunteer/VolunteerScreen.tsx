import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../utils/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useApp } from '../../store/AppContext';
import {
  mockOpportunities,
  mockVolunteerRecords,
  mockVolunteerProfile,
} from '../../services/mockData';
import i18n from '../../i18n';
import type { VolunteerOpportunity } from '../../types';

export const VolunteerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const isRTL = state.isRTL;

  useEffect(() => {
    dispatch({ type: 'SET_OPPORTUNITIES', payload: mockOpportunities });
    dispatch({ type: 'SET_VOLUNTEER_RECORDS', payload: mockVolunteerRecords });
    dispatch({ type: 'SET_VOLUNTEER_PROFILE', payload: mockVolunteerProfile });
  }, []);

  const profile = state.volunteerProfile;

  const handleApply = (opportunity: VolunteerOpportunity) => {
    const alreadyApplied = state.volunteerRecords.some(
      (r) => r.opportunityId === opportunity.id
    );
    if (alreadyApplied) {
      Alert.alert('', i18n.t('volunteer.applied'));
      return;
    }

    dispatch({
      type: 'ADD_VOLUNTEER_RECORD',
      payload: {
        id: `vr-${Date.now()}`,
        volunteerId: state.user?.id || '',
        opportunityId: opportunity.id,
        hoursLogged: 0,
        pointsEarned: 0,
        status: 'pending',
        checkedIn: false,
        createdAt: new Date().toISOString(),
      },
    });

    Alert.alert(
      i18n.t('common.success'),
      state.language === 'ar'
        ? 'تم تقديم طلبك بنجاح وسيتم مراجعته قريباً'
        : 'Your application has been submitted successfully'
    );
  };

  return (
    <View style={styles.container}>
      <Header title={i18n.t('volunteer.title')} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Stats */}
        {profile && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{profile.totalHours}</Text>
              <Text style={styles.statLabel}>{i18n.t('volunteer.totalHours')}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardHighlight]}>
              <Text style={[styles.statValue, { color: Colors.textLight }]}>
                {profile.totalPoints}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.textLight }]}>
                {i18n.t('volunteer.totalPoints')}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{profile.rank}</Text>
              <Text style={styles.statLabel}>{i18n.t('volunteer.rank')}</Text>
            </View>
          </View>
        )}

        {/* Badges */}
        {profile && profile.badges.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {i18n.t('volunteer.badges')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesRow}
            >
              {profile.badges.map((badge) => (
                <View key={badge.id} style={styles.badgeCard}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>
                    {state.language === 'ar' ? badge.nameAr : badge.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Available Opportunities */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {i18n.t('volunteer.opportunities')}
        </Text>

        {state.opportunities.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🤷</Text>
            <Text style={styles.emptyText}>{i18n.t('volunteer.noOpportunities')}</Text>
          </View>
        ) : (
          state.opportunities.map((opp) => {
            const isApplied = state.volunteerRecords.some(
              (r) => r.opportunityId === opp.id
            );
            const spotsLeft = opp.maxVolunteers - opp.currentVolunteers;

            return (
              <Card key={opp.id}>
                <View style={[styles.oppHeader, isRTL && styles.oppHeaderRTL]}>
                  <View style={styles.oppCategoryBadge}>
                    <Text style={styles.oppCategoryText}>
                      {i18n.t(`donor.categories.${opp.category}`) || opp.category}
                    </Text>
                  </View>
                  <Text style={styles.oppPoints}>+{opp.pointsReward} pts</Text>
                </View>

                <Text style={[styles.oppTitle, isRTL && styles.textRTL]}>
                  {state.language === 'ar' ? opp.titleAr : opp.title}
                </Text>
                <Text style={[styles.oppDesc, isRTL && styles.textRTL]}>
                  {state.language === 'ar' ? opp.descriptionAr : opp.description}
                </Text>

                <View style={styles.oppDetails}>
                  <View style={styles.oppDetailRow}>
                    <Text style={styles.oppDetailIcon}>📍</Text>
                    <Text style={styles.oppDetailText}>{opp.location}</Text>
                  </View>
                  <View style={styles.oppDetailRow}>
                    <Text style={styles.oppDetailIcon}>📅</Text>
                    <Text style={styles.oppDetailText}>{opp.date}</Text>
                  </View>
                  <View style={styles.oppDetailRow}>
                    <Text style={styles.oppDetailIcon}>🕐</Text>
                    <Text style={styles.oppDetailText}>
                      {opp.startTime} - {opp.endTime}
                    </Text>
                  </View>
                  <View style={styles.oppDetailRow}>
                    <Text style={styles.oppDetailIcon}>👥</Text>
                    <Text style={styles.oppDetailText}>
                      {spotsLeft} {i18n.t('volunteer.spotsLeft')}
                    </Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(opp.currentVolunteers / opp.maxVolunteers) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {opp.currentVolunteers}/{opp.maxVolunteers}
                  </Text>
                </View>

                <Button
                  title={isApplied ? i18n.t('volunteer.applied') : i18n.t('volunteer.apply')}
                  onPress={() => handleApply(opp)}
                  disabled={isApplied || spotsLeft === 0}
                  variant={isApplied ? 'outline' : 'primary'}
                />
              </Card>
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  textRTL: { textAlign: 'right' },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCardHighlight: { backgroundColor: Colors.primary },
  statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  badgesRow: { paddingHorizontal: 16, gap: 12 },
  badgeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 90,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badgeIcon: { fontSize: 32, marginBottom: 6 },
  badgeName: { fontSize: 12, color: Colors.text, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  oppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  oppHeaderRTL: { flexDirection: 'row-reverse' },
  oppCategoryBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  oppCategoryText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  oppPoints: { fontSize: 13, color: Colors.secondary, fontWeight: 'bold' },
  oppTitle: { fontSize: 17, fontWeight: 'bold', color: Colors.text },
  oppDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 20 },
  oppDetails: { marginTop: 12, gap: 6 },
  oppDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  oppDetailIcon: { fontSize: 14 },
  oppDetailText: { fontSize: 13, color: Colors.textSecondary },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  progressText: { fontSize: 12, color: Colors.textSecondary },
});
