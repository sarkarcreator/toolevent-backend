import { BreakEvenInputs, BreakEvenResults } from '../types';

export function calculateBreakEven(inputs: BreakEvenInputs): BreakEvenResults {
  const fixedCosts = Math.max(0, Number(inputs.fixedCosts) || 0);
  const variableCost = Math.max(0, Number(inputs.variableCostPerAttendee) || 0);
  const ticketPrice = Math.max(0, Number(inputs.ticketPrice) || 0);
  const capacity = inputs.capacity && inputs.capacity > 0 ? Number(inputs.capacity) : 300;

  const contributionMargin = ticketPrice - variableCost;
  const contributionMarginRatio = ticketPrice > 0 ? contributionMargin / ticketPrice : 0;

  const breakEvenQuantity =
    contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenQuantity * ticketPrice;

  // Chart data points
  const maxRange = Math.max(capacity * 1.2, breakEvenQuantity * 1.5, 100);
  const steps = 7;
  const stepSize = Math.round(maxRange / steps);

  const chartData = [];
  for (let i = 0; i <= steps; i++) {
    const attendees = i * stepSize;
    const revenue = attendees * ticketPrice;
    const totalCost = fixedCosts + attendees * variableCost;
    chartData.push({
      attendees,
      revenue: Number(revenue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      netProfit: Number((revenue - totalCost).toFixed(2)),
    });
  }

  const sensitivityTable = [0.5, 0.75, 1.0, 1.25, 1.5].map((multiplier) => {
    const attendees = Math.round((breakEvenQuantity || 100) * multiplier);
    const totalRevenue = attendees * ticketPrice;
    const totalCosts = fixedCosts + attendees * variableCost;
    return {
      attendees,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCosts: Number(totalCosts.toFixed(2)),
      netProfit: Number((totalRevenue - totalCosts).toFixed(2)),
    };
  });

  const capacityRevenue = capacity * ticketPrice;
  const capacityCosts = fixedCosts + capacity * variableCost;
  const profitAtSellout = capacityRevenue - capacityCosts;
  const capacityPercentageNeeded =
    capacity > 0 ? (breakEvenQuantity / capacity) * 100 : 0;

  return {
    contributionMargin: Number(contributionMargin.toFixed(2)),
    contributionMarginRatio: Number((contributionMarginRatio * 100).toFixed(1)),
    breakEvenQuantity,
    breakEvenAttendees: breakEvenQuantity,
    breakEvenRevenue: Number(breakEvenRevenue.toFixed(2)),
    profitAtSellout: Number(profitAtSellout.toFixed(2)),
    capacityPercentageNeeded: Number(capacityPercentageNeeded.toFixed(1)),
    capacityProfit: Number(profitAtSellout.toFixed(2)),
    capacityUtilizationNeeded: Number(capacityPercentageNeeded.toFixed(1)),
    chartData,
    sensitivityTable,
  };
}

