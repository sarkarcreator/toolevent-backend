import { ChecklistTask, ChecklistGeneratorInputs } from '../types';

export function generateEventChecklist(inputs: ChecklistGeneratorInputs): ChecklistTask[] {
  const eventType = (inputs.eventType || 'General Event').toLowerCase();
  const isWedding = eventType.includes('wedding');
  const isCorporate = eventType.includes('corporate') || eventType.includes('conference');

  const defaultTasks: Omit<ChecklistTask, 'id' | 'isCompleted'>[] = [
    // 90 Days Before
    {
      title: 'Define core event goals, theme, and total budget cap',
      category: 'Strategy & Budget',
      timeframe: '90_days',
    },
    {
      title: isWedding ? 'Book ceremony and reception venues' : 'Shortlist and secure primary venue contract',
      category: 'Venue & Logistics',
      timeframe: '90_days',
    },
    {
      title: 'Draft master guest list and establish attendance targets',
      category: 'Guest Management',
      timeframe: '90_days',
    },
    {
      title: 'Book key anchors: Caterer, Lead Photographer, Keynote / Entertainment',
      category: 'Vendors',
      timeframe: '90_days',
    },

    // 60 Days Before
    {
      title: isWedding ? 'Send official Save-The-Dates / Invitations' : 'Launch event registration page and marketing campaign',
      category: 'Marketing & Invites',
      timeframe: '60_days',
    },
    {
      title: 'Confirm catering menu tasting, dietary options, and bar packages',
      category: 'Catering',
      timeframe: '60_days',
    },
    {
      title: 'Finalize audio-visual (AV), lighting, stage design, and equipment rentals',
      category: 'Production',
      timeframe: '60_days',
    },
    {
      title: isCorporate ? 'Confirm speaker line-up, bios, and presentation decks' : 'Choose attire, styling, and bridal party schedule',
      category: 'Program',
      timeframe: '60_days',
    },

    // 30 Days Before
    {
      title: 'Send RSVP reminders to pending guests and close registration window',
      category: 'Guest Management',
      timeframe: '30_days',
    },
    {
      title: 'Review detailed run-of-show / minute-by-minute timeline with venue manager',
      category: 'Operations',
      timeframe: '30_days',
    },
    {
      title: 'Confirm floral, decor mockup, signage, and print materials',
      category: 'Decor & Signage',
      timeframe: '30_days',
    },
    {
      title: 'Verify local permits, music licenses, security staff, and insurance coverage',
      category: 'Compliance & Safety',
      timeframe: '30_days',
    },

    // 14 Days Before
    {
      title: 'Lock in final guest count and submit to catering / venue team',
      category: 'Catering',
      timeframe: '14_days',
    },
    {
      title: 'Complete seating chart, VIP placement, and table designation cards',
      category: 'Guest Management',
      timeframe: '14_days',
    },
    {
      title: 'Conduct all-hands vendor alignment call and distribute vendor load-in schedule',
      category: 'Logistics',
      timeframe: '14_days',
    },

    // 7 Days Before
    {
      title: 'Confirm final headcount with all vendors and reconcile outstanding deposits',
      category: 'Finance',
      timeframe: '7_days',
    },
    {
      title: 'Assemble event day emergency kit (first aid, tools, extra cables, tech backups)',
      category: 'Operations',
      timeframe: '7_days',
    },
    {
      title: 'Send reminder SMS/Email to confirmed guests with parking & check-in details',
      category: 'Communications',
      timeframe: '7_days',
    },

    // 1 Day Before
    {
      title: 'Oversee early stage load-in, AV soundcheck, and stage lighting testing',
      category: 'Production',
      timeframe: '1_day',
    },
    {
      title: 'Print multiple hard copies of timeline, vendor contact directory, and floorplan',
      category: 'Operations',
      timeframe: '1_day',
    },
    {
      title: 'Host rehearsal / walkthrough with key stakeholders and event staff',
      category: 'Program',
      timeframe: '1_day',
    },

    // Event Day
    {
      title: 'On-site arrival 3 hours prior for final vendor walk-through and registration check',
      category: 'Event Day',
      timeframe: 'event_day',
    },
    {
      title: 'Coordinate live show flow, speaker cueing, food service timing, and photo milestones',
      category: 'Event Day',
      timeframe: 'event_day',
    },
    {
      title: 'Supervise load-out, venue handback, and inventory tally',
      category: 'Event Day',
      timeframe: 'event_day',
    },

    // Post Event
    {
      title: 'Send thank-you notes and attendee feedback survey',
      category: 'Post Event',
      timeframe: 'post_event',
    },
    {
      title: 'Reconcile all final invoices and calculate actual ROI vs budgeted projections',
      category: 'Finance & Analytics',
      timeframe: 'post_event',
    },
    {
      title: 'Receive and curate photo/video media gallery for social media and archives',
      category: 'Media',
      timeframe: 'post_event',
    },
  ];

  return defaultTasks.map((t, idx) => ({
    ...t,
    id: `task-${idx + 1}-${Date.now()}`,
    isCompleted: false,
  }));
}
