import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/db/prisma';
import { verifyDownloadToken } from '@/lib/payment/stripe';

export const runtime = 'nodejs';

type WorkbookContext = {
  workbook: ExcelJS.Workbook;
  productName: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  currency: string;
};

function title(ws: ExcelJS.Worksheet, text: string) {
  ws.addRow([text]);
  ws.mergeCells(1, 1, 1, 8);
  ws.getCell(1, 1).font = { bold: true, size: 16 };
  ws.getCell(1, 1).alignment = { vertical: 'middle' };
  ws.getRow(1).height = 28;
}

function header(ws: ExcelJS.Worksheet, values: string[]) {
  const r = ws.addRow(values);
  r.font = { bold: true };
  r.alignment = { vertical: 'middle', wrapText: true };
  r.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF3F8' } };
  });
  return r;
}

function blankRows(ws: ExcelJS.Worksheet, count: number, columns: number) {
  for (let i = 0; i < count; i += 1) ws.addRow(new Array(columns).fill(''));
}

function addLicenseSheet(ctx: WorkbookContext) {
  const ws = ctx.workbook.addWorksheet('License & Instructions');
  ws.addRow(['TOOLBOX.EVENTS — PURCHASED TEMPLATE']);
  ws.getCell(1, 1).font = { bold: true, size: 16 };
  ws.addRow(['Product', ctx.productName]);
  ws.addRow(['Licensed to', ctx.customerName || 'Not provided']);
  ws.addRow(['Customer email', ctx.customerEmail]);
  ws.addRow(['Order reference', ctx.orderId]);
  ws.addRow(['Issued date', new Date().toISOString()]);
  ws.addRow(['Currency', ctx.currency]);
  ws.addRow([]);
  ws.addRow(['IMPORTANT']);
  ws.getCell(9, 1).font = { bold: true };
  ws.addRow(['This workbook intentionally contains no fictional event, vendor, customer, venue, attendance, spending or revenue data. Enter your own event information in the input fields.']);
  ws.addRow(['Formula cells calculate from the information you enter and are not pre-filled with invented business results.']);
  ws.addRow(['Support: hello@toolbox.events | https://toolbox.events']);
  ws.getColumn(1).width = 105;
}

function addBudgetTemplate(ctx: WorkbookContext) {
  const ws = ctx.workbook.addWorksheet('Budget & Expenses');
  title(ws, 'EVENT BUDGET & EXPENSES');
  header(ws, ['Category', 'Item / Expense', 'Budget', 'Actual', 'Variance', 'Vendor', 'Payment Status', 'Notes']);
  const categories = ['Venue', 'Catering', 'Production & AV', 'Decor & Florals', 'Marketing', 'Staffing', 'Transportation', 'Accommodation', 'Insurance & Permits', 'Technology', 'Other'];
  for (let i = 0; i < 55; i += 1) {
    const row = ws.addRow([categories[i % categories.length], '', '', '', '', '', '', '']);
    const n = row.number;
    row.getCell(5).value = { formula: `IF(OR(C${n}<>"",D${n}<>""),N(C${n})-N(D${n}),"")` };
    row.getCell(3).numFmt = '#,##0.00';
    row.getCell(4).numFmt = '#,##0.00';
    row.getCell(5).numFmt = '#,##0.00';
  }
  const totalRow = ws.addRow(['TOTAL', '', '', '', '', '', '', '']);
  totalRow.font = { bold: true };
  totalRow.getCell(3).value = { formula: 'SUM(C3:C57)' };
  totalRow.getCell(4).value = { formula: 'SUM(D3:D57)' };
  totalRow.getCell(5).value = { formula: 'C58-D58' };
  totalRow.getCell(3).numFmt = '#,##0.00';
  totalRow.getCell(4).numFmt = '#,##0.00';
  totalRow.getCell(5).numFmt = '#,##0.00';
  [20, 34, 16, 16, 16, 28, 20, 34].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  ws.freezePanes = 'A3';
  ws.autoFilter = { from: 'A2', to: 'H57' };
}

