import {
  DigitalProduct,
  AffiliateItem,
  SupportedCountry,
  SupportedCurrency,
} from '../types';
import bcrypt from 'bcryptjs';

// Pre-hashed passwords:
// 'Admin123!' -> $2a$10$7Z1pX...
// 'User123!' -> $2a$10$8K2qY...
const ADMIN_PW_HASH = bcrypt.hashSync('Admin123!', 10);
const USER_PW_HASH = bcrypt.hashSync('User123!', 10);

export interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'USER' | 'ADMIN';
  subscriptionTier: 'FREE' | 'REGISTERED' | 'PRO' | 'ENTERPRISE';
  countryPreference: SupportedCountry;
  currencyPreference: SupportedCurrency;
  emailVerified: boolean;
  createdAt: string;
}

export interface DBCalculation {
  id: string;
  userId?: string;
  toolType: string;
  title: string;
  country: SupportedCountry;
  currency: SupportedCurrency;
  inputs: Record<string, any>;
  results: Record<string, any>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBSavedPlan {
  id: string;
  userId: string;
  title: string;
  eventType: string;
  country: SupportedCountry;
  city?: string;
  targetDate?: string;
  guestCount: number;
  budgetTotal: number;
  planData: any;
  createdAt: string;
  updatedAt: string;
}

export interface DBOrder {
  id: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  currency: SupportedCurrency;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentProvider: string;
  items: { productId: string; name: string; price: number }[];
  createdAt: string;
}

export interface DBAffiliateClick {
  id: string;
  affiliateId: string;
  slug: string;
  referer?: string;
  country?: string;
  createdAt: string;
}

export interface DBAIUsage {
  id: string;
  userId?: string;
  action: string;
  tokensUsed: number;
  createdAt: string;
}

export interface DBContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DBBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  tags: string[];
  publishedAt: string;
  isPublished: boolean;
}

