import { TicketPriceInputs, TicketPriceResults } from '../types';

export function calculateTicketPrice(inputs: TicketPriceInputs): TicketPriceResults {
  const totalCost = Math.max(0, Number(inputs.totalEventCost) || 0);
  const attendees = Math.max(1, Number(inputs.expectedAttendees) || 1);
  const desiredProfit = Math.max(0, Number(inputs.desiredProfit) || 0);

  const paymentProcessingPercent = Math.max(0, Number(inputs.paymentProcessingPercent) || 0) / 100;
  const fixedPaymentFee = Math.max(0, Number(inputs.fixedPaymentFee) || 0);
  const platformFeePercent = Math.max(0, Number(inputs.platformFeePercent) || 0) / 100;
  const platformFixedFee = Math.max(0, Number(inputs.platformFixedFee) || 0);

  const costPerAttendee = totalCost / attendees;
  const totalTargetNetRevenue = totalCost + desiredProfit;
  const targetNetPerTicket = totalTargetNetRevenue / attendees;

  // Formula to solve for gross ticket price P where Net = P - (P * (pay% + plat%) + payFixed + platFixed)
  // Net = P * (1 - totalFeeRate) - totalFixedFee
  // P = (Net + totalFixedFee) / (1 - totalFeeRate)
  const totalFeeRate = paymentProcessingPercent + platformFeePercent;
  const totalFixedFee = fixedPaymentFee + platformFixedFee;

  const calculateGrossPrice = (netPerTicket: number): number => {
    if (totalFeeRate >= 1) return netPerTicket + totalFixedFee;
    const gross = (netPerTicket + totalFixedFee) / (1 - totalFeeRate);
    return Math.max(0, gross);
  };

  const breakEvenTicketPrice = calculateGrossPrice(costPerAttendee);
  const minimumTicketPrice = calculateGrossPrice(costPerAttendee * 1.05); // 5% buffer
  const desiredProfitTicketPrice = calculateGrossPrice(targetNetPerTicket);
  const recommendedTicketPrice = calculateGrossPrice(targetNetPerTicket * 1.1); // 10% safety cushion

  const effectiveTotalFeePerTicket =
    desiredProfitTicketPrice * totalFeeRate + totalFixedFee;

  const projectedGrossRevenue = desiredProfitTicketPrice * attendees;
  const projectedNetRevenue = projectedGrossRevenue - effectiveTotalFeePerTicket * attendees;
  const projectedNetProfit = projectedNetRevenue - totalCost;

  const pricingTiers = [
    {
      tier: 'Early Bird',
      suggestedPrice: Number((desiredProfitTicketPrice * 0.85).toFixed(2)),
      description: 'Discounted rate to drive early momentum (limited to first 20-30% of tickets)',
      projectedRevenue: Number((desiredProfitTicketPrice * 0.85 * attendees * 0.25).toFixed(2)),
    },
    {
      tier: 'General Admission',
      suggestedPrice: Number(desiredProfitTicketPrice.toFixed(2)),
      description: 'Standard access ticket ensuring target profit margin is reached',
      projectedRevenue: Number((desiredProfitTicketPrice * attendees * 0.6).toFixed(2)),
    },
    {
      tier: 'VIP / Premium',
      suggestedPrice: Number((desiredProfitTicketPrice * 1.65).toFixed(2)),
      description: 'High-margin luxury experience ticket with priority perks and merchandise',
      projectedRevenue: Number((desiredProfitTicketPrice * 1.65 * attendees * 0.15).toFixed(2)),
    },
  ];

  return {
    costPerAttendee: Number(costPerAttendee.toFixed(2)),
    breakEvenTicketPrice: Number(breakEvenTicketPrice.toFixed(2)),
    minimumTicketPrice: Number(minimumTicketPrice.toFixed(2)),
    recommendedTicketPrice: Number(recommendedTicketPrice.toFixed(2)),
    desiredProfitTicketPrice: Number(desiredProfitTicketPrice.toFixed(2)),
    effectiveTotalFeePerTicket: Number(effectiveTotalFeePerTicket.toFixed(2)),
    projectedGrossRevenue: Number(projectedGrossRevenue.toFixed(2)),
    projectedNetProfit: Number(projectedNetProfit.toFixed(2)),
    pricingTiers,
  };
}