function addWeddingTemplate(ctx: WorkbookContext) {
  const ws = ctx.workbook.addWorksheet('Wedding Budget');
  title(ws, 'WEDDING BUDGET PLANNER');
  ws.addRow(['Wedding / Couple Name', '']);
  ws.addRow(['Event Date', '']);
  ws.addRow(['Guest Count', '']);
  ws.addRow(['Currency', ctx.currency]);
  ws.addRow([]);
  header(ws, ['Category', 'Expense', 'Budget', 'Actual', 'Variance', 'Due Date', 'Vendor / Contact', 'Payment Status']);
  const categories = ['Venue', 'Catering', 'Decor', 'Photography & Video', 'Attire', 'Beauty', 'Entertainment', 'Invitations & Stationery', 'Transportation', 'Accommodation', 'Ceremony', 'Reception', 'Flowers', 'Cake & Desserts', 'Favors', 'Planner / Coordinator', 'Other'];
  for (let i = 0; i < 90; i += 1) {
    const row = ws.addRow([categories[i % categories.length], '', '', '', '', '', '', '']);
    const n = row.number;
    row.getCell(5).value = { formula: `IF(OR(C${n}<>"",D${n}<>""),N(C${n})-N(D${n}),"")` };
  }
  const total = ws.addRow(['TOTAL', '', '', '', '', '', '', '']);
  total.font = { bold: true };
  total.getCell(3).value = { formula: 'SUM(C7:C96)' };
  total.getCell(4).value = { formula: 'SUM(D7:D96)' };
  total.getCell(5).value = { formula: 'C97-D97' };
  [20, 36, 16, 16, 16, 16, 28, 20].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  ws.freezePanes = 'A7';
}

function addCorporateTemplate(ctx: WorkbookContext) {
  const ws = ctx.workbook.addWorksheet('Corporate Event');
  title(ws, 'CORPORATE EVENT PLANNER');
  ws.addRow(['Event Name', '']);
  ws.addRow(['Event Date', '']);
  ws.addRow(['Business Objective', '']);
  ws.addRow(['Target Attendance', '']);
  ws.addRow(['Budget', '']);
  ws.addRow([]);
  header(ws, ['Stakeholder', 'Role', 'Decision / Deliverable', 'Owner', 'Due Date', 'Status', 'Notes']);
  blankRows(ws, 35, 7);
  const rfp = ctx.workbook.addWorksheet('Vendor RFP Matrix');
  title(rfp, 'VENDOR RFP COMPARISON');
  header(rfp, ['Vendor', 'Category', 'Quoted Cost', 'Score', 'Scope Fit', 'Availability', 'Notes']);
  blankRows(rfp, 25, 7);
  const sponsor = ctx.workbook.addWorksheet('Sponsorship Calculator');
  title(sponsor, 'SPONSORSHIP & REVENUE');
  header(sponsor, ['Tier', 'Price', 'Quantity', 'Gross Revenue', 'Notes']);
  for (let i = 0; i < 12; i += 1) {
    const row = sponsor.addRow(['', '', '', '', '']);
    const n = row.number;
    row.getCell(4).value = { formula: `IF(OR(B${n}<>"",C${n}<>""),N(B${n})*N(C${n}),"")` };
  }
  sponsor.addRow(['TOTAL', '', '', { formula: 'SUM(D3:D14)' }, '']);
  [24, 22, 18, 20, 20, 20, 36].forEach((w, i) => { rfp.getColumn(i + 1).width = w; });
  [24, 18, 16, 22, 36].forEach((w, i) => { sponsor.getColumn(i + 1).width = w; });
}

