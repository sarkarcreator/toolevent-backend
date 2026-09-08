import { CateringInputs, CateringResults } from '../types';

export function calculateCatering(inputs: CateringInputs): CateringResults {
  const guests = Math.max(1, Number(inputs.guestCount || inputs.guests) || 1);
  const duration = Math.max(1, Number(inputs.eventDurationHours) || 4);
  const children = Math.max(0, Number(inputs.childrenCount) || 0);
  const vendorMeals = Math.max(0, Number(inputs.vendorMealsCount) || 0);
  const totalPeopleServed = guests + children + vendorMeals;

  // Base meal price estimation based on mealType
  let defaultMealPrice = 45;
  const mt = (inputs.mealType || '').toUpperCase();
  if (mt === 'PLATED' || mt === 'PLATED_DINNER') defaultMealPrice = 65;
  else if (mt === 'BUFFET') defaultMealPrice = 45;
  else if (mt === 'FOOD_STATIONS') defaultMealPrice = 55;
  else if (mt === 'CANAPES' || mt === 'COCKTAIL_PASSED') defaultMealPrice = 38;
  else if (mt === 'COCKTAIL') defaultMealPrice = 28;

  const mealCostPerPerson =
    inputs.customCostPerPerson !== undefined
      ? Number(inputs.customCostPerPerson)
      : inputs.costPerPersonMeal !== undefined
      ? Number(inputs.costPerPersonMeal)
      : defaultMealPrice;

  // Bar price estimation based on barPackage
  let defaultBarPrice = 0;
  const bp = (inputs.barPackage || '').toUpperCase();
  if (bp === 'SOFT_DRINKS') defaultBarPrice = 12;
  else if (bp === 'BEER_WINE') defaultBarPrice = 24;
  else if (bp === 'FULL_BAR' || bp === 'FULL_OPEN_BAR') defaultBarPrice = 40;
  else if (bp === 'PREMIUM_OPEN_BAR') defaultBarPrice = 60;

  const drinksCostPerPerson =
    inputs.customDrinkCostPerPerson !== undefined
      ? Number(inputs.customDrinkCostPerPerson)
      : inputs.drinksCostPerPerson !== undefined
      ? Number(inputs.drinksCostPerPerson)
      : defaultBarPrice;

  const dessertCostPerPerson = Math.max(0, Number(inputs.dessertCostPerPerson) || 0);

  // Adult, child (50%), vendor meals (60%)
  const foodTotal =
    guests * mealCostPerPerson +
    children * (mealCostPerPerson * 0.5) +
    vendorMeals * (mealCostPerPerson * 0.6);

  const beverageTotal =
    guests * drinksCostPerPerson +
    children * (bp !== 'NONE' ? 10 : 0) +
    vendorMeals * 10;

  const dessertSubtotal = guests * dessertCostPerPerson;

  // Staff calculation
  const staffRate = Math.max(0, Number(inputs.serviceStaffHourlyRate) || 25);
  const userStaffCount = Math.max(0, Number(inputs.serviceStaffCount) || 0);

  let recommendedWaitstaff = Math.ceil(guests / 20);
  if (mt === 'PLATED' || mt === 'PLATED_DINNER') {
    recommendedWaitstaff = Math.ceil(guests / 12);
  } else if (mt === 'BUFFET') {
    recommendedWaitstaff = Math.ceil(guests / 25);
  } else if (mt === 'CANAPES' || mt === 'COCKTAIL_PASSED') {
    recommendedWaitstaff = Math.ceil(guests / 18);
  }

  let recommendedBartenders = 0;
  if (bp !== 'NONE' && bp !== '') {
    recommendedBartenders = Math.max(1, Math.ceil(guests / 60));
  }

  const staffCountToUse =
    userStaffCount > 0 ? userStaffCount : (recommendedWaitstaff + recommendedBartenders);
  const staffLaborTotal = staffCountToUse * staffRate * duration;

  const equipmentTotal = Math.max(0, Number(inputs.equipmentRental) || 0);

  const subtotalBeforeTax =
    foodTotal + beverageTotal + dessertSubtotal + staffLaborTotal + equipmentTotal;

  const country = inputs.country || 'USA';
  const defaultTax = country === 'UAE' ? 5 : country === 'UK' ? 20 : 8.5;
  const defaultService = country === 'UAE' ? 10 : country === 'UK' ? 12.5 : 18;

  const taxPercent =
    inputs.taxPercent !== undefined ? Math.max(0, Number(inputs.taxPercent)) : defaultTax;
  const serviceChargePercent =
    inputs.serviceChargePercent !== undefined
      ? Math.max(0, Number(inputs.serviceChargePercent))
      : defaultService;

  const taxAmount = (subtotalBeforeTax * taxPercent) / 100;
  const serviceChargeAmount = (subtotalBeforeTax * serviceChargePercent) / 100;
  const grandTotal = subtotalBeforeTax + taxAmount + serviceChargeAmount;
  const costPerPerson = totalPeopleServed > 0 ? grandTotal / totalPeopleServed : 0;

  const drinksEstimatedCount = Math.round(guests * (2 + Math.max(0, duration - 1) * 1));

  return {
    foodSubtotal: Number(foodTotal.toFixed(2)),
    foodTotal: Number(foodTotal.toFixed(2)),
    beverageSubtotal: Number(beverageTotal.toFixed(2)),
    beverageTotal: Number(beverageTotal.toFixed(2)),
    dessertSubtotal: Number(dessertSubtotal.toFixed(2)),
    staffLaborTotal: Number(staffLaborTotal.toFixed(2)),
    equipmentTotal: Number(equipmentTotal.toFixed(2)),
    subtotalBeforeTax: Number(subtotalBeforeTax.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    taxTotal: Number(taxAmount.toFixed(2)),
    serviceChargeAmount: Number(serviceChargeAmount.toFixed(2)),
    serviceTotal: Number(serviceChargeAmount.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    totalCateringCost: Number(grandTotal.toFixed(2)),
    costPerGuest: Number(costPerPerson.toFixed(2)),
    costPerPerson: Number(costPerPerson.toFixed(2)),
    totalPeopleServed,
    drinksEstimatedCount,
    recommendedWaitstaff,
    recommendedBartenders,
  };
}
