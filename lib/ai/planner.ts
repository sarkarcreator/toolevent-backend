import { GoogleGenAI } from '@google/genai';
import { AIEventPlannerInputs, AIEventPlanResponse } from '../types';

export async function generateAIEventPlan(inputs: AIEventPlannerInputs): Promise<AIEventPlanResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are a world-class professional Event Director & Financial Strategist for Toolbox.Events.
Create a comprehensive, mathematically rigorous 12-part master event plan based on these parameters:
- Event Type: ${inputs.eventType}
- Target Market: ${inputs.country} (${inputs.currency})
- Target City: ${inputs.city || 'Primary Metropolitan Hub'}
- Guest Count: ${inputs.guestCount}
- Total Budget Cap: ${inputs.currency} ${inputs.budget}
- Event Target Date: ${inputs.eventDate || 'In 90 days'}
- Strategic Goals: ${inputs.goals || 'Flawless guest experience, strong ROI, memorable brand impact'}
- Target Audience: ${inputs.audience || 'General public / invited stakeholders'}
- Theme & Desired Style: ${inputs.style || 'Modern, elegant, high-impact'}
- Special Requirements: ${inputs.specialRequirements || 'None'}

Return your response strictly as valid JSON matching this exact structure:
{
  "title": "Master Event Plan Name",
  "executiveSummary": "Concise high-level overview of the event concept and success metrics",
  "eventStrategy": "Detailed positioning, attendee journey, and thematic execution strategy",
  "budgetAllocation": [
    { "category": "Venue & Space", "amount": 0, "percentage": 25, "rationale": "Explanation of budget spend" }
  ],
  "timelineMilestones": [
    { "phase": "Phase 1: Foundation (90-60 Days)", "timing": "T-90 to T-60 Days", "tasks": ["Task 1", "Task 2"] }
  ],
  "vendorCategories": [
    { "vendorType": "Catering & Bar", "priority": "Critical", "requirements": "Specific RFP requirements", "estimatedBudget": "Currency amount" }
  ],
  "marketingPlan": [
    { "channel": "Email & Direct Invites", "strategy": "Strategy outline", "timeline": "T-45 Days" }
  ],
  "guestManagementPlan": [
    { "step": "RSVP Tracking & Seating", "action": "Exact workflow for VIPs and general attendees" }
  ],
  "eventDaySchedule": [
    { "time": "08:00 AM", "activity": "Vendor Load-in & Tech Soundcheck", "owner": "Event Director", "location": "Main Stage" }
  ],
  "riskChecklist": [
    { "risk": "Inclement weather / vendor delay", "severity": "Medium", "mitigation": "Contingency indoor space and backup supplier SLAs" }
  ],
  "socialMediaIdeas": [
    { "platform": "Instagram / LinkedIn", "concept": "Interactive photo moment", "captionExample": "Sample engaging social copy" }
  ],
  "emailInvitation": {
    "subject": "Exclusive Invitation Subject Line",
    "body": "Complete professional invitation email copy with placeholder tags [Name], [Date], [Venue]"
  },
  "whatsappInvitation": "Short, punchy WhatsApp / SMS invitation with emoji and RSVP link",
  "postEventFollowUpPlan": [
    { "timing": "24 Hours Post-Event", "action": "Send thank-you email, feedback survey, and photo gallery link" }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed && parsed.title && parsed.budgetAllocation) {
          return parsed as AIEventPlanResponse;
        }
      }
    } catch (err) {
      console.warn('Gemini API call returned error or fallback used:', err);
    }
  }

  // Fallback high-quality curated event plan generator
  return generateDeterministicFallbackPlan(inputs);
}