function addConferenceTemplate(ctx: WorkbookContext) {
  const agenda = ctx.workbook.addWorksheet('Conference Agenda');
  title(agenda, 'CONFERENCE AGENDA & STAGE FLOW');
  header(agenda, ['Date', 'Start', 'End', 'Track / Stage', 'Session', 'Speaker', 'Room', 'AV Cue', 'Notes']);
  blankRows(agenda, 100, 9);
  const speakers = ctx.workbook.addWorksheet('Speakers');
  title(speakers, 'SPEAKER MANAGEMENT');
  header(speakers, ['Speaker', 'Organization', 'Topic', 'Contact', 'Session', 'Travel / Hotel', 'AV Requirements', 'Status']);
  blankRows(speakers, 50, 8);
  const sponsors = ctx.workbook.addWorksheet('Sponsors');
  title(sponsors, 'SPONSOR & EXHIBITOR TRACKER');
  header(sponsors, ['Company', 'Tier', 'Fee', 'Booth / Space', 'Deliverables', 'Contact', 'Payment Status', 'Notes']);
  blankRows(sponsors, 50, 8);
}

function addProfitTemplate(ctx: WorkbookContext) {
  const ws = ctx.workbook.addWorksheet('Profit & Ticket Yield');
  title(ws, 'EVENT PROFIT & TICKET YIELD PLANNER');
  ws.addRow(['Currency', ctx.currency]);
  ws.addRow([]);
  header(ws, ['Ticket Tier', 'Price', 'Expected Tickets', 'Gross Sales', 'Processor / Platform Fee', 'Net Sales', 'Notes']);
  for (let i = 0; i < 15; i += 1) {
    const row = ws.addRow(['', '', '', '', '', '', '']);
    const n = row.number;
    row.getCell(4).value = { formula: `IF(OR(B${n}<>"",C${n}<>""),N(B${n})*N(C${n}),"")` };
    row.getCell(6).value = { formula: `IF(D${n}<>"",D${n}-N(E${n}),"")` };
  }
  ws.addRow(['TOTAL', '', '', { formula: 'SUM(D4:D18)' }, { formula: 'SUM(E4:E18)' }, { formula: 'SUM(F4:F18)' }, '']);
  ws.getCell(21, 1).value = 'Financial Summary';
  ws.getCell(21, 1).font = { bold: true, size: 13 };
  ws.getCell(22, 1).value = 'Fixed Costs';
  ws.getCell(23, 1).value = 'Variable Costs';
  ws.getCell(24, 1).value = 'Net Sales';
  ws.getCell(24, 2).value = { formula: 'F19' };
  ws.getCell(25, 1).value = 'Estimated Profit';
  ws.getCell(25, 2).value = { formula: 'B24-B22-B23' };
  ws.getCell(26, 1).value = 'Break-even Ticket Count';
  ws.getCell(26, 2).value = { formula: 'IFERROR(B22/(AVERAGE(B4:B18)-AVERAGE(E4:E18)-IFERROR(B23/AVERAGE(C4:C18),0)),0)' };
  [24, 18, 20, 18, 24, 18, 30].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

function addRoiTemplate(ctx: WorkbookContext) {
  const ws = ctx.workbook.addWorksheet('Event ROI');
  title(ws, 'EVENT ROI & VALUE CALCULATOR');
  ws.addRow(['Currency', ctx.currency]);
  ws.addRow([]);
  header(ws, ['Metric', 'Value', 'Notes']);
  const rows = [
    ['Total Event Investment', '', 'Enter total event investment'],
    ['Direct Revenue', '', 'Enter revenue directly attributable to the event'],
    ['Pipeline / Opportunity Value', '', 'Enter qualified pipeline value if applicable'],
    ['Other Measurable Return', '', 'Enter other measurable financial return'],
    ['Total Measurable Return', '', 'Calculated'],
    ['Net Return', '', 'Calculated'],
    ['ROI %', '', 'Calculated'],
    ['Cost per Qualified Lead', '', 'Calculated'],
    ['Qualified Leads', '', 'Enter number of qualified leads'],
  ];
  rows.forEach((r) => ws.addRow(r));
  ws.getCell(8, 2).value = { formula: 'SUM(B5:B7)' };
  ws.getCell(9, 2).value = { formula: 'B8-B4' };
  ws.getCell(10, 2).value = { formula: 'IFERROR(B9/B4,0)' };
  ws.getCell(11, 2).value = { formula: 'IFERROR(B4/B12,0)' };
  ws.getCell(10, 2).numFmt = '0.00%';
  ws.getColumn(1).width = 34;
  ws.getColumn(2).width = 22;
  ws.getColumn(3).width = 70;
}

function addChecklistTemplate(ctx: WorkbookContext) {
  const ws = ctx.workbook.addWorksheet('Master Checklist');
  title(ws, 'EVENT PLANNING MASTER CHECKLIST');
  header(ws, ['Phase', 'Task', 'Owner', 'Due Date', 'Priority', 'Status', 'Notes']);
  const phases = ['Strategy & Scope', 'Budget & Finance', 'Venue & Vendors', 'Marketing & Registration', 'Staffing & Operations', 'Production & AV', 'Guest Experience', 'Event Day', 'Post-Event'];
  const tasks = [
    'Confirm event objective', 'Define target audience', 'Approve working budget', 'Create vendor shortlist', 'Request vendor proposals',
    'Confirm venue requirements', 'Set registration process', 'Create communications plan', 'Assign event roles', 'Create run of show',
    'Confirm production requirements', 'Review accessibility requirements', 'Confirm catering requirements', 'Prepare emergency contacts',
    'Run final team briefing', 'Confirm guest communications', 'Complete event-day checklist', 'Collect invoices and receipts',
    'Reconcile actual spend', 'Collect feedback', 'Prepare post-event report', 'Archive event documents',
  ];
  for (let i = 0; i < 320; i += 1) ws.addRow([phases[Math.floor(i / 36) % phases.length], tasks[i % tasks.length], '', '', '', 'Not started', '']);
  [26, 46, 24, 16, 16, 18, 42].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  ws.freezePanes = 'A3';
  ws.autoFilter = { from: 'A2', to: 'G322' };
}

function addBundle(ctx: WorkbookContext) {
  addBudgetTemplate(ctx);
  addWeddingTemplate(ctx);
  addCorporateTemplate(ctx);
  addConferenceTemplate(ctx);
  addProfitTemplate(ctx);
  addRoiTemplate(ctx);
  addChecklistTemplate(ctx);
}

function buildWorkbook(ctx: WorkbookContext, slug: string) {
  addLicenseSheet(ctx);
  switch (slug) {
    case 'ultimate-event-budget-planner': addBudgetTemplate(ctx); break;
    case 'wedding-budget-planner': addWeddingTemplate(ctx); break;
    case 'corporate-event-planner': addCorporateTemplate(ctx); break;
    case 'conference-planner': addConferenceTemplate(ctx); break;
    case 'event-profit-planner': addProfitTemplate(ctx); break;
    case 'event-roi-planner': addRoiTemplate(ctx); break;
    case 'event-planning-checklist': addChecklistTemplate(ctx); break;
    case 'complete-event-planning-bundle': addBundle(ctx); break;
    default: throw new Error('Unsupported template product');
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const token = searchParams.get('token');

    if (!orderId || !token || !verifyDownloadToken(orderId, token)) {
      return NextResponse.json({ error: 'Valid paid order access is required' }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order || order.status !== 'PAID' || order.items.length === 0) {
      return NextResponse.json({ error: 'Valid paid order required for download' }, { status: 403 });
    }

    if (order.items.length !== 1) {
      return NextResponse.json({ error: 'Each download must reference a single purchased template' }, { status: 409 });
    }

    const product = order.items[0].product;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Toolbox.Events';
    workbook.created = new Date();
    workbook.properties.subject = product.name;
    workbook.properties.title = product.name;

    buildWorkbook({
      workbook,
      productName: product.name,
      customerName: order.customerName || '',
      customerEmail: order.customerEmail,
      orderId: order.id,
      currency: order.currency,
    }, product.slug);

    const fileBuffer = await workbook.xlsx.writeBuffer();
    const safeName = `${product.slug}.xlsx`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error: any) {
    console.error('Product download error:', error);
    return NextResponse.json({ error: error?.message || 'Unable to generate download' }, { status: 500 });
  }
}
