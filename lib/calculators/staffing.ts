import { StaffingInputs, StaffingResults } from '../types';

export function calculateStaffing(inputs: StaffingInputs): StaffingResults {
  const guestCount = Math.max(1, Number(inputs.guestCount) || 1);
  const eventDuration = Math.max(1, Number(inputs.eventDurationHours) || 4);
  const setupCleanup = Math.max(0, Number(inputs.setupCleanupHours) || 2);
  const totalHours = eventDuration + setupCleanup;

  const serviceStyle = inputs.serviceStyle || 'BUFFET';
  const numberOfBars = Math.max(0, Number(inputs.numberOfBars) || 1);
  const isVip = Boolean(inputs.isVipEvent);

  // Recommendations:
  const recManagers = Math.max(1, Math.ceil(guestCount / 150)) + (isVip ? 1 : 0);
  const recSecurity = Math.max(1, Math.ceil(guestCount / 100)) + (isVip ? 1 : 0);
  const recRegistration = Math.max(1, Math.ceil(guestCount / 75));
  const recUshers = Math.max(1, Math.ceil(guestCount / 60));

  let recServers = Math.ceil(guestCount / 25);
  if (serviceStyle === 'PLATED') recServers = Math.ceil(guestCount / 12);
  else if (serviceStyle === 'COCKTAIL') recServers = Math.ceil(guestCount / 20);

  const recBartenders = Math.max(1, numberOfBars * 2);
  const recCleaning = Math.max(1, Math.ceil(guestCount / 120));
  const recTechnicians = guestCount > 100 ? 2 : 1;

  const roles = [
    {
      role: 'Event Managers & Leads',
      count: inputs.eventManagers?.count !== undefined ? inputs.eventManagers.count : recManagers,
      hourlyRate: inputs.eventManagers?.hourlyRate || 55,
      recommendedCount: recManagers,
    },
    {
      role: 'Security & Safety Officers',
      count: inputs.securityStaff?.count !== undefined ? inputs.securityStaff.count : recSecurity,
      hourlyRate: inputs.securityStaff?.hourlyRate || 32,
      recommendedCount: recSecurity,
    },
    {
      role: 'Registration & Check-in',
      count: inputs.registrationStaff?.count !== undefined ? inputs.registrationStaff.count : recRegistration,
      hourlyRate: inputs.registrationStaff?.hourlyRate || 24,
      recommendedCount: recRegistration,
    },
    {
      role: 'Ushers & Floor Guides',
      count: inputs.ushers?.count !== undefined ? inputs.ushers.count : recUshers,
      hourlyRate: inputs.ushers?.hourlyRate || 22,
      recommendedCount: recUshers,
    },
    {
      role: 'Waitstaff & Banquet Servers',
      count: inputs.servers?.count !== undefined ? inputs.servers.count : recServers,
      hourlyRate: inputs.servers?.hourlyRate || 28,
      recommendedCount: recServers,
    },
    {
      role: 'Bartenders & Barbacks',
      count: recBartenders,
      hourlyRate: 35,
      recommendedCount: recBartenders,
    },
    {
      role: 'AV & Technical Crew',
      count: inputs.technicians?.count !== undefined ? inputs.technicians.count : recTechnicians,
      hourlyRate: inputs.technicians?.hourlyRate || 45,
      recommendedCount: recTechnicians,
    },
    {
      role: 'Cleaning & Sanitation Staff',
      count: inputs.cleaningStaff?.count !== undefined ? inputs.cleaningStaff.count : recCleaning,
      hourlyRate: inputs.cleaningStaff?.hourlyRate || 22,
      recommendedCount: recCleaning,
    },
  ];

  let totalStaffCount = 0;
  let totalLaborCost = 0;
  let totalLaborHours = 0;

  const roleBreakdown = roles.map((r) => {
    const activeCount = r.count;
    const roleHours = activeCount * totalHours;
    const totalCost = activeCount * r.hourlyRate * totalHours;

    totalStaffCount += activeCount;
    totalLaborHours += roleHours;
    totalLaborCost += totalCost;

    return {
      role: r.role,
      count: activeCount,
      hours: roleHours,
      hourlyRate: r.hourlyRate,
      totalCost: Number(totalCost.toFixed(2)),
      recommendedCount: r.recommendedCount,
    };
  });

  const costPerGuest = guestCount > 0 ? totalLaborCost / guestCount : 0;
  const ratioNumber = totalStaffCount > 0 ? (guestCount / totalStaffCount).toFixed(1) : '0';
  const ratioStaffToGuest =
    totalStaffCount > 0 ? `1 staff per ${ratioNumber} guests` : 'No staff allocated';

  return {
    totalStaffCount,
    totalHeadcount: totalStaffCount,
    totalLaborHours,
    totalLaborCost: Number(totalLaborCost.toFixed(2)),
    costPerGuest: Number(costPerGuest.toFixed(2)),
    ratioStaffToGuest,
    staffToGuestRatio: ratioNumber,
    roles: roleBreakdown,
    roleBreakdown,
  };
}