function generateDeterministicFallbackPlan(inputs: AIEventPlannerInputs): AIEventPlanResponse {
  const budget = Number(inputs.budget) || 25000;
  const currency = inputs.currency || 'USD';
  const guests = Number(inputs.guestCount) || 100;
  const eventType = inputs.eventType || 'Corporate & Networking Gala';
  const city = inputs.city || 'Metro Central';
  const country = inputs.country || 'USA';

  const venueAmount = Math.round(budget * 0.28);
  const cateringAmount = Math.round(budget * 0.32);
  const avAmount = Math.round(budget * 0.14);
  const decorAmount = Math.round(budget * 0.10);
  const marketingAmount = Math.round(budget * 0.06);
  const contingencyAmount = Math.round(budget * 0.10);

  return {
    title: `${eventType} — ${city} Strategic Master Plan`,
    executiveSummary: `A meticulously planned ${guests}-guest ${eventType.toLowerCase()} curated for ${city}, ${country}. Structured with a total financial baseline of ${currency} ${budget.toLocaleString()} focusing on high guest engagement, seamless operational timeline, and a strict 10% contingency safety margin.`,
    eventStrategy: `The overarching vision centers on creating an immersive, friction-free environment from initial digital invitation to post-event survey. Utilizing zoned attendee flow (Welcome lounge, Main presentation theater, and Interactive networking terrace) to optimize attendee movement and sponsor visibility.`,
    budgetAllocation: [
      {
        category: 'Venue & Facility Rental',
        amount: venueAmount,
        percentage: 28,
        rationale: `Secures prime ${city} venue with audiovisual infrastructure and breakout spaces.`,
      },
      {
        category: 'Food, Beverage & Hospitality',
        amount: cateringAmount,
        percentage: 32,
        rationale: `Curated multi-course or food station menu accommodating all dietary profiles (${currency} ${(cateringAmount / guests).toFixed(0)}/guest).`,
      },
      {
        category: 'Audiovisual, Stage & Production',
        amount: avAmount,
        percentage: 14,
        rationale: `High-definition LED backdrops, crystal-clear line-array audio, and live streaming capabilities.`,
      },
      {
        category: 'Thematic Decor, Florals & Signage',
        amount: decorAmount,
        percentage: 10,
        rationale: `Custom welcome photo installations, branded directional wayfinding, and atmospheric table arrangements.`,
      },
      {
        category: 'Marketing, Print & Collateral',
        amount: marketingAmount,
        percentage: 6,
        rationale: `Registration badges, digital invitations, promotional reels, and attendee gift packs.`,
      },
      {
        category: 'Contingency & Reserve Fund',
        amount: contingencyAmount,
        percentage: 10,
        rationale: `Mandatory buffer to absorb unforeseen vendor overtime, weather adaptations, or last-minute VIP additions.`,
      },
    ],
    timelineMilestones: [
      {
        phase: 'Phase 1: Strategic Blueprint (T-90 to T-60 Days)',
        timing: 'Months 1-2',
        tasks: [
          `Execute venue agreement in ${city} and lock deposit`,
          'Draft master run of show and speaker/vendor requirements',
          'Launch early RSVP registration pipeline',
        ],
      },
      {
        phase: 'Phase 2: Production & Vendor Lock (T-60 to T-30 Days)',
        timing: 'Month 2',
        tasks: [
          'Conduct menu tasting and dietary audit with executive chef',
          'Finalize AV stage plot, lighting cues, and technician roster',
          'Order branded signage, badges, and guest favors',
        ],
      },
      {
        phase: 'Phase 3: Final Countdown (T-30 to Event Day)',
        timing: 'Final 4 Weeks',
        tasks: [
          'Reconcile final guest RSVP count and seating assignments',
          'Conduct full technical walkthrough and staff rehearsal',
          'Distribute comprehensive load-in schedule to all suppliers',
        ],
      },
    ],
    vendorCategories: [
      {
        vendorType: 'Venue & Facilities Management',
        priority: 'Critical',
        requirements: `Capacity for ${guests}+ seated guests, dedicated vendor loading dock, high-speed fiber internet.`,
        estimatedBudget: `${currency} ${venueAmount.toLocaleString()}`,
      },
      {
        vendorType: 'Hospitality & Catering Team',
        priority: 'Critical',
        requirements: `Licensed banquet service, 1 server per 15 guests, vegan and gluten-free dedicated stations.`,
        estimatedBudget: `${currency} ${cateringAmount.toLocaleString()}`,
      },
      {
        vendorType: 'AV Production Crew',
        priority: 'High',
        requirements: 'Wireless lavalier microphones, 4K video switching, on-site live sound engineer.',
        estimatedBudget: `${currency} ${avAmount.toLocaleString()}`,
      },
      {
        vendorType: 'Decor & Floral Studio',
        priority: 'Medium',
        requirements: 'Sustainable materials, focal stage backdrop, matching table centerpieces.',
        estimatedBudget: `${currency} ${decorAmount.toLocaleString()}`,
      },
    ],
    marketingPlan: [
      {
        channel: 'Personalized Email Direct Outreach',
        strategy: 'Tiered 3-part sequence: Exclusive Save-The-Date, Formal Invitation with Agenda, and 48hr Logistics Reminder.',
        timeline: 'T-45 Days, T-21 Days, T-2 Days',
      },
      {
        channel: 'Social Media Announcement & Speaker Spotlight',
        strategy: 'Short-form video teasers and behind-the-scenes venue previews to build anticipation.',
        timeline: 'Weekly from T-30 Days',
      },
    ],
    guestManagementPlan: [
      {
        step: 'Digital Check-in via QR Code',
        action: 'Fast touchless badge printing upon arrival to eliminate foyer bottlenecking.',
      },
      {
        step: 'VIP Protocol & Dedicated Concierge',
        action: 'Dedicated liaison for keynote speakers and executive VIPs with private green room access.',
      },
    ],
    eventDaySchedule: [
      {
        time: '08:00 AM',
        activity: 'Venue Access & AV Production Load-in',
        owner: 'Lead Production Manager',
        location: 'Main Ballroom',
      },
      {
        time: '11:00 AM',
        activity: 'Catering Setup & Floral Centerpiece Styling',
        owner: 'Catering Lead',
        location: 'Dining Area',
      },
      {
        time: '01:30 PM',
        activity: 'Staff Briefing & Security Alignment',
        owner: 'Event Director',
        location: 'Registration Foyer',
      },
      {
        time: '02:00 PM',
        activity: 'Guest Arrival, Welcome Reception & Check-in',
        owner: 'Host Team',
        location: 'Foyer & Terrace',
      },
      {
        time: '03:00 PM',
        activity: 'Main Program Commencement & Keynote Address',
        owner: 'Master of Ceremonies',
        location: 'Main Stage',
      },
      {
        time: '05:30 PM',
        activity: 'Networking Dinner & Entertainment Performance',
        owner: 'Hospitality Lead',
        location: 'Grand Ballroom',
      },
      {
        time: '08:30 PM',
        activity: 'Closing Remarks & Official Event Wrap-up',
        owner: 'Event Director',
        location: 'Main Stage',
      },
      {
        time: '09:00 PM',
        activity: 'Vendor Load-out & Venue Handover',
        owner: 'Logistics Team',
        location: 'Loading Bay',
      },
    ],
    riskChecklist: [
      {
        risk: 'AV or Microphone Failure During Keynote',
        severity: 'Medium',
        mitigation: 'Dual hardwired backup mics and spare switcher channel pre-configured on standby.',
      },
      {
        risk: 'Higher-than-expected Attendee Turnout',
        severity: 'Low',
        mitigation: '5% extra food portioning pre-authorized with caterer and auxiliary seating on reserve.',
      },
      {
        risk: 'Traffic or Weather Disruption in City Hub',
        severity: 'Medium',
        mitigation: 'Real-time SMS traffic advice sent to attendees 3 hours prior with validated parking map.',
      },
    ],
    socialMediaIdeas: [
      {
        platform: 'LinkedIn / Professional Networks',
        concept: 'Thought leadership quote cards and live event key takeaway carousel.',
        captionExample: `Unforgettable insights today at the ${eventType} in ${city}! Bringing together industry leaders to shape what's next. #ToolboxEvents #${city.replace(/\s+/g, '')}Events`,
      },
      {
        platform: 'Instagram / Visual Stories',
        concept: 'Custom branded photo installation with dynamic lighting and instant digital prints.',
        captionExample: `An evening of pure inspiration and connection in ${city}. ✨📸 #EventPlanner #LuxuryEvents`,
      },
    ],
    emailInvitation: {
      subject: `You are cordially invited: ${eventType} in ${city}`,
      body: `Dear [Guest Name],

We take great pleasure in inviting you to the upcoming ${eventType}, taking place in ${city} on ${inputs.eventDate || 'the designated date'}.

Event Highlights:
• Keynote presentations and curated panel discussions
• Gourmet culinary experience and cocktail reception
• Unmatched networking with industry peers and partners

Please confirm your attendance by clicking the button below:
[Confirm Your RSVP]

Venue details and access pass will follow upon confirmation.

Warm regards,
The Organizing Committee | Toolbox.Events`,
    },
    whatsappInvitation: `✨ *Invitation: ${eventType}* ✨\n\nYou're invited to join us in *${city}* on *${inputs.eventDate || 'our upcoming date'}* for an exceptional event experience!\n\n📍 Venue: ${city} Event Center\n⏰ Time: 2:00 PM onwards\n\n👉 *RSVP here to secure your pass:* https://toolbox.events/rsvp\n\nWe look forward to welcoming you! 🎉`,
    postEventFollowUpPlan: [
      {
        timing: 'Within 24 Hours',
        action: 'Send personalized thank-you note and 3-question attendee satisfaction survey.',
      },
      {
        timing: 'Within 48 Hours',
        action: 'Publish official photo album and video highlights link for attendees to share on social channels.',
      },
      {
        timing: 'Within 7 Days',
        action: 'Conduct financial reconciliation meeting and calculate final actual ROI vs target budget.',
      },
    ],
  };
}
