import { EventROIInputs, EventROIResults } from '../types';

export function calculateEventROI(inputs: EventROIInputs): EventROIResults {
  const totalCost = Math.max(1, Number(inputs.totalCost) || 1);
  const directRevenue = Math.max(0, Number(inputs.directRevenue) || 0);
  const leads = Math.max(0, Number(inputs.leadsGenerated) || 0);
  const convRate = Math.max(0, Number(inputs.leadConversionRate) || 0) / 100;
  const avgValue = Math.max(0, Number(inputs.averageCustomerValue) || 0);
  const brandVal = Math.max(0, Number(inputs.brandValueEstimated) || 0);
  const partnerVal = Math.max(0, Number(inputs.partnershipValue) || 0);

  const convertedLeads = leads * convRate;
  const pipelineValue = convertedLeads * avgValue;
  const totalValueGenerated = directRevenue + pipelineValue + brandVal + partnerVal;
  const netValue = totalValueGenerated - totalCost;

  const directROI = ((directRevenue - totalCost) / totalCost) * 100;
  const totalROI = ((totalValueGenerated - totalCost) / totalCost) * 100;
  const costPerLead = leads > 0 ? totalCost / leads : 0;
  const revenuePerLead = leads > 0 ? totalValueGenerated / leads : 0;
  const roiMultiple = totalCost > 0 ? totalValueGenerated / totalCost : 0;

  return {
    pipelineValue: Number(pipelineValue.toFixed(2)),
    totalValueGenerated: Number(totalValueGenerated.toFixed(2)),
    netValue: Number(netValue.toFixed(2)),
    directROI: Number(directROI.toFixed(1)),
    totalROI: Number(totalROI.toFixed(1)),
    costPerLead: Number(costPerLead.toFixed(2)),
    revenuePerLead: Number(revenuePerLead.toFixed(2)),
    roiMultiple: Number(roiMultiple.toFixed(2)),
  };
}

