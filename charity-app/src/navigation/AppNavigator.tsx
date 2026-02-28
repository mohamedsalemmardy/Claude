import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '../utils/colors';
import { useApp } from '../store/AppContext';
import i18n from '../i18n';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/donor/HomeScreen';
import { DonateScreen } from '../screens/donor/DonateScreen';
import { ZakatCalculatorScreen } from '../screens/donor/ZakatCalculatorScreen';
import { ImpactTrackerScreen } from '../screens/donor/ImpactTrackerScreen';
import { DonationHistoryScreen } from '../screens/donor/DonationHistoryScreen';
import { NotificationsScreen } from '../screens/donor/NotificationsScreen';
import { VolunteerScreen } from '../screens/volunteer/VolunteerScreen';
import { BeneficiaryScreen } from '../screens/beneficiary/BeneficiaryScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ProfileScreen } from '../screens/auth/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
const TabIcon: React.FC<{ icon: string; focused: boolean; label: string }> = ({
  icon,
  focused,
  label,
}) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
  </View>
);

// Donor tabs
const DonorTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} label={i18n.t('tabs.home')} />
          ),
        }}
      />
      <Tab.Screen
        name="DonateTab"
        component={DonateScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💝" focused={focused} label={i18n.t('tabs.donate')} />
          ),
        }}
      />
      <Tab.Screen
        name="VolunteerTab"
        component={VolunteerScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🙋" focused={focused} label={i18n.t('tabs.volunteer')} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} label={i18n.t('tabs.profile')} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Volunteer tabs
const VolunteerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="VolunteerHomeTab"
        component={VolunteerScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🙋" focused={focused} label={i18n.t('tabs.volunteer')} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} label={i18n.t('tabs.profile')} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Beneficiary tabs
const BeneficiaryTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="BeneficiaryHomeTab"
        component={BeneficiaryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🤝" focused={focused} label={i18n.t('tabs.home')} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} label={i18n.t('tabs.profile')} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Admin tabs
const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="AdminHomeTab"
        component={AdminDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📊" focused={focused} label={i18n.t('tabs.admin')} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} label={i18n.t('tabs.profile')} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const MainTabsSelector: React.FC = () => {
  const { state } = useApp();
  switch (state.user?.role) {
    case 'volunteer':
      return <VolunteerTabs />;
    case 'beneficiary':
      return <BeneficiaryTabs />;
    case 'admin':
      return <AdminTabs />;
    default:
      return <DonorTabs />;
  }
};

export const AppNavigator: React.FC = () => {
  const { state } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!state.isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabsSelector} />
            <Stack.Screen name="Donate" component={DonateScreen} />
            <Stack.Screen name="ZakatCalculator" component={ZakatCalculatorScreen} />
            <Stack.Screen name="ImpactTracker" component={ImpactTrackerScreen} />
            <Stack.Screen name="DonationHistory" component={DonationHistoryScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
    paddingBottom: 8,
    height: 65,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
  },
  tabIconFocused: {
    fontSize: 24,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
