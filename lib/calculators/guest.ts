import { GuestCalculatorInputs, GuestCalculatorResults } from '../types';

export function calculateGuestAttendance(inputs: GuestCalculatorInputs): GuestCalculatorResults {
  const totalInvited = Math.max(1, Number(inputs.invitedCount) || 100);
  const rsvpYes = Math.max(0, Number(inputs.rsvpYes) || 0);
  const rsvpNo = Math.max(0, Number(inputs.rsvpNo) || 0);
  const rsvpPending = Math.max(0, Number(inputs.rsvpPending) || Math.max(0, totalInvited - rsvpYes - rsvpNo));

  const totalResponded = rsvpYes + rsvpNo;
  const responseRatePercent = totalInvited > 0 ? (totalResponded / totalInvited) * 100 : 0;

  // Expected show rates based on event type benchmarks:
  // Weddings: 85% of accepted show up, 20% of pending turn into yes
  // Corporate Free: 55-65% show rate (high attrition)
  // Corporate Paid: 85-90% show rate
  // Conference: 80-88% show rate
  // Private Party: 75-80% show rate
  let showRateMultiplier = 0.85;
  let pendingConversionRate = 0.25;

  switch (inputs.guestType) {
    case 'wedding':
      showRateMultiplier = 0.88;
      pendingConversionRate = 0.35;
      break;
    case 'corporate_free':
      showRateMultiplier = 0.60;
      pendingConversionRate = 0.20;
      break;
    case 'corporate_paid':
      showRateMultiplier = 0.90;
      pendingConversionRate = 0.40;
      break;
    case 'conference':
      showRateMultiplier = 0.85;
      pendingConversionRate = 0.30;
      break;
    case 'private_party':
      showRateMultiplier = 0.78;
      pendingConversionRate = 0.25;
      break;
  }

  // Projected attendance: Confirmed * showRate + Pending * pendingConversion
  const projectedConfirmedAttendees = rsvpYes * showRateMultiplier;
  const projectedPendingAttendees = rsvpPending * pendingConversionRate;
  const projectedAttendance = Math.round(projectedConfirmedAttendees + projectedPendingAttendees);

  const projectedMin = Math.round(rsvpYes * (showRateMultiplier - 0.08));
  const projectedMax = Math.round(rsvpYes + rsvpPending * 0.6);

  // Recommended catering buffer: catering companies recommend ordering for ~100% of confirmed + 5% buffer
  const recommendedCateringOrderCount = Math.max(
    projectedAttendance,
    Math.round(rsvpYes * 1.05)
  );

  let attritionRisk: 'Low' | 'Moderate' | 'High' = 'Low';
  if (inputs.guestType === 'corporate_free') {
    attritionRisk = 'High';
  } else if (responseRatePercent < 60 || rsvpPending > totalInvited * 0.4) {
    attritionRisk = 'Moderate';
  }

  const expectedAttendees = Math.max(1, projectedAttendance);
  const expectedAttendanceRate = totalInvited > 0 ? Number(((expectedAttendees / totalInvited) * 100).toFixed(1)) : 0;
  const cateringHeadcountMin = Math.max(0, projectedMin);
  const cateringHeadcountMax = Math.min(totalInvited, projectedMax);
  const expectedNoShows = Math.max(0, rsvpYes - Math.round(rsvpYes * showRateMultiplier));

  return {
    totalInvited,
    confirmedCount: rsvpYes,
    declinedCount: rsvpNo,
    pendingCount: rsvpPending,
    expectedAttendees,
    expectedAttendanceRate,
    cateringHeadcountMin,
    cateringHeadcountMax,
    expectedNoShows,
    responseRatePercent: Number(responseRatePercent.toFixed(1)),
    historicalShowRatePercent: Number((showRateMultiplier * 100).toFixed(0)),
    projectedAttendanceCount: expectedAttendees,
    projectedAttendanceMin: cateringHeadcountMin,
    projectedAttendanceMax: cateringHeadcountMax,
    recommendedCateringOrderCount,
    attritionRisk,
  };
}
