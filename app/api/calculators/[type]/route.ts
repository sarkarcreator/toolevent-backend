import { NextRequest, NextResponse } from 'next/server';
import {
  calculateEventBudget,
  calculateEventProfit,
  calculateTicketPrice,
  calculateBreakEven,
  calculateEventROI,
  calculateWeddingBudget,
  calculateCatering,
  calculateStaffing,
  calculateGuestAttendance,
  generateEventChecklist,
} from '@/lib/calculators';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const body = await req.json();

    let results: any = null;

    switch (type) {
      case 'budget':
      case 'event-budget':
      case 'event-budget-calculator':
        results = calculateEventBudget(body);
        break;

      case 'profit':
      case 'event-profit':
      case 'event-profit-calculator':
        results = calculateEventProfit(body);
        break;

      case 'ticket-price':
      case 'ticket-price-calculator':
        results = calculateTicketPrice(body);
        break;

      case 'break-even':
      case 'break-even-calculator':
        results = calculateBreakEven(body);
        break;

      case 'roi':
      case 'event-roi':
      case 'event-roi-calculator':
        results = calculateEventROI(body);
        break;

      case 'wedding-budget':
      case 'wedding-budget-calculator':
      case 'dubai-wedding-budget-calculator':
        results = calculateWeddingBudget(body);
        break;

      case 'catering':
      case 'catering-calculator':
        results = calculateCatering(body);
        break;

      case 'staffing':
      case 'event-staffing':
      case 'event-staffing-calculator':
        results = calculateStaffing(body);
        break;

      case 'guest':
      case 'guest-calculator':
        results = calculateGuestAttendance(body);
        break;

      case 'checklist':
      case 'event-checklist-generator':
        results = generateEventChecklist(body);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNKNOWN_TOOL_TYPE',
              message: `Unknown calculator type: ${type}`,
            },
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      toolType: type,
      results,
    });
  } catch (error: any) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CALCULATION_ERROR',
          message: error?.message || 'Calculation failed',
        },
      },
      { status: 500 }
    );
  }
}
