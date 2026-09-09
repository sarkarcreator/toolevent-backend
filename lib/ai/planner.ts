import { AIEventPlannerInputs, AIEventPlanResponse } from '../types';

const PUBLICAI_BASE_URL = process.env.PUBLICAI_BASE_URL || 'https://api.publicai.co/v1';
const PUBLICAI_MODEL = process.env.PUBLICAI_MODEL || 'swiss-ai/apertus-v1.5-8b';

function buildPrompt(inputs: AIEventPlannerInputs): string {
  return `You are a world-class professional Event Director & Financial Strategist for Toolbox.Events.
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

Return ONLY valid JSON matching this exact structure. Do not wrap it in markdown fences and do not add commentary:
{
  "title": "Master Event Plan Name",
  "executiveSummary": "Concise high-level overview of the event concept and success metrics",
  "eventStrategy": "Detailed positioning, attendee journey, and thematic execution strategy",
  "budgetAllocation": [{ "category": "Venue & Space", "amount": 0, "percentage": 25, "rationale": "Explanation of budget spend" }],
  "timelineMilestones": [{ "phase": "Phase 1: Foundation (90-60 Days)", "timing": "T-90 to T-60 Days", "tasks": ["Task 1", "Task 2"] }],
  "vendorCategories": [{ "vendorType": "Catering & Bar", "priority": "Critical", "requirements": "Specific RFP requirements", "estimatedBudget": "Currency amount" }],
  "marketingPlan": [{ "channel": "Email & Direct Invites", "strategy": "Strategy outline", "timeline": "T-45 Days" }],
  "guestManagementPlan": [{ "step": "RSVP Tracking & Seating", "action": "Exact workflow for VIPs and general attendees" }],
  "eventDaySchedule": [{ "time": "08:00 AM", "activity": "Vendor Load-in & Tech Soundcheck", "owner": "Event Director", "location": "Main Stage" }],
  "riskChecklist": [{ "risk": "Inclement weather / vendor delay", "severity": "Medium", "mitigation": "Contingency indoor space and backup supplier SLAs" }],
  "socialMediaIdeas": [{ "platform": "Instagram / LinkedIn", "concept": "Interactive photo moment", "captionExample": "Sample engaging social copy" }],
  "emailInvitation": { "subject": "Exclusive Invitation Subject Line", "body": "Complete professional invitation email copy with placeholder tags [Name], [Date], [Venue]" },
  "whatsappInvitation": "Short, punchy WhatsApp / SMS invitation with emoji and RSVP link",
  "postEventFollowUpPlan": [{ "timing": "24 Hours Post-Event", "action": "Send thank-you email, feedback survey, and photo gallery link" }]
}`;
}

function isValidPlan(value: unknown): value is AIEventPlanResponse {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Partial<AIEventPlanResponse>;
  return typeof plan.title === 'string' && Array.isArray(plan.budgetAllocation);
}

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('PublicAI returned invalid JSON');
  }
}

