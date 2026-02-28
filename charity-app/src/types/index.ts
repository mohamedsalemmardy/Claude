// ============================================================
// Charity App - Type Definitions
// ============================================================

// --- User & Auth ---
export type UserRole = 'donor' | 'volunteer' | 'beneficiary' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  language: 'ar' | 'en';
}

// --- Donation ---
export type PaymentMethod = 'vodafone_cash' | 'instapay' | 'bank_transfer' | 'qr_code';
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DonationCategory = 'zakat' | 'sadaqah' | 'kafala' | 'food' | 'medical' | 'education' | 'general';

export interface Donation {
  id: string;
  donorId: string;
  amount: number;
  currency: string;
  category: DonationCategory;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  transactionRef?: string;
  impactDescription?: string;
  createdAt: string;
}

export interface DonationImpact {
  donationId: string;
  familiesHelped: number;
  mealsProvided: number;
  studentsSupported: number;
  medicalCasesHelped: number;
  description: string;
  images?: string[];
}

// --- Zakat ---
export interface ZakatInput {
  cash: number;
  bankBalance: number;
  goldValue: number;
  silverValue: number;
  investments: number;
  businessInventory: number;
  debtsOwedToYou: number;
  debtsYouOwe: number;
  propertyForTrade: number;
}

export interface ZakatResult {
  totalWealth: number;
  nisab: number;
  isZakatDue: boolean;
  zakatAmount: number;
  breakdown: { label: string; value: number }[];
}

// --- Volunteer ---
export type OpportunityStatus = 'open' | 'closed' | 'in_progress';
export type VolunteerApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface VolunteerOpportunity {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  maxVolunteers: number;
  currentVolunteers: number;
  pointsReward: number;
  status: OpportunityStatus;
  skills: string[];
  imageUrl?: string;
}

export interface VolunteerRecord {
  id: string;
  volunteerId: string;
  opportunityId: string;
  hoursLogged: number;
  pointsEarned: number;
  status: VolunteerApplicationStatus;
  checkedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  createdAt: string;
}

export interface VolunteerProfile {
  userId: string;
  totalHours: number;
  totalPoints: number;
  badges: Badge[];
  certificates: Certificate[];
  rank: string;
}

export interface Badge {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface Certificate {
  id: string;
  title: string;
  hoursCompleted: number;
  issuedAt: string;
  downloadUrl: string;
}

// --- Beneficiary ---
export type BeneficiaryStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export interface BeneficiaryApplication {
  id: string;
  applicantName: string;
  nationalId: string;
  phone: string;
  address: string;
  familySize: number;
  monthlyIncome: number;
  needCategory: DonationCategory;
  description: string;
  documents: DocumentAttachment[];
  status: BeneficiaryStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: 'national_id' | 'medical_report' | 'income_proof' | 'other';
  uri: string;
  uploadedAt: string;
}

// --- Admin ---
export interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  totalVolunteers: number;
  totalBeneficiaries: number;
  pendingApplications: number;
  activeOpportunities: number;
  monthlyTrend: { month: string; amount: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
}

export interface FinancialReport {
  id: string;
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  donationsByCategory: { category: string; amount: number }[];
  createdAt: string;
}

// --- Notifications ---
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  type: 'donation' | 'volunteer' | 'beneficiary' | 'system' | 'urgent';
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// --- Offline Queue ---
export interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  createdAt: string;
  synced: boolean;
}
