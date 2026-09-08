import { calculateEventBudget } from './budget';
import { calculateEventProfit } from './profit';
import { calculateTicketPrice } from './ticketPrice';
import { calculateBreakEven } from './breakEven';
import { calculateEventROI } from './roi';
import { calculateWeddingBudget } from './weddingBudget';
import { calculateCatering } from './catering';
import { calculateStaffing } from './staffing';
import { calculateGuestAttendance } from './guest';

export interface TestResult {
  suite: string;
  testName: string;
  passed: boolean;
  message?: string;
}

export function runAllCalculatorTests(): { total: number; passed: number; results: TestResult[] } {
  const results: TestResult[] = [];

  const assert = (suite: string, testName: string, condition: boolean, message?: string) => {
    results.push({
      suite,
      testName,
      passed: Boolean(condition),
      message: condition ? undefined : message || 'Assertion failed',
    });
  };

  // 1. Budget Calculator Tests
  {
    const normal = calculateEventBudget({
      country: 'USA',
      currency: 'USD',
      eventType: 'Conference',
      guestCount: 100,
      venue: 5000,
      catering: 4000,
      decoration: 1000,
      photography: 1500,
      videography: 1000,
      entertainment: 2000,
      marketing: 1000,
      staff: 1500,
      transportation: 500,
      equipment: 1000,
      security: 500,
      invitations: 300,
      accommodation: 0,
      miscellaneous: 700,
      contingencyPercent: 10,
    });

    assert('EventBudget', 'Calculates exact total budget with 10% contingency', normal.totalBaseExpenses === 20000 && normal.totalBudget === 22000);
    assert('EventBudget', 'Calculates correct cost per guest', normal.costPerGuest === 220);
    assert('EventBudget', 'Identifies Venue as top expense category', normal.topExpenseCategory === 'Venue');

    // Zero / Edge test
    const zero = calculateEventBudget({
      country: 'USA',
      currency: 'USD',
      eventType: 'Empty',
      guestCount: 0,
      venue: 0,
      catering: 0,
      decoration: 0,
      photography: 0,
      videography: 0,
      entertainment: 0,
      marketing: 0,
      staff: 0,
      transportation: 0,
      equipment: 0,
      security: 0,
      invitations: 0,
      accommodation: 0,
      miscellaneous: 0,
      contingencyPercent: 0,
    });
    assert('EventBudget', 'Handles zero budget safely without crashing', zero.totalBudget === 0 && zero.costPerGuest === 0);
  }

  // 2. Profit Calculator Tests
  {
    const profit = calculateEventProfit({
      ticketPrice: 150,
      expectedAttendees: 200,
      sponsorshipRevenue: 10000,
      merchandiseRevenue: 2000,
      otherRevenue: 0,
      venueCost: 8000,
      catering: 6000,
      marketing: 3000,
      staff: 2000,
      equipment: 2000,
      entertainment: 4000,
      otherExpenses: 1000,
    });

    assert('EventProfit', 'Calculates total revenue ($42,000)', profit.totalRevenue === 42000);
    assert('EventProfit', 'Calculates total expenses ($26,000)', profit.totalExpenses === 26000);
    assert('EventProfit', 'Calculates net profit ($16,000)', profit.netProfit === 16000);
    assert('EventProfit', 'Calculates positive ROI', profit.roiPercent > 60 && profit.isProfitable);
  }

  // 3. Break-Even Calculator Tests
  {
    const be = calculateBreakEven({
      fixedCosts: 10000,
      variableCostPerAttendee: 25,
      ticketPrice: 75,
      capacity: 300,
    });

    assert('BreakEven', 'Calculates contribution margin ($50)', be.contributionMargin === 50);
    assert('BreakEven', 'Calculates 200 attendees to break even', be.breakEvenQuantity === 200);
    assert('BreakEven', 'Calculates break-even revenue ($15,000)', be.breakEvenRevenue === 15000);
  }

  // 4. Ticket Price Calculator Tests
  {
    const ticket = calculateTicketPrice({
      totalEventCost: 20000,
      expectedAttendees: 200,
      desiredProfit: 5000,
      paymentProcessingPercent: 2.9,
      fixedPaymentFee: 0.30,
      platformFeePercent: 2.5,
      platformFixedFee: 0.50,
    });

    assert('TicketPrice', 'Calculates base cost per attendee ($100)', ticket.costPerAttendee === 100);
    assert('TicketPrice', 'Desired profit ticket price covers fees and yields target profit', ticket.desiredProfitTicketPrice > 130);
  }

  // 5. Wedding Budget Calculator Tests
  {
    const wedding = calculateWeddingBudget({
      country: 'UAE',
      currency: 'AED',
      guestCount: 150,
      venue: 40000,
      catering: 35000,
      bridalAttire: 15000,
      groomAttire: 5000,
      photography: 12000,
      videography: 10000,
      decoration: 25000,
      flowers: 15000,
      musicDj: 8000,
      entertainment: 6000,
      invitations: 2000,
      transportation: 3000,
      accommodation: 4000,
      makeupHair: 4000,
      cake: 3000,
      ceremony: 2000,
      miscellaneous: 5000,
      contingencyPercent: 10,
    });

    assert('WeddingBudget', 'Calculates UAE wedding budget total with contingency', wedding.totalWeddingBudget > 200000);
    assert('WeddingBudget', 'Provides industry comparison benchmarks', wedding.industryComparison.length > 5);
  }

  const passed = results.filter((r) => r.passed).length;
  return { total: results.length, passed, results };
}
