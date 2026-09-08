import { WeddingBudgetInputs, WeddingBudgetResults, CategoryBreakdownItem, SupportedCountry } from '../types';

const WEDDING_COLORS: Record<string, string> = {
  'Venue & Catering': '#ec4899', // pink
  'Photography & Video': '#8b5cf6', // violet
  'Attire & Beauty': '#f43f5e', // rose
  'Decor & Flowers': '#10b981', // emerald
  'Music & Entertainment': '#06b6d4', // cyan
  'Ceremony & Officiant': '#d97706', // amber
  'Invitations & Paper': '#6366f1', // indigo
  'Transportation & Stay': '#3b82f6', // blue
  'Cake & Desserts': '#f59e0b', // warm amber
  'Miscellaneous': '#64748b', // slate
  'Contingency': '#dc2626', // red
};

// Recommended industry percentage benchmarks
const INDUSTRY_BENCHMARKS: Record<SupportedCountry, Record<string, number>> = {
  USA: {
    'Venue & Catering': 45,
    'Photography & Video': 12,
    'Attire & Beauty': 9,
    'Decor & Flowers': 10,
    'Music & Entertainment': 8,
    'Ceremony & Officiant': 3,
    'Invitations & Paper': 3,
    'Transportation & Stay': 4,
    'Cake & Desserts': 2,
    'Miscellaneous': 4,
  },
  UAE: {
    'Venue & Catering': 48, // Luxury hotels / ballrooms higher in UAE
    'Photography & Video': 10,
    'Attire & Beauty': 12, // Haute couture / bridal wear prominence
    'Decor & Flowers': 14, // Lavish stage & florals
    'Music & Entertainment': 6,
    'Ceremony & Officiant': 2,
    'Invitations & Paper': 2,
    'Transportation & Stay': 3,
    'Cake & Desserts': 1,
    'Miscellaneous': 2,
  },
  UK: {
    'Venue & Catering': 44,
    'Photography & Video': 11,
    'Attire & Beauty': 10,
    'Decor & Flowers': 9,
    'Music & Entertainment': 9,
    'Ceremony & Officiant': 3,
    'Invitations & Paper': 3,
    'Transportation & Stay': 4,
    'Cake & Desserts': 3,
    'Miscellaneous': 4,
  },
};

