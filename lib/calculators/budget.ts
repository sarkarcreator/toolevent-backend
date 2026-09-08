import { EventBudgetInputs, EventBudgetResults, CategoryBreakdownItem } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  Venue: '#2563eb', // blue
  Catering: '#10b981', // emerald
  Decoration: '#f59e0b', // amber
  Photography: '#8b5cf6', // violet
  Videography: '#ec4899', // pink
  Entertainment: '#06b6d4', // cyan
  Marketing: '#f97316', // orange
  Staff: '#6366f1', // indigo
  Transportation: '#14b8a6', // teal
  Equipment: '#e11d48', // rose
  Security: '#64748b', // slate
  Invitations: '#d97706', // yellow-amber
  Accommodation: '#84cc16', // lime
  Miscellaneous: '#94a3b8', // cool gray
  Contingency: '#dc2626', // red
};

export function calculateEventBudget(inputs: EventBudgetInputs): EventBudgetResults {
  const guestCount = Math.max(1, Number(inputs.guestCount) || 1);
  const contingencyPercent = Math.max(0, Number(inputs.contingencyPercent) || 0);

  const rawCategories: { name: string; amount: number }[] = [
    { name: 'Venue', amount: Math.max(0, Number(inputs.venue) || 0) },
    { name: 'Catering', amount: Math.max(0, Number(inputs.catering) || 0) },
    { name: 'Decoration', amount: Math.max(0, Number(inputs.decoration) || 0) },
    { name: 'Photography', amount: Math.max(0, Number(inputs.photography) || 0) },
    { name: 'Videography', amount: Math.max(0, Number(inputs.videography) || 0) },
    { name: 'Entertainment', amount: Math.max(0, Number(inputs.entertainment) || 0) },
    { name: 'Marketing', amount: Math.max(0, Number(inputs.marketing) || 0) },
    { name: 'Staff', amount: Math.max(0, Number(inputs.staff) || 0) },
    { name: 'Transportation', amount: Math.max(0, Number(inputs.transportation) || 0) },
    { name: 'Equipment', amount: Math.max(0, Number(inputs.equipment) || 0) },
    { name: 'Security', amount: Math.max(0, Number(inputs.security) || 0) },
    { name: 'Invitations', amount: Math.max(0, Number(inputs.invitations) || 0) },
    { name: 'Accommodation', amount: Math.max(0, Number(inputs.accommodation) || 0) },
    { name: 'Miscellaneous', amount: Math.max(0, Number(inputs.miscellaneous) || 0) },
  ];

  const totalBaseExpenses = rawCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const contingencyAmount = (totalBaseExpenses * contingencyPercent) / 100;
  const totalBudget = totalBaseExpenses + contingencyAmount;
  const costPerGuest = totalBudget / guestCount;

  // Build category breakdown with percentage
  const categories: CategoryBreakdownItem[] = rawCategories
    .filter((cat) => cat.amount > 0 || totalBudget === 0)
    .map((cat) => {
      const percentage = totalBudget > 0 ? (cat.amount / totalBudget) * 100 : 0;
      return {
        category: cat.name,
        amount: cat.amount,
        percentage: Number(percentage.toFixed(2)),
        costPerGuest: Number((cat.amount / guestCount).toFixed(2)),
        color: CATEGORY_COLORS[cat.name] || '#6b7280',
      };
    });

  if (contingencyAmount > 0) {
    categories.push({
      category: 'Contingency',
      amount: contingencyAmount,
      percentage: Number(((contingencyAmount / totalBudget) * 100).toFixed(2)),
      costPerGuest: Number((contingencyAmount / guestCount).toFixed(2)),
      color: CATEGORY_COLORS.Contingency,
    });
  }

  // Identify top expense category
  let topExpenseCategory = 'None';
  let maxSpend = -1;
  for (const cat of rawCategories) {
    if (cat.amount > maxSpend) {
      maxSpend = cat.amount;
      topExpenseCategory = cat.name;
    }
  }

  return {
    totalBaseExpenses: Number(totalBaseExpenses.toFixed(2)),
    contingencyAmount: Number(contingencyAmount.toFixed(2)),
    totalBudget: Number(totalBudget.toFixed(2)),
    costPerGuest: Number(costPerGuest.toFixed(2)),
    recommendedBudgetMin: Number((totalBudget * 0.95).toFixed(2)),
    recommendedBudgetMax: Number((totalBudget * 1.15).toFixed(2)),
    categories,
    topExpenseCategory: maxSpend > 0 ? topExpenseCategory : 'N/A',
  };
}
