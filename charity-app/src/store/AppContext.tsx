import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  User,
  Donation,
  DonationImpact,
  VolunteerOpportunity,
  VolunteerRecord,
  VolunteerProfile,
  BeneficiaryApplication,
  DashboardStats,
  AppNotification,
} from '../types';
import i18n from '../i18n';

// --- State ---
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  language: 'ar' | 'en';
  isRTL: boolean;
  isOnline: boolean;
  donations: Donation[];
  impact: DonationImpact | null;
  opportunities: VolunteerOpportunity[];
  volunteerRecords: VolunteerRecord[];
  volunteerProfile: VolunteerProfile | null;
  beneficiaryApplications: BeneficiaryApplication[];
  dashboardStats: DashboardStats | null;
  notifications: AppNotification[];
}

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  language: 'ar',
  isRTL: true,
  isOnline: true,
  donations: [],
  impact: null,
  opportunities: [],
  volunteerRecords: [],
  volunteerProfile: null,
  beneficiaryApplications: [],
  dashboardStats: null,
  notifications: [],
};

// --- Actions ---
type Action =
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LANGUAGE'; payload: 'ar' | 'en' }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_DONATIONS'; payload: Donation[] }
  | { type: 'ADD_DONATION'; payload: Donation }
  | { type: 'SET_IMPACT'; payload: DonationImpact }
  | { type: 'SET_OPPORTUNITIES'; payload: VolunteerOpportunity[] }
  | { type: 'SET_VOLUNTEER_RECORDS'; payload: VolunteerRecord[] }
  | { type: 'ADD_VOLUNTEER_RECORD'; payload: VolunteerRecord }
  | { type: 'SET_VOLUNTEER_PROFILE'; payload: VolunteerProfile }
  | { type: 'SET_BENEFICIARY_APPS'; payload: BeneficiaryApplication[] }
  | { type: 'ADD_BENEFICIARY_APP'; payload: BeneficiaryApplication }
  | { type: 'UPDATE_BENEFICIARY_APP'; payload: BeneficiaryApplication }
  | { type: 'SET_DASHBOARD_STATS'; payload: DashboardStats }
  | { type: 'SET_NOTIFICATIONS'; payload: AppNotification[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_LANGUAGE':
      i18n.locale = action.payload;
      return { ...state, language: action.payload, isRTL: action.payload === 'ar' };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_DONATIONS':
      return { ...state, donations: action.payload };
    case 'ADD_DONATION':
      return { ...state, donations: [action.payload, ...state.donations] };
    case 'SET_IMPACT':
      return { ...state, impact: action.payload };
    case 'SET_OPPORTUNITIES':
      return { ...state, opportunities: action.payload };
    case 'SET_VOLUNTEER_RECORDS':
      return { ...state, volunteerRecords: action.payload };
    case 'ADD_VOLUNTEER_RECORD':
      return { ...state, volunteerRecords: [action.payload, ...state.volunteerRecords] };
    case 'SET_VOLUNTEER_PROFILE':
      return { ...state, volunteerProfile: action.payload };
    case 'SET_BENEFICIARY_APPS':
      return { ...state, beneficiaryApplications: action.payload };
    case 'ADD_BENEFICIARY_APP':
      return {
        ...state,
        beneficiaryApplications: [action.payload, ...state.beneficiaryApplications],
      };
    case 'UPDATE_BENEFICIARY_APP':
      return {
        ...state,
        beneficiaryApplications: state.beneficiaryApplications.map((app) =>
          app.id === action.payload.id ? action.payload : app
        ),
      };
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    default:
      return state;
  }
}

// --- Context ---
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => undefined,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
