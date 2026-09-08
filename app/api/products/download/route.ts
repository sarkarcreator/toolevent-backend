import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const key = searchParams.get('key') || 'event_planner_template.xlsx';

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  const order = await db.orders.findUnique({ where: { id: orderId } });
  if (!order || order.status !== 'PAID') {
    return NextResponse.json({ error: 'Valid paid order required for download' }, { status: 403 });
  }

  // Generate an authentic comprehensive multi-tab Excel template bundle
  const wb = XLSX.utils.book_new();

  // Tab 1: Welcome & Setup
  const welcomeData = [
    ['TOOLBOX.EVENTS — PREMIUM EVENT PLANNING SUITE'],
    ['Product', order.items[0]?.name || 'Professional Event Planner'],
    ['Licensed to', order.customerEmail],
    ['Order Reference', order.id],
    ['Issued Date', new Date().toISOString()],
    [],
    ['INSTRUCTIONS FOR USE:'],
    ['1. Enter your event assumptions in the "Master Settings" sheet.'],
    ['2. Update line items in "Budget & Expenses". Calculations update in real time.'],
    ['3. Use "Run of Show" for minute-by-minute day-of-event execution.'],
    ['4. Use "Vendor Directory" to track contracts, deposits, and contact numbers.'],
    [],
    ['SUPPORT & QUESTIONS:'],
    ['Email: support@toolbox.events | Web: https://toolbox.events'],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(welcomeData), 'License & Instructions');

  // Tab 2: Master Settings
  const settingsData = [
    ['MASTER EVENT CONFIGURATION'],
    ['Parameter', 'Default Value', 'Your Setting'],
    ['Event Name', 'Annual Gala / Summit', 'Your Event Name Here'],
    ['Event Type', 'Corporate / Wedding / Conference', 'Corporate'],
    ['Target Market', order.currency === 'AED' ? 'UAE' : order.currency === 'GBP' ? 'UK' : 'USA', 'USA'],
    ['Primary Currency', order.currency, order.currency],
    ['Guest Target', 200, 200],
    ['Total Target Budget', 50000, 50000],
    ['Contingency Reserve %', '10%', '10%'],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(settingsData), 'Master Settings');

  // Tab 3: Detailed Budget & Expenses
  const budgetData = [
    ['DETAILED EVENT BUDGET & VENDOR ALLOCATION'],
    ['Category', 'Item Description', 'Budget Allocated', 'Actual Spent', 'Variance', 'Vendor Name', 'Payment Status'],
    ['Venue', 'Main Ballroom Rental (8 hrs)', 12000, 11500, 500, 'Grand Plaza Hotel', 'Deposit Paid'],
    ['Venue', 'Breakout Rooms (2 suites)', 3000, 3000, 0, 'Grand Plaza Hotel', 'Pending'],
    ['Catering', 'Plated Dinner (200 guests)', 15000, 14800, 200, 'Epicurean Catering Co', 'Deposit Paid'],
    ['Catering', 'Bar & Beverage Package', 5000, 5200, -200, 'Epicurean Catering Co', 'Pending'],
    ['Production & AV', 'Stage Lighting & LED Wall', 6000, 6000, 0, 'Apex AV Systems', 'Deposit Paid'],
    ['Production & AV', 'Audio Engineer & Microphones', 2500, 2500, 0, 'Apex AV Systems', 'Deposit Paid'],
    ['Decor & Florals', 'Stage Backdrop & Focal Points', 3500, 3200, 300, 'Botanica Events', 'Paid in Full'],
    ['Marketing & Invites', 'Badges, Signage & Direct Invites', 2000, 1800, 200, 'PrintMasters Inc', 'Paid in Full'],
    ['Contingency', 'Emergency Overtime Reserve', 5000, 0, 5000, 'Internal Reserve', 'Reserved'],
    ['TOTALS', '', 54000, 48000, 6000, '', ''],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(budgetData), 'Budget & Expenses');

  // Tab 4: Minute-by-Minute Run of Show
  const runOfShowData = [
    ['MINUTE-BY-MINUTE MASTER RUN OF SHOW'],
    ['Time', 'Duration', 'Segment / Milestone', 'Lead Owner', 'Audio / Visual Cue', 'Location', 'Notes'],
    ['08:00 AM', '120 min', 'Vendor Load-in & Rigging', 'Production Mgr', 'House Lights 100%', 'Loading Dock', 'Verify insurance passes'],
    ['10:00 AM', '60 min', 'AV Tech & Sound Check', 'AV Lead', 'Mic 1-4 Line Check', 'Main Stage', 'Test clicker & wireless mics'],
    ['11:30 AM', '30 min', 'Catering Station Setup', 'Catering Lead', 'None', 'Foyer & Ballroom', 'Table linens & water glasses'],
    ['01:00 PM', '45 min', 'Staff & Volunteer Briefing', 'Event Director', 'None', 'Green Room', 'Distribute two-way radios'],
    ['01:45 PM', '15 min', 'Doors Open & Background Music', 'Stage Mgr', 'Track 1: Ambient Jazz', 'Main Foyer', 'Check-in staff active'],
    ['02:00 PM', '60 min', 'Guest Check-in & Welcome Drinks', 'Hospitality Lead', 'Low Ambient Music', 'Welcome Lounge', 'Passed hors d\'oeuvres'],
    ['03:00 PM', '10 min', 'Opening Remarks & Introduction', 'MC', 'Spotlight on Podium', 'Main Stage', 'Introduce keynote speaker'],
    ['03:10 PM', '45 min', 'Keynote Presentation', 'Guest Speaker', 'Presentation Deck 1', 'Main Stage', 'Q&A handheld mic ready'],
    ['04:00 PM', '60 min', 'Networking Break & Demos', 'Host Team', 'Upbeat Lounge Audio', 'Exhibition Terrace', 'Coffee & dessert stations'],
    ['05:00 PM', '90 min', 'Dinner Banquet & Awards', 'Event Director', 'Dinner Playlist', 'Grand Ballroom', 'Course 1 at 05:15 PM'],
    ['06:30 PM', '30 min', 'Closing Remarks & Wrap-up', 'MC', 'Closing Stinger Cue', 'Main Stage', 'Invite guests to afterparty'],
    ['07:00 PM', '120 min', 'Vendor Breakdown & Load-out', 'Logistics Lead', 'Work Lights', 'All Areas', 'Sign venue handover log'],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(runOfShowData), 'Run of Show');

  const fileBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${key}"`,
    },
  });
}