async function generateWithPublicAI(inputs: AIEventPlannerInputs): Promise<AIEventPlanResponse> {
  const apiKey = process.env.PUBLICAI_API_KEY;
  if (!apiKey) throw new Error('PUBLICAI_API_KEY is not configured');

  const response = await fetch(`${PUBLICAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Toolbox.Events/1.0',
    },
    body: JSON.stringify({
      model: PUBLICAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are the AI planning engine for Toolbox.Events. Follow the requested JSON schema exactly.',
        },
        { role: 'user', content: buildPrompt(inputs) },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`PublicAI request failed (${response.status})${details ? `: ${details.slice(0, 300)}` : ''}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('PublicAI returned an empty response');

  const plan = extractJson(text);
  if (!isValidPlan(plan)) throw new Error('PublicAI response does not match the event plan schema');
  return plan;
}

export async function generateAIEventPlan(inputs: AIEventPlannerInputs): Promise<AIEventPlanResponse> {
  try {
    return await generateWithPublicAI(inputs);
  } catch (publicAiError) {
    console.warn('PublicAI generation failed; trying configured Gemini fallback:', publicAiError);
  }

  // Keep Gemini as an optional fallback for resilience when its key is configured.
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: buildPrompt(inputs),
        config: { responseMimeType: 'application/json', temperature: 0.7 },
      });
      if (response.text) {
        const plan = extractJson(response.text);
        if (isValidPlan(plan)) return plan;
      }
    } catch (geminiError) {
      console.warn('Gemini fallback failed:', geminiError);
    }
  }

  // Final existing deterministic fallback keeps the API contract available.
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
      { category: 'Venue & Facility Rental', amount: venueAmount, percentage: 28, rationale: `Secures prime ${city} venue with audiovisual infrastructure and breakout spaces.` },
      { category: 'Food, Beverage & Hospitality', amount: cateringAmount, percentage: 32, rationale: `Curated multi-course or food station menu accommodating all dietary profiles (${currency} ${(cateringAmount / guests).toFixed(0)}/guest).` },
      { category: 'Audiovisual, Stage & Production', amount: avAmount, percentage: 14, rationale: 'High-definition LED backdrops, crystal-clear audio, and live streaming capabilities.' },
      { category: 'Thematic Decor, Florals & Signage', amount: decorAmount, percentage: 10, rationale: 'Custom welcome photo installations, branded directional wayfinding, and atmospheric table arrangements.' },
      { category: 'Marketing, Print & Collateral', amount: marketingAmount, percentage: 6, rationale: 'Registration badges, digital invitations, promotional reels, and attendee gift packs.' },
      { category: 'Contingency & Reserve Fund', amount: contingencyAmount, percentage: 10, rationale: 'Buffer for unforeseen vendor overtime, weather adaptations, or last-minute changes.' },
    ],
    timelineMilestones: [
      { phase: 'Phase 1: Strategic Blueprint (T-90 to T-60 Days)', timing: 'Months 1-2', tasks: [`Execute venue agreement in ${city} and lock deposit`, 'Draft master run of show and speaker/vendor requirements', 'Launch early RSVP registration pipeline'] },
      { phase: 'Phase 2: Production & Vendor Lock (T-60 to T-30 Days)', timing: 'Month 2', tasks: ['Conduct menu tasting and dietary audit', 'Finalize AV stage plot, lighting cues, and technician roster', 'Order branded signage, badges, and guest favors'] },
      { phase: 'Phase 3: Final Countdown (T-30 to Event Day)', timing: 'Final 4 Weeks', tasks: ['Reconcile final guest RSVP count and seating assignments', 'Conduct full technical walkthrough and staff rehearsal', 'Distribute comprehensive load-in schedule to suppliers'] },
    ],
    vendorCategories: [
      { vendorType: 'Venue & Facilities Management', priority: 'Critical', requirements: `Capacity for ${guests}+ seated guests, vendor loading access, high-speed internet.`, estimatedBudget: `${currency} ${venueAmount.toLocaleString()}` },
      { vendorType: 'Hospitality & Catering Team', priority: 'Critical', requirements: `Licensed banquet service and dietary-inclusive stations.`, estimatedBudget: `${currency} ${cateringAmount.toLocaleString()}` },
      { vendorType: 'AV Production Crew', priority: 'High', requirements: 'Wireless microphones, video switching, on-site live sound engineer.', estimatedBudget: `${currency} ${avAmount.toLocaleString()}` },
      { vendorType: 'Decor & Floral Studio', priority: 'Medium', requirements: 'Sustainable materials, focal stage backdrop, matching table centerpieces.', estimatedBudget: `${currency} ${decorAmount.toLocaleString()}` },
    ],
    marketingPlan: [
      { channel: 'Personalized Email Direct Outreach', strategy: 'Tiered invitation and logistics reminder sequence.', timeline: 'T-45 Days, T-21 Days, T-2 Days' },
      { channel: 'Social Media Announcement & Speaker Spotlight', strategy: 'Short-form teasers and behind-the-scenes venue previews.', timeline: 'Weekly from T-30 Days' },
    ],
    guestManagementPlan: [
      { step: 'Digital Check-in via QR Code', action: 'Fast touchless badge printing upon arrival to reduce foyer bottlenecks.' },
      { step: 'VIP Protocol & Dedicated Concierge', action: 'Dedicated liaison for keynote speakers and executive VIPs.' },
    ],
    eventDaySchedule: [
      { time: '08:00 AM', activity: 'Venue Access & AV Production Load-in', owner: 'Lead Production Manager', location: 'Main Ballroom' },
      { time: '11:00 AM', activity: 'Catering Setup & Styling', owner: 'Catering Lead', location: 'Dining Area' },
      { time: '01:30 PM', activity: 'Staff Briefing & Security Alignment', owner: 'Event Director', location: 'Registration Foyer' },
      { time: '02:00 PM', activity: 'Guest Arrival & Check-in', owner: 'Host Team', location: 'Foyer & Terrace' },
      { time: '03:00 PM', activity: 'Main Program Commencement', owner: 'Master of Ceremonies', location: 'Main Stage' },
      { time: '05:30 PM', activity: 'Networking Dinner & Entertainment', owner: 'Hospitality Lead', location: 'Grand Ballroom' },
      { time: '08:30 PM', activity: 'Closing Remarks & Wrap-up', owner: 'Event Director', location: 'Main Stage' },
      { time: '09:00 PM', activity: 'Vendor Load-out & Venue Handover', owner: 'Logistics Team', location: 'Loading Bay' },
    ],
    riskChecklist: [
      { risk: 'AV or Microphone Failure', severity: 'Medium', mitigation: 'Dual hardwired backup microphones and standby switcher channel.' },
      { risk: 'Higher-than-expected Attendance', severity: 'Low', mitigation: 'Pre-authorized extra food portions and auxiliary seating.' },
      { risk: 'Traffic or Weather Disruption', severity: 'Medium', mitigation: 'Send real-time logistics advice and validated parking guidance.' },
    ],
    socialMediaIdeas: [
      { platform: 'LinkedIn / Professional Networks', concept: 'Thought leadership quote cards and live key-takeaway carousel.', captionExample: `Unforgettable insights at the ${eventType} in ${city}! #ToolboxEvents` },
      { platform: 'Instagram / Visual Stories', concept: 'Branded photo installation and behind-the-scenes stories.', captionExample: `An evening of inspiration and connection in ${city}. ✨ #ToolboxEvents` },
    ],
    emailInvitation: { subject: `You are cordially invited: ${eventType} in ${city}`, body: `Dear [Guest Name],\n\nWe take great pleasure in inviting you to the upcoming ${eventType} in ${city} on ${inputs.eventDate || 'the designated date'}.\n\nPlease confirm your attendance.\n\nWarm regards,\nThe Organizing Committee | Toolbox.Events` },
    whatsappInvitation: `✨ *Invitation: ${eventType}* ✨\n\nYou're invited to join us in *${city}* on *${inputs.eventDate || 'our upcoming date'}*.\n\nPlease RSVP to secure your place.\n\nWe look forward to welcoming you! 🎉`,
    postEventFollowUpPlan: [
      { timing: 'Within 24 Hours', action: 'Send thank-you note and attendee satisfaction survey.' },
      { timing: 'Within 48 Hours', action: 'Publish official photo album and video highlights.' },
      { timing: 'Within 7 Days', action: 'Reconcile finances and calculate final actual ROI vs target budget.' },
    ],
  };
}
