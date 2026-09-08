import { EventProfitInputs, EventProfitResults } from '../types';

export function calculateEventProfit(inputs: EventProfitInputs): EventProfitResults {
  const ticketPrice = Math.max(0, Number(inputs.ticketPrice) || 0);
  const attendees = Math.max(0, Number(inputs.expectedAttendees) || 0);
  const sponsorshipRevenue = Math.max(0, Number(inputs.sponsorshipRevenue) || 0);
  const merchandiseRevenue = Math.max(0, Number(inputs.merchandiseRevenue) || 0);
  const otherRevenue = Math.max(0, Number(inputs.otherRevenue) || 0);

  const ticketRevenue = ticketPrice * attendees;
  const totalRevenue = ticketRevenue + sponsorshipRevenue + merchandiseRevenue + otherRevenue;

  const venueCost = Math.max(0, Number(inputs.venueCost) || 0);
  const catering = Math.max(0, Number(inputs.catering) || 0);
  const marketing = Math.max(0, Number(inputs.marketing) || 0);
  const staff = Math.max(0, Number(inputs.staff) || 0);
  const equipment = Math.max(0, Number(inputs.equipment) || 0);
  const entertainment = Math.max(0, Number(inputs.entertainment) || 0);
  const otherExpenses = Math.max(0, Number(inputs.otherExpenses) || 0);

  const totalExpenses = venueCost + catering + marketing + staff + equipment + entertainment + otherExpenses;

  const grossProfit = totalRevenue - (catering + staff + merchandiseRevenue * 0.3); // Direct event execution costs
  const netProfit = totalRevenue - totalExpenses;
  const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const revenuePerAttendee = attendees > 0 ? totalRevenue / attendees : 0;
  const costPerAttendee = attendees > 0 ? totalExpenses / attendees : 0;
  const roiPercent = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

  // Non-ticket revenue
  const nonTicketRevenue = sponsorshipRevenue + merchandiseRevenue + otherRevenue;
  const expensesToCoverWithTickets = Math.max(0, totalExpenses - nonTicketRevenue);

  const breakEvenAttendees = ticketPrice > 0 ? Math.ceil(expensesToCoverWithTickets / ticketPrice) : 0;
  const breakEvenTicketPrice = attendees > 0 ? expensesToCoverWithTickets / attendees : 0;

  return {
    ticketRevenue: Number(ticketRevenue.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    profitMarginPercent: Number(profitMarginPercent.toFixed(2)),
    revenuePerAttendee: Number(revenuePerAttendee.toFixed(2)),
    costPerAttendee: Number(costPerAttendee.toFixed(2)),
    roiPercent: Number(roiPercent.toFixed(2)),
    breakEvenAttendees,
    breakEvenTicketPrice: Number(breakEvenTicketPrice.toFixed(2)),
    isProfitable: netProfit >= 0,
  };
}