// Initial In-Memory / Global Store with Seed Data
class DataStore {
  users: DBUser[] = [
    {
      id: 'usr_admin_01',
      email: 'admin@toolbox.events',
      passwordHash: ADMIN_PW_HASH,
      name: 'System Admin',
      role: 'ADMIN',
      subscriptionTier: 'PRO',
      countryPreference: 'USA',
      currencyPreference: 'USD',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_demo_02',
      email: 'user@toolbox.events',
      passwordHash: USER_PW_HASH,
      name: 'Sarah Jenkins',
      role: 'USER',
      subscriptionTier: 'REGISTERED',
      countryPreference: 'USA',
      currencyPreference: 'USD',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
  ];

  calculations: DBCalculation[] = [
    {
      id: 'calc_sample_01',
      userId: 'usr_demo_02',
      toolType: 'event-budget',
      title: 'Annual Tech Summit 2026',
      country: 'USA',
      currency: 'USD',
      inputs: {
        eventType: 'Tech Conference',
        guestCount: 250,
        venue: 12000,
        catering: 9500,
        decoration: 2500,
        photography: 3000,
        videography: 2500,
        entertainment: 4000,
        marketing: 3500,
        staff: 2000,
        equipment: 3000,
        contingencyPercent: 10,
      },
      results: {
        totalBudget: 46200,
        costPerGuest: 184.8,
        topExpenseCategory: 'Venue',
      },
      notes: 'Initial budget approved by marketing committee.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'calc_sample_02',
      userId: 'usr_demo_02',
      toolType: 'wedding-budget',
      title: 'Dubai Marina Luxury Wedding',
      country: 'UAE',
      currency: 'AED',
      inputs: {
        guestCount: 180,
        venue: 65000,
        catering: 45000,
        bridalAttire: 20000,
        decoration: 35000,
        photography: 15000,
        videography: 12000,
        musicDj: 10000,
        flowers: 18000,
        contingencyPercent: 10,
      },
      results: {
        totalWeddingBudget: 242000,
        costPerGuest: 1344.44,
      },
      notes: 'Estimated pricing based on 5-star beachfront venue.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  savedPlans: DBSavedPlan[] = [];

  products: DigitalProduct[] = [
    {
      id: 'prod_01',
      slug: 'ultimate-event-budget-planner',
      name: 'Ultimate Event Budget Planner',
      category: 'Budget & Finance',
      description:
        'Professional multi-currency Excel & Google Sheets model with dynamic contingency, vendor payment milestones, and real-time variance dashboard.',
      features: [
        '5 Multi-tab spreadsheets (Summary, Line Items, Variance, Cashflow, Invoices)',
        'Built-in currency switchers for USD, AED, and GBP',
        'Automatic contingency calculations and overspend alerts',
        'Print-ready PDF summaries and client presentation templates',
      ],
      priceUSD: 29.0,
      priceAED: 105.0,
      priceGBP: 23.0,
      badge: 'Best Seller',
      fileDownloadKey: 'ultimate_event_budget_planner_v2.xlsx',
      isActive: true,
    },
    {
      id: 'prod_02',
      slug: 'wedding-budget-planner',
      name: 'Wedding Budget Planner Pro',
      category: 'Weddings',
      description:
        'Comprehensive wedding budget toolkit customized for USA, UK, and UAE weddings with industry spend benchmarks and vendor payment schedules.',
      features: [
        'Over 140 pre-categorized wedding expense line items',
        'Industry benchmark comparison gauges (Venue, Decor, Attire)',
        'Payment due date tracker with automatic calendar alerts',
        'Guest RSVP & seating budget link',
      ],
      priceUSD: 39.0,
      priceAED: 140.0,
      priceGBP: 31.0,
      badge: 'Popular',
      fileDownloadKey: 'wedding_budget_planner_pro.xlsx',
      isActive: true,
    },
    {
      id: 'prod_03',
      slug: 'corporate-event-planner',
      name: 'Corporate Event Planner',
      category: 'Corporate',
      description:
        'Corporate-grade event management toolkit with stakeholder reporting, ROI models, RFP vendor comparison matrices, and run-of-show templates.',
      features: [
        'Executive board summary dashboard',
        'Vendor RFP scoring matrix',
        'Sponsorship tiered package calculator',
        'Minute-by-minute master run of show',
      ],
      priceUSD: 49.0,
      priceAED: 180.0,
      priceGBP: 39.0,
      badge: 'Executive',
      fileDownloadKey: 'corporate_event_planner_bundle.xlsx',
      isActive: true,
    },
    {
      id: 'prod_04',
      slug: 'conference-planner',
      name: 'Conference Planner & Stage Flow',
      category: 'Conferences',
      description:
        'Full scale conference planning system covering multi-track speaker management, AV production run sheets, registration logistics, and sponsor tiers.',
      features: [
        'Multi-stage agenda and speaker scheduler',
        'AV technician cue sheet and teleprompter script tracker',
        'Catering break and dietary distribution model',
        'Sponsor booth floorplan inventory manager',
      ],
      priceUSD: 49.0,
      priceAED: 180.0,
      priceGBP: 39.0,
      fileDownloadKey: 'conference_planner_toolkit.xlsx',
      isActive: true,
    },
    {
      id: 'prod_05',
      slug: 'event-profit-planner',
      name: 'Event Profit & Ticket Yield Planner',
      category: 'Profit & Revenue',
      description:
        'Advanced financial modeling tool to optimize ticket tier pricing, simulate attendance elasticity, and maximize gross profit margins.',
      features: [
        'Multi-tier ticket pricing simulator (Early Bird, GA, VIP)',
        'Payment processor and platform fee deduction models',
        'Break-even sensitivity curve with capacity ceilings',
        'Sponsorship & Merchandise margin calculations',
      ],
      priceUSD: 35.0,
      priceAED: 129.0,
      priceGBP: 28.0,
      fileDownloadKey: 'event_profit_planner.xlsx',
      isActive: true,
    },
    {
      id: 'prod_06',
      slug: 'event-roi-planner',
      name: 'Event ROI & Value Calculator',
      category: 'Corporate',
      description:
        'B2B event ROI analysis tool to calculate direct revenue, pipeline generation, customer acquisition cost (CAC), and multi-touch brand attribution.',
      features: [
        'Sales pipeline attribution formula',
        'Cost per qualified lead (CPL) analytics',
        'Post-event stakeholder ROI slide deck template',
        'Comparative year-over-year event efficiency matrix',
      ],
      priceUSD: 35.0,
      priceAED: 129.0,
      priceGBP: 28.0,
      fileDownloadKey: 'event_roi_planner.xlsx',
      isActive: true,
    },
    {
      id: 'prod_07',
      slug: 'event-planning-checklist',
      name: 'Event Planning Master Checklist',
      category: 'Checklists & Ops',
      description:
        'A comprehensive 300+ item operational timeline from 12 months out to post-event teardown, fully editable in Excel, Notion, and PDF.',
      features: [
        'Timeline segmented into 9 distinct planning phases',
        'Role delegation tags and progress completion meters',
        'Emergency contingency and vendor risk checklist',
        'Post-event invoice and vendor reconciliation sheet',
      ],
      priceUSD: 19.0,
      priceAED: 70.0,
      priceGBP: 15.0,
      fileDownloadKey: 'event_planning_checklist_master.xlsx',
      isActive: true,
    },
    {
      id: 'prod_08',
      slug: 'complete-event-planning-bundle',
      name: 'Complete Event Planning Bundle (All 7 Planners)',
      category: 'Bundles',
      description:
        'Get all 7 professional event planning tools, financial models, checklists, and templates in one complete master bundle at a 60% discount.',
      features: [
        'Includes all 7 standalone planners and toolkits',
        'Lifetime updates and future template releases',
        'Bonus: 50+ Event contract clause templates & vendor RFPs',
        'Priority email support and setup consultation guide',
      ],
      priceUSD: 99.0,
      priceAED: 360.0,
      priceGBP: 79.0,
      badge: 'Best Value (Save 60%)',
      fileDownloadKey: 'complete_event_planning_bundle_master.zip',
      isActive: true,
    },
  ];

  orders: DBOrder[] = [
    {
      id: 'ord_sample_01',
      userId: 'usr_demo_02',
      customerEmail: 'user@toolbox.events',
      customerName: 'Sarah Jenkins',
      currency: 'USD',
      totalAmount: 29.0,
      status: 'PAID',
      paymentProvider: 'TEST_MODE',
      items: [
        {
          productId: 'prod_01',
          name: 'Ultimate Event Budget Planner',
          price: 29.0,
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  affiliates: AffiliateItem[] = [
    {
      id: 'aff_01',
      slug: 'rsvpify',
      name: 'RSVPify',
      company: 'RSVPify LLC',
      category: 'Registration & RSVP',
      targetUrl: 'https://rsvpify.com',
      description: 'End-to-end event management, customized RSVP workflows, and online ticket sales.',
      commission: 'Up to 25% recurring',
      country: 'GLOBAL',
      clicksCount: 142,
    },
    {
      id: 'aff_02',
      slug: 'jotform',
      name: 'Jotform Event Forms',
      company: 'Jotform Inc.',
      category: 'Event Forms',
      targetUrl: 'https://jotform.com',
      description: 'Powerful custom registration forms, waiver signatures, and vendor intake forms.',
      commission: '30% recurring',
      country: 'GLOBAL',
      clicksCount: 89,
    },
    {
      id: 'aff_03',
      slug: 'eventbrite',
      name: 'Eventbrite Organizers',
      company: 'Eventbrite Inc.',
      category: 'Ticketing & Discovery',
      targetUrl: 'https://eventbrite.com',
      description: 'Global ticketing platform and attendee discovery marketplace for ticketed events.',
      commission: 'Tiered partner rate',
      country: 'GLOBAL',
      clicksCount: 210,
    },
    {
      id: 'aff_04',
      slug: 'canva',
      name: 'Canva Pro for Events',
      company: 'Canva Pty Ltd',
      category: 'Marketing & Design',
      targetUrl: 'https://canva.com',
      description: 'Design luxury invitations, name badges, social banners, and event print collateral.',
      commission: '$36 per new subscriber',
      country: 'GLOBAL',
      clicksCount: 175,
    },
    {
      id: 'aff_05',
      slug: 'asana',
      name: 'Asana Event Operations',
      company: 'Asana Inc.',
      category: 'Project Management',
      targetUrl: 'https://asana.com',
      description: 'Keep your entire event staff, volunteers, and vendors on schedule in real time.',
      commission: '20% commission',
      country: 'GLOBAL',
      clicksCount: 64,
    },
  ];

  affiliateClicks: DBAffiliateClick[] = [];

  aiUsages: DBAIUsage[] = [];

  contactMessages: DBContactMessage[] = [
    {
      id: 'msg_01',
      name: 'Marcus Vance',
      email: 'marcus@eventscorp.co.uk',
      subject: 'Inquiry regarding corporate enterprise license',
      message: 'Hello, we are planning 40+ corporate conferences across London and UAE this year. Can we license the full template bundle for our entire agency team?',
      isRead: false,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  blogPosts: DBBlogPost[] = [
    {
      id: 'blog_01',
      slug: 'how-to-create-an-event-budget',
      title: 'How to Create a Rock-Solid Event Budget (With Free Formulas & Checklist)',
      excerpt:
        'A step-by-step masterclass in allocating venue, catering, AV production, and contingency funds without nasty surprise costs.',
      content: `Planning an event without a rigorous budget is like sailing a ship without a compass. Whether you are organizing a 50-person executive dinner in New York, a 500-guest luxury wedding in Dubai, or a tech conference in London, budget discipline is the single biggest predictor of event success.

### 1. The Rule of Seven Categories
Professional event planners group expenses into seven core buckets:
- **Venue & Space Rental**: 20% – 30%
- **Catering & Beverage**: 25% – 35%
- **Production, AV & Staging**: 12% – 18%
- **Decor, Florals & Signage**: 8% – 12%
- **Marketing, PR & Invites**: 5% – 10%
- **Staffing, Security & Logistics**: 5% – 8%
- **Contingency Reserve**: 10% (Never skip this!)

### 2. Factoring the Hidden Costs
Always account for local taxes (e.g. 5% VAT in UAE, 20% in the UK, variable state sales taxes in the USA), mandatory venue service fees (typically 18–22% in the US), overtime fees for security and AV crews, and credit card processing charges.

### 3. Calculate with Toolbox.Events
Use our free [Event Budget Calculator](/tools/event-budget-calculator) to instantly benchmark your guest counts and download ready-to-present PDF reports.`,
      category: 'Budgeting',
      author: 'Elena Rostova, Lead Event Strategist',
      readTime: '6 min read',
      tags: ['Budgeting', 'Planning', 'Corporate', 'Conferences'],
      publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      isPublished: true,
    },
    {
      id: 'blog_02',
      slug: 'how-much-should-i-charge-for-event-tickets',
      title: 'How Much Should You Charge for Event Tickets? The Complete Pricing Strategy',
      excerpt:
        'Learn the mathematical formula to price your event tickets, cover all fixed fees, and guarantee your desired profit margin.',
      content: `Setting the right ticket price is a delicate balance of covering costs, capturing perceived value, and driving ticket velocity.

### The Pricing Math
To guarantee your target profit, use the standard gross ticket formula:
$$Ticket Price = \\frac{Cost Per Attendee + Desired Profit Per Attendee + Fixed Fees}{1 - (Payment Processing Rate + Platform Rate)}$$

### The Tiered Pricing Secret
Never offer a single flat price. Always structure at least three tiers:
1. **Super Early Bird (20% discount)**: Creates initial social proof and covers early venue deposits.
2. **General Admission (Target price)**: The baseline price that captures 60% of your audience.
3. **VIP Experience (65%+ premium)**: Includes dedicated check-in, preferred seating, and exclusive networking. VIP tickets often generate up to 40% of total event net profit.

Try our free [Ticket Price Calculator](/tools/ticket-price-calculator) to test different scenarios in seconds.`,
      category: 'Ticketing & Profit',
      author: 'David Chen, Event Finance Director',
      readTime: '5 min read',
      tags: ['Ticketing', 'Pricing', 'Profit', 'ROI'],
      publishedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      isPublished: true,
    },
    {
      id: 'blog_03',
      slug: 'dubai-wedding-budget-guide',
      title: 'Dubai Wedding Budget Guide 2026: Realistic Costs in AED & Luxury Planning',
      excerpt:
        'Everything you need to know about wedding venue fees, luxury floral arrangements, municipality taxes, and catering rates across the UAE.',
      content: `Dubai is one of the premier luxury destination wedding hubs in the world. However, planning a wedding in the UAE involves unique cost structures that differ significantly from western markets.

### Key UAE Cost Factors
- **5-Star Beachfront Venues**: In Dubai (Palm Jumeirah, Downtown, JBR), expect minimum food & beverage spend commitments ranging from AED 40,000 to AED 180,000 depending on season.
- **VAT & Municipality Fees**: Always budget 5% UAE VAT and standard 7-10% municipality/service fees on luxury ballroom bookings.
- **Lavish Kosha & Floral Decor**: Stage design (Kosha) and imported florals often represent 15–20% of total spend in regional celebrations.

Use our [Dubai Wedding Budget Calculator](/uae/dubai-wedding-budget-calculator) tailored specifically with local UAE AED parameters.`,
      category: 'Weddings',
      author: 'Noor Al-Mansoor, Dubai Event Planner',
      readTime: '7 min read',
      tags: ['Weddings', 'Dubai', 'UAE', 'Luxury'],
      publishedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      isPublished: true,
    },
    {
      id: 'blog_04',
      slug: 'how-to-calculate-event-roi',
      title: 'How to Calculate Event ROI & Prove Business Value to Executives',
      excerpt:
        'Turn fuzzy event metrics into hard revenue, pipeline attribution, and cost-per-lead statistics that your CFO will love.',
      content: `Executives no longer greenlight corporate events for vanity. Today, every dollar invested in conferences, summits, and client dinners must show clear return on investment (ROI).

### The Simple ROI Formula
$$\\text{Event ROI} = \\left( \\frac{\\text{Net Return (Direct Revenue + Pipeline Value)} - \\text{Total Investment}}{\\text{Total Investment}} \\right) \\times 100$$

### Measuring Indirect Pipeline
For B2B events, direct ticket sales are only a fraction of value. Calculate your *Sourced Pipeline Value* and *Accelerated Deal Value* within 90 days post-event to quantify full impact.

Calculate your exact return with our [Event ROI Calculator](/tools/event-roi-calculator).`,
      category: 'Analytics',
      author: 'David Chen, Event Finance Director',
      readTime: '6 min read',
      tags: ['ROI', 'Corporate', 'Analytics', 'B2B'],
      publishedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      isPublished: true,
    },
  ];

  siteSettings: Record<string, any> = {
    heroHeadline: 'Plan Your Event With Confidence',
    heroSubheading:
      'Free calculators, AI planning tools, budgets, profit calculators and professional event templates for the USA, UAE and UK.',
    aiFreeTierMonthlyLimit: 3,
    aiRegisteredMonthlyLimit: 15,
    aiProMonthlyLimit: 100,
    allowRegistration: true,
  };
}

// Global Singleton
const globalStore = new DataStore();

export const db = {
  // Users
  users: {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
      if (where.email) {
        return globalStore.users.find((u) => u.email.toLowerCase() === where.email?.toLowerCase()) || null;
      }
      if (where.id) {
        return globalStore.users.find((u) => u.id === where.id) || null;
      }
      return null;
    },
    create: async ({ data }: { data: Omit<DBUser, 'id' | 'createdAt'> }) => {
      const user: DBUser = {
        ...data,
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      globalStore.users.push(user);
      return user;
    },
    findMany: async () => {
      return globalStore.users.map(({ passwordHash, ...safeUser }) => safeUser);
    },
    count: async () => globalStore.users.length,
  },

  // Calculations
  calculations: {
    create: async ({ data }: { data: Omit<DBCalculation, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const calc: DBCalculation = {
        ...data,
        id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      globalStore.calculations.unshift(calc);
      return calc;
    },
    findMany: async ({ where }: { where?: { userId?: string; toolType?: string } } = {}) => {
      let list = globalStore.calculations;
      if (where?.userId) {
        list = list.filter((c) => c.userId === where.userId);
      }
      if (where?.toolType) {
        list = list.filter((c) => c.toolType === where.toolType);
      }
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return globalStore.calculations.find((c) => c.id === where.id) || null;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<DBCalculation> }) => {
      const idx = globalStore.calculations.findIndex((c) => c.id === where.id);
      if (idx === -1) return null;
      globalStore.calculations[idx] = {
        ...globalStore.calculations[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return globalStore.calculations[idx];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = globalStore.calculations.findIndex((c) => c.id === where.id);
      if (idx === -1) return false;
      globalStore.calculations.splice(idx, 1);
      return true;
    },
    count: async () => globalStore.calculations.length,
  },

  // Saved Plans
  savedPlans: {
    create: async ({ data }: { data: Omit<DBSavedPlan, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const plan: DBSavedPlan = {
        ...data,
        id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      globalStore.savedPlans.unshift(plan);
      return plan;
    },
    findMany: async ({ where }: { where?: { userId?: string } } = {}) => {
      if (where?.userId) {
        return globalStore.savedPlans.filter((p) => p.userId === where.userId);
      }
      return globalStore.savedPlans;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const idx = globalStore.savedPlans.findIndex((p) => p.id === where.id);
      if (idx === -1) return false;
      globalStore.savedPlans.splice(idx, 1);
      return true;
    },
    count: async () => globalStore.savedPlans.length,
  },

  // Products
  products: {
    findMany: async () => globalStore.products.filter((p) => p.isActive),
    findUnique: async ({ where }: { where: { slug?: string; id?: string } }) => {
      if (where.slug) return globalStore.products.find((p) => p.slug === where.slug) || null;
      if (where.id) return globalStore.products.find((p) => p.id === where.id) || null;
      return null;
    },
    count: async () => globalStore.products.length,
  },

  // Orders
  orders: {
    create: async ({ data }: { data: Omit<DBOrder, 'id' | 'createdAt'> }) => {
      const order: DBOrder = {
        ...data,
        id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      globalStore.orders.unshift(order);
      return order;
    },
    findMany: async ({ where }: { where?: { userId?: string; customerEmail?: string } } = {}) => {
      let list = globalStore.orders;
      if (where?.userId) {
        list = list.filter((o) => o.userId === where.userId);
      }
      if (where?.customerEmail) {
        list = list.filter((o) => o.customerEmail.toLowerCase() === where.customerEmail?.toLowerCase());
      }
      return list;
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return globalStore.orders.find((o) => o.id === where.id) || null;
    },
    count: async () => globalStore.orders.length,
    totalRevenue: async () => {
      return globalStore.orders
        .filter((o) => o.status === 'PAID')
        .reduce((sum, o) => sum + o.totalAmount, 0);
    },
  },

  // Affiliates
  affiliates: {
    findMany: async () => globalStore.affiliates,
    findUnique: async ({ where }: { where: { slug: string } }) => {
      return globalStore.affiliates.find((a) => a.slug === where.slug) || null;
    },
    trackClick: async (slug: string, meta?: { referer?: string; country?: string }) => {
      const aff = globalStore.affiliates.find((a) => a.slug === slug);
      if (aff) {
        aff.clicksCount += 1;
        const click: DBAffiliateClick = {
          id: `clk_${Date.now()}`,
          affiliateId: aff.id,
          slug,
          referer: meta?.referer,
          country: meta?.country,
          createdAt: new Date().toISOString(),
        };
        globalStore.affiliateClicks.push(click);
      }
      return aff;
    },
    totalClicks: async () => {
      return globalStore.affiliates.reduce((sum, a) => sum + a.clicksCount, 0);
    },
  },

  // AI Usage
  aiUsage: {
    record: async (userId: string | undefined, action: string, tokensUsed: number = 250) => {
      const record: DBAIUsage = {
        id: `ai_${Date.now()}`,
        userId,
        action,
        tokensUsed,
        createdAt: new Date().toISOString(),
      };
      globalStore.aiUsages.push(record);
      return record;
    },
    getMonthlyCount: async (userId?: string) => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
      return globalStore.aiUsages.filter(
        (u) => (!userId || u.userId === userId) && new Date(u.createdAt) > thirtyDaysAgo
      ).length;
    },
    count: async () => globalStore.aiUsages.length,
  },

  // Blog Posts
  blog: {
    findMany: async () => globalStore.blogPosts.filter((b) => b.isPublished),
    findUnique: async ({ where }: { where: { slug: string } }) => {
      return globalStore.blogPosts.find((b) => b.slug === where.slug) || null;
    },
    count: async () => globalStore.blogPosts.length,
  },

  // Contact Messages
  contact: {
    create: async (data: Omit<DBContactMessage, 'id' | 'isRead' | 'createdAt'>) => {
      const msg: DBContactMessage = {
        ...data,
        id: `msg_${Date.now()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      globalStore.contactMessages.unshift(msg);
      return msg;
    },
    findMany: async () => globalStore.contactMessages,
    count: async () => globalStore.contactMessages.length,
  },

  // Site Settings
  settings: {
    get: async () => globalStore.siteSettings,
    update: async (updates: Record<string, any>) => {
      globalStore.siteSettings = { ...globalStore.siteSettings, ...updates };
      return globalStore.siteSettings;
    },
  },
};
