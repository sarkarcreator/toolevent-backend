// Core TypeScript definitions for Toolbox.Events

export type SupportedCountry = 'USA' | 'UAE' | 'UK';
export type SupportedCurrency = 'USD' | 'AED' | 'GBP';

export interface MarketConfig {
  code: SupportedCountry;
  name: string;
  flag: string;
  defaultCurrency: SupportedCurrency;
  currencySymbol: string;
  locale: string;
  taxRateDefault: number; // percentage
  serviceChargeDefault: number; // percentage
  tippingGuideline: string;
  popularCities: string[];
}

export interface UserSession {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  subscriptionTier: 'FREE' | 'REGISTERED' | 'PRO' | 'ENTERPRISE';
  countryPreference: SupportedCountry;
  currencyPreference: SupportedCurrency;
  aiCreditsRemaining: number;
}

// 1. EVENT BUDGET CALCULATOR TYPES
export interface EventBudgetInputs {
  country: SupportedCountry;
  currency: SupportedCurrency;
  eventType: string;
  guestCount: number;
  venue: number;
  catering: number;
  decoration: number;
  photography: number;
  videography: number;
  entertainment: number;
  marketing: number;
  staff: number;
  transportation: number;
  equipment: number;
  security: number;
  invitations: number;
  accommodation: number;
  miscellaneous: number;
  contingencyPercent: number; // e.g. 10 for 10%
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  costPerGuest: number;
  color: string;
}

export interface EventBudgetResults {
  totalBaseExpenses: number;
  contingencyAmount: number;
  totalBudget: number;
  costPerGuest: number;
  recommendedBudgetMin: number;
  recommendedBudgetMax: number;
  categories: CategoryBreakdownItem[];
  topExpenseCategory: string;
}

// 2. EVENT PROFIT CALCULATOR TYPES
export interface EventProfitInputs {
  ticketPrice: number;
  expectedAttendees: number;
  sponsorshipRevenue: number;
  merchandiseRevenue: number;
  otherRevenue: number;
  venueCost: number;
  catering: number;
  marketing: number;
  staff: number;
  equipment: number;
  entertainment: number;
  otherExpenses: number;
}

export interface EventProfitResults {
  ticketRevenue: number;
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMarginPercent: number;
  revenuePerAttendee: number;
  costPerAttendee: number;
  roiPercent: number;
  breakEvenAttendees: number;
  breakEvenTicketPrice: number;
  isProfitable: boolean;
}

// 3. TICKET PRICE CALCULATOR TYPES
export interface TicketPriceInputs {
  totalEventCost: number;
  expectedAttendees: number;
  desiredProfit: number;
  paymentProcessingPercent: number; // e.g. 2.9%
  fixedPaymentFee: number; // e.g. $0.30
  platformFeePercent: number; // e.g. 2.5%
  platformFixedFee: number; // e.g. $0.50
}

export interface TicketPriceResults {
  costPerAttendee: number;
  breakEvenTicketPrice: number;
  minimumTicketPrice: number;
  recommendedTicketPrice: number;
  desiredProfitTicketPrice: number;
  effectiveTotalFeePerTicket: number;
  projectedGrossRevenue: number;
  projectedNetProfit: number;
  pricingTiers: {
    tier: string;
    suggestedPrice: number;
    description: string;
    projectedRevenue: number;
  }[];
}

// 4. BREAK-EVEN CALCULATOR TYPES
export interface BreakEvenInputs {
  fixedCosts: number;
  variableCostPerAttendee: number;
  ticketPrice: number;
  capacity?: number;
}

export interface BreakEvenResults {
  contributionMargin: number;
  contributionMarginRatio: number;
  breakEvenQuantity: number;
  breakEvenAttendees: number;
  breakEvenRevenue: number;
  profitAtSellout: number;
  capacityPercentageNeeded: number;
  capacityProfit?: number;
  capacityUtilizationNeeded?: number;
  chartData: {
    attendees: number;
    revenue: number;
    totalCost: number;
    netProfit: number;
  }[];
  sensitivityTable: {
    attendees: number;
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
  }[];
}

// 5. EVENT ROI CALCULATOR TYPES
export interface EventROIInputs {
  country?: SupportedCountry;
  currency?: SupportedCurrency;
  totalCost: number;
  directRevenue: number;
  leadsGenerated: number;
  leadConversionRate: number;
  averageCustomerValue: number;
  brandValueEstimated: number;
  partnershipValue: number;
}