export function calculateWeddingBudget(inputs: WeddingBudgetInputs): WeddingBudgetResults {
  const country = inputs.country || 'USA';
  const guestCount = Math.max(1, Number(inputs.guestCount) || 1);
  const contingencyPercent = inputs.contingencyPercent !== undefined ? Math.max(0, Number(inputs.contingencyPercent)) : 5;

  const benchmarks = INDUSTRY_BENCHMARKS[country] || INDUSTRY_BENCHMARKS.USA;

  let rawGroups: { name: string; amount: number }[] = [];

  if (inputs.totalBudget && inputs.totalBudget > 0 && !inputs.venue && !inputs.catering) {
    // Top-down budget allocation based on country benchmarks and tier
    const budget = Number(inputs.totalBudget);
    const baseBudget = budget / (1 + contingencyPercent / 100);

    rawGroups = Object.entries(benchmarks).map(([name, pct]) => ({
      name,
      amount: Number(((baseBudget * pct) / 100).toFixed(2)),
    }));
  } else {
    // Group into high-level standard wedding categories from inputs
    const venueCatering = Math.max(0, Number(inputs.venue) || 0) + Math.max(0, Number(inputs.catering) || 0);
    const photoVideo = Math.max(0, Number(inputs.photography) || 0) + Math.max(0, Number(inputs.videography) || 0);
    const attireBeauty =
      Math.max(0, Number(inputs.bridalAttire) || 0) +
      Math.max(0, Number(inputs.groomAttire) || 0) +
      Math.max(0, Number(inputs.makeupHair) || 0);
    const decorFlowers = Math.max(0, Number(inputs.decoration) || 0) + Math.max(0, Number(inputs.flowers) || 0);
    const musicEnt = Math.max(0, Number(inputs.musicDj) || 0) + Math.max(0, Number(inputs.entertainment) || 0);
    const ceremony = Math.max(0, Number(inputs.ceremony) || 0);
    const invitations = Math.max(0, Number(inputs.invitations) || 0);
    const transportStay =
      Math.max(0, Number(inputs.transportation) || 0) + Math.max(0, Number(inputs.accommodation) || 0);
    const cake = Math.max(0, Number(inputs.cake) || 0);
    const misc = Math.max(0, Number(inputs.miscellaneous) || 0);

    rawGroups = [
      { name: 'Venue & Catering', amount: venueCatering },
      { name: 'Photography & Video', amount: photoVideo },
      { name: 'Attire & Beauty', amount: attireBeauty },
      { name: 'Decor & Flowers', amount: decorFlowers },
      { name: 'Music & Entertainment', amount: musicEnt },
      { name: 'Ceremony & Officiant', amount: ceremony },
      { name: 'Invitations & Paper', amount: invitations },
      { name: 'Transportation & Stay', amount: transportStay },
      { name: 'Cake & Desserts', amount: cake },
      { name: 'Miscellaneous', amount: misc },
    ];
  }

  const totalBaseExpenses = rawGroups.reduce((sum, g) => sum + g.amount, 0);
  const contingencyAmount = (totalBaseExpenses * contingencyPercent) / 100;
  const totalWeddingBudget = totalBaseExpenses + contingencyAmount;
  const costPerGuest = totalWeddingBudget / guestCount;

  const venueCateringGroup = rawGroups.find((g) => g.name === 'Venue & Catering');
  const venueCateringAmount = venueCateringGroup ? venueCateringGroup.amount : 0;

  const categories: CategoryBreakdownItem[] = rawGroups
    .filter((g) => g.amount > 0 || totalWeddingBudget === 0)
    .map((g) => {
      const percentage = totalWeddingBudget > 0 ? (g.amount / totalWeddingBudget) * 100 : 0;
      return {
        category: g.name,
        amount: g.amount,
        percentage: Number(percentage.toFixed(2)),
        costPerGuest: Number((g.amount / guestCount).toFixed(2)),
        color: WEDDING_COLORS[g.name] || '#6b7280',
      };
    });

  if (contingencyAmount > 0) {
    categories.push({
      category: 'Contingency',
      amount: Number(contingencyAmount.toFixed(2)),
      percentage: Number(((contingencyAmount / totalWeddingBudget) * 100).toFixed(2)),
      costPerGuest: Number((contingencyAmount / guestCount).toFixed(2)),
      color: WEDDING_COLORS.Contingency,
    });
  }

  const industryComparison = rawGroups.map((group) => {
    const yourSpendPercent =
      totalBaseExpenses > 0 ? (group.amount / totalBaseExpenses) * 100 : 0;
    const recommendedPercent = benchmarks[group.name] || 5;
    const diff = yourSpendPercent - recommendedPercent;
    let variance = 'On Track';
    if (diff > 5) variance = `+${diff.toFixed(1)}% (Higher than avg)`;
    else if (diff < -5) variance = `${diff.toFixed(1)}% (Lower than avg)`;

    return {
      category: group.name,
      yourSpendPercent: Number(yourSpendPercent.toFixed(1)),
      recommendedPercent,
      variance,
    };
  });

  return {
    totalBaseExpenses: Number(totalBaseExpenses.toFixed(2)),
    contingencyAmount: Number(contingencyAmount.toFixed(2)),
    totalWeddingBudget: Number(totalWeddingBudget.toFixed(2)),
    costPerGuest: Number(costPerGuest.toFixed(2)),
    venueCateringAmount: Number(venueCateringAmount.toFixed(2)),
    categories,
    industryComparison,
  };
}