export interface EventROIResults {
  pipelineValue: number;
  totalValueGenerated: number;
  netValue: number;
  directROI: number;
  totalROI: number;
  costPerLead: number;
  revenuePerLead: number;
  roiMultiple: number;
}

// 6. WEDDING BUDGET CALCULATOR TYPES
export interface WeddingBudgetInputs {
  country?: SupportedCountry;
  currency?: SupportedCurrency;
  totalBudget?: number;
  guestCount: number;
  tier?: 'STANDARD' | 'PREMIUM' | 'LUXURY';
  venue?: number;
  catering?: number;
  bridalAttire?: number;
  groomAttire?: number;
  photography?: number;
  videography?: number;
  decoration?: number;
  flowers?: number;
  musicDj?: number;
  entertainment?: number;
  invitations?: number;
  transportation?: number;
  accommodation?: number;
  makeupHair?: number;
  cake?: number;
  ceremony?: number;
  miscellaneous?: number;
  contingencyPercent?: number;
}

export interface WeddingBudgetResults {
  totalBaseExpenses: number;
  contingencyAmount: number;
  totalWeddingBudget: number;
  costPerGuest: number;
  venueCateringAmount: number;
  categories: CategoryBreakdownItem[];
  industryComparison: {
    category: string;
    yourSpendPercent: number;
    recommendedPercent: number;
    variance: string;
  }[];
}

// 7. CATERING CALCULATOR TYPES
export interface CateringInputs {
  country?: SupportedCountry;
  currency?: SupportedCurrency;
  guestCount?: number;
  guests?: number;
  mealType?: 'PLATED' | 'BUFFET' | 'CANAPES' | 'FOOD_STATIONS' | 'COCKTAIL' | 'plated_dinner' | 'buffet' | 'cocktail_passed' | 'food_stations' | 'bbq_casual';
  barPackage?: 'NONE' | 'SOFT_DRINKS' | 'BEER_WINE' | 'FULL_BAR' | 'PREMIUM_OPEN_BAR' | 'none' | 'soft_drinks' | 'beer_wine' | 'full_open_bar' | 'premium_open_bar';
  eventDurationHours?: number;
  childrenCount?: number;
  vendorMealsCount?: number;
  customCostPerPerson?: number;
  customDrinkCostPerPerson?: number;
  costPerPersonMeal?: number;
  drinkPackage?: string;
  drinksCostPerPerson?: number;
  dessertCostPerPerson?: number;
  serviceStaffHourlyRate?: number;
  serviceStaffCount?: number;
  equipmentRental?: number;
  taxPercent?: number;
  serviceChargePercent?: number;
}

export interface CateringResults {
  foodSubtotal: number;
  foodTotal: number;
  beverageSubtotal: number;
  beverageTotal: number;
  dessertSubtotal: number;
  staffLaborTotal: number;
  equipmentTotal: number;
  subtotalBeforeTax: number;
  taxAmount: number;
  taxTotal: number;
  serviceChargeAmount: number;
  serviceTotal: number;
  grandTotal: number;
  totalCateringCost: number;
  costPerGuest: number;
  costPerPerson: number;
  totalPeopleServed: number;
  drinksEstimatedCount: number;
  recommendedWaitstaff: number;
  recommendedBartenders: number;
}

// 8. EVENT STAFFING CALCULATOR TYPES
export interface StaffingInputs {
  country?: SupportedCountry;
  currency?: SupportedCurrency;
  guestCount: number;
  eventType?: 'GALA' | 'WEDDING' | 'CORPORATE' | 'CONFERENCE' | 'CONCERT' | string;
  eventDurationHours: number;
  serviceStyle?: 'PLATED' | 'BUFFET' | 'COCKTAIL' | string;
  numberOfBars?: number;
  isVipEvent?: boolean;
  setupCleanupHours?: number;
  securityStaff?: { count: number; hourlyRate: number };
  registrationStaff?: { count: number; hourlyRate: number };
  ushers?: { count: number; hourlyRate: number };
  servers?: { count: number; hourlyRate: number };
  cleaningStaff?: { count: number; hourlyRate: number };
  eventManagers?: { count: number; hourlyRate: number };
  technicians?: { count: number; hourlyRate: number };
}

export interface StaffingResults {
  totalStaffCount: number;
  totalHeadcount: number;
  totalLaborHours: number;
  totalLaborCost: number;
  costPerGuest: number;
  ratioStaffToGuest: string;
  staffToGuestRatio: string;
  roles: {
    role: string;
    count: number;
    hours: number;
    hourlyRate: number;
    totalCost: number;
    recommendedCount: number;
  }[];
  roleBreakdown: {
    role: string;
    count: number;
    hours: number;
    hourlyRate: number;
    totalCost: number;
    recommendedCount: number;
  }[];
}

// 9. GUEST RSVP CALCULATOR TYPES
export interface GuestCalculatorInputs {
  country?: SupportedCountry;
  totalInvited?: number;
  invitedCount?: number;
  eventType?: 'LOCAL_WEDDING' | 'DESTINATION_WEDDING' | 'CORPORATE_FREE' | 'CORPORATE_PAID' | 'CHARITY_GALA' | string;
  isDestination?: boolean;
  ticketed?: boolean;
  rsvpYes?: number;
  rsvpNo?: number;
  rsvpPending?: number;
  guestType?: 'wedding' | 'corporate_free' | 'corporate_paid' | 'conference' | 'private_party' | string;
}

export interface GuestCalculatorResults {
  totalInvited: number;
  confirmedCount: number;
  declinedCount: number;
  pendingCount: number;
  expectedAttendees: number;
  expectedAttendanceRate: number;
  cateringHeadcountMin: number;
  cateringHeadcountMax: number;
  expectedNoShows: number;
  responseRatePercent: number;
  historicalShowRatePercent: number;
  projectedAttendanceCount: number;
  projectedAttendanceMin: number;
  projectedAttendanceMax: number;
  recommendedCateringOrderCount: number;
  attritionRisk: 'Low' | 'Moderate' | 'High';
}

// 10. EVENT CHECKLIST TIMELINE
export interface ChecklistTask {
  id: string;
  title: string;
  category: string;
  timeframe: '90_days' | '60_days' | '30_days' | '14_days' | '7_days' | '1_day' | 'event_day' | 'post_event';
  isCompleted: boolean;
  notes?: string;
  isCustom?: boolean;
}

export interface ChecklistGeneratorInputs {
  eventType: string;
  eventDate: string;
  guestCount: number;
  country: SupportedCountry;
}

// 11. AI EVENT PLANNER TYPES
export interface AIEventPlannerInputs {
  eventType: string;
  country: SupportedCountry;
  city: string;
  guestCount: number;
  budget: number;
  currency: SupportedCurrency;
  eventDate: string;
  goals: string;
  audience: string;
  style: string;
  specialRequirements?: string;
}

export interface AIEventPlanResponse {
  title: string;
  executiveSummary: string;
  eventStrategy: string;
  budgetAllocation: { category: string; amount: number; percentage: number; rationale: string }[];
  timelineMilestones: { phase: string; timing: string; tasks: string[] }[];
  vendorCategories: { vendorType: string; priority: string; requirements: string; estimatedBudget: string }[];
  marketingPlan: { channel: string; strategy: string; timeline: string }[];
  guestManagementPlan: { step: string; action: string }[];
  eventDaySchedule: { time: string; activity: string; owner: string; location: string }[];
  riskChecklist: { risk: string; severity: 'Low' | 'Medium' | 'High'; mitigation: string }[];
  socialMediaIdeas: { platform: string; concept: string; captionExample: string }[];
  emailInvitation: { subject: string; body: string };
  whatsappInvitation: string;
  postEventFollowUpPlan: { timing: string; action: string }[];
}

// 12. STORE PRODUCTS & ORDERS
export interface DigitalProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  priceUSD: number;
  priceAED: number;
  priceGBP: number;
  imageUrl?: string;
  badge?: string;
  fileDownloadKey: string;
  isActive: boolean;
  isFeatured?: boolean;
}

export type ProductItem = DigitalProduct;

export interface OrderRecord {
  id: string;
  userId?: string;
  customerEmail: string;
  customerName?: string;
  currency: SupportedCurrency;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentProvider: string;
  items: { productId: string; name: string; price: number }[];
  createdAt: string;
}

export interface AffiliateItem {
  id: string;
  slug: string;
  name: string;
  company: string;
  category: string;
  targetUrl: string;
  description: string;
  commission?: string;
  country: string;
  clicksCount: number;
}
