import {
  Equipment,
  ExistingAsset,
  OpeningScenario,
  OpeningScenarioResult,
  Partner,
  Product,
  Project,
  RiskItem,
  MenuMixItem,
  SetupBudgetItem,
  StaffRole,
  StaffScenario,
} from "./types";

export const n = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const pct = (value: number) => n(value) / 100;
export const sum = (values: number[]) => values.reduce((total, value) => total + n(value), 0);
export const safeDivide = (value: number, divisor: number) => (n(divisor) === 0 ? 0 : n(value) / n(divisor));

export function calculateOwnershipFromCapital(partners: Partner[]) {
  const total = sum(partners.map((partner) => partner.capitalContribution));
  return partners.map((partner) => ({ ...partner, ownershipPercentage: safeDivide(partner.capitalContribution, total) * 100 }));
}

export function calculateEqualOwnership(partners: Partner[]) {
  const share = partners.length ? 100 / partners.length : 0;
  return partners.map((partner) => ({ ...partner, ownershipPercentage: share, profitSharingPercentage: share }));
}

export function totalEstimatedSetupBudget(items: SetupBudgetItem[]) {
  return sum(items.map((item) => item.estimatedPrice * Math.max(1, item.quantity)));
}

export function totalActualSpending(items: SetupBudgetItem[]) {
  return sum(items.map((item) => item.actualPrice * Math.max(1, item.quantity)));
}

export function budgetDifference(items: SetupBudgetItem[]) {
  return totalEstimatedSetupBudget(items) - totalActualSpending(items);
}

const oldSources = ["existing_old_asset", "old_renovation_cost", "old_stock"];
const newSources = ["new_item_to_buy", "new_renovation_cost", "replacement_or_repair"];

export function calculateHistoricalSpending(items: SetupBudgetItem[]) {
  return sum(items.filter((item) => oldSources.includes(item.itemSource)).map((item) => n(item.originalPurchasePrice || item.actualPrice) * Math.max(1, n(item.quantity) || 1)));
}

export function calculateCurrentUsableAssetValue(items: SetupBudgetItem[]) {
  return sum(items.filter((item) => oldSources.includes(item.itemSource) && item.stillUsableForNewConcept && item.condition !== "Not usable").map((item) => n(item.currentEstimatedValue) * Math.max(1, n(item.quantity) || 1)));
}

export function calculateNewEstimatedBudgetNeeded(items: SetupBudgetItem[]) {
  return sum(items.filter((item) => newSources.includes(item.itemSource) && !item.purchased).map((item) => n(item.estimatedPrice) * Math.max(1, n(item.quantity) || 1)));
}

export function calculateNewActualSpending(items: SetupBudgetItem[]) {
  return sum(items.filter((item) => newSources.includes(item.itemSource) && item.purchased).map((item) => n(item.actualPrice) * Math.max(1, n(item.quantity) || 1)));
}

export function calculateRemainingBudgetNeeded(items: SetupBudgetItem[]) {
  return calculateNewEstimatedBudgetNeeded(items);
}

export function calculateTotalCapitalPicture(items: SetupBudgetItem[]) {
  return calculateCurrentUsableAssetValue(items) + calculateNewActualSpending(items) + calculateRemainingBudgetNeeded(items);
}

export function calculateSetupBudgetSummaryBySource(items: SetupBudgetItem[]) {
  const overBudgetAmount = sum(items.filter((item) => item.purchased).map((item) => Math.max(0, n(item.actualPrice) * Math.max(1, n(item.quantity) || 1) - n(item.estimatedPrice) * Math.max(1, n(item.quantity) || 1))));
  return {
    historicalSpending: calculateHistoricalSpending(items),
    currentUsableAssetValue: calculateCurrentUsableAssetValue(items),
    newEstimatedBudgetNeeded: calculateNewEstimatedBudgetNeeded(items),
    newActualSpending: calculateNewActualSpending(items),
    remainingBudgetNeeded: calculateRemainingBudgetNeeded(items),
    totalCapitalPicture: calculateTotalCapitalPicture(items),
    itemsNotPurchased: items.filter((item) => item.required && newSources.includes(item.itemSource) && !item.purchased).length,
    overBudgetAmount,
  };
}

export function calculatePartnerCapitalContribution(project: Project) {
  return project.ownership.partners.map((partner) => {
    const paidOld = sum(project.setupBudget.filter((item) => item.paidByPartnerId === partner.id && oldSources.includes(item.itemSource)).map((item) => n(item.originalPurchasePrice || item.actualPrice) * Math.max(1, n(item.quantity) || 1)));
    const currentAsset = sum(project.setupBudget.filter((item) => item.assetOwnerPartnerId === partner.id && item.countAsCapitalContribution && item.stillUsableForNewConcept && item.condition !== "Not usable").map((item) => n(item.currentEstimatedValue) * Math.max(1, n(item.quantity) || 1)));
    const newCash = sum(project.setupBudget.filter((item) => item.paidByPartnerId === partner.id && newSources.includes(item.itemSource) && item.purchased).map((item) => n(item.actualPrice) * Math.max(1, n(item.quantity) || 1)));
    return { partner, cashPaidForOldSpending: paidOld, currentAssetValueContributed: currentAsset, newCashSpending: newCash, totalCountedContribution: currentAsset + newCash, ownershipPercentage: partner.ownershipPercentage, notes: partner.notes };
  });
}

export function existingAssetCapital(assets: ExistingAsset[]) {
  return sum(assets.filter((asset) => asset.countedAsCapital).map((asset) => asset.currentValue));
}

export function productGrossMargin(product: Product) {
  return safeDivide(product.sellingPrice - product.costPrice, product.sellingPrice) * 100;
}

export function productMarkup(product: Product) {
  return safeDivide(product.sellingPrice - product.costPrice, product.costPrice) * 100;
}

export function cafeIncomePerProduct(product: Product) {
  if (product.type === "Consignment product" || product.type === "Bagi hasil") return product.sellingPrice * pct(product.cafeSharePercentage);
  if (product.type === "Tenant product") return product.sellingPrice * pct(product.cafeSharePercentage);
  return product.sellingPrice - product.costPrice;
}

export function vendorPayout(product: Product) {
  if (product.type === "Consignment product" || product.type === "Bagi hasil") return product.sellingPrice * pct(product.vendorSharePercentage);
  return product.costPrice;
}

export function monthlyProductIncome(product: Product) {
  return cafeIncomePerProduct(product) * n(product.monthlyEstimatedSales);
}

export function electricityKwh(equipment: Equipment) {
  return (n(equipment.powerWatt) / 1000) * n(equipment.hoursPerDay) * n(equipment.daysPerMonth);
}

export function monthlyElectricityCost(equipment: Equipment) {
  return electricityKwh(equipment) * n(equipment.tariffPerKwh);
}

export function equipmentElectricitySummary(equipment: Equipment[]) {
  return equipment.reduce(
    (acc, item) => {
      const cost = monthlyElectricityCost(item);
      acc.kwh += electricityKwh(item);
      acc.totalCost += cost;
      if (item.paidBy === "Cafe") acc.cafeCost += cost;
      if (item.paidBy === "Vendor") acc.vendorCost += cost;
      if (item.paidBy === "Shared") {
        acc.cafeCost += cost * pct(item.cafePercentage);
        acc.vendorCost += cost * pct(item.vendorPercentage);
      }
      return acc;
    },
    { kwh: 0, totalCost: 0, cafeCost: 0, vendorCost: 0 },
  );
}

export function monthlyProjectionResult(project: Project) {
  const mp = project.monthlyProjection;
  const payroll = getProjectPayroll(project);
  const productRevenue = sum(Object.values(mp.productRevenueByCategory || {}));
  const monthlyRevenue = n(mp.estimatedDailySales) * n(mp.operatingDaysPerMonth) + productRevenue + n(mp.vendorIncome) + n(mp.otherIncome);
  const cogs = n(mp.costs["COGS food"]) + n(mp.costs["COGS beverage"]);
  const operatingCost = sum(Object.entries(mp.costs).filter(([key]) => !key.startsWith("COGS") && key !== "Staff salary").map(([, value]) => value)) + payroll;
  const grossProfit = monthlyRevenue - cogs;
  const netProfit = grossProfit - operatingCost;
  const netMargin = safeDivide(netProfit, monthlyRevenue) * 100;
  const grossMargin = safeDivide(grossProfit, monthlyRevenue);
  const breakEvenSales = grossMargin <= 0 ? 0 : operatingCost / grossMargin;
  const breakEvenDays = safeDivide(breakEvenSales, n(mp.estimatedDailySales));
  const paybackPeriod = netProfit <= 0 ? null : safeDivide(totalEstimatedSetupBudget(project.setupBudget), netProfit);
  return { monthlyRevenue, cogs, grossProfit, operatingCost, netProfit, netMargin, breakEvenSales, breakEvenDays, paybackPeriod };
}

export function selectedStaffScenario(project: Project): StaffScenario | undefined {
  return project.staffPlan?.scenarios?.find((scenario) => scenario.id === project.staffPlan.selectedScenario) || project.staffPlan?.scenarios?.find((scenario) => scenario.selectedForPitch) || project.staffPlan?.scenarios?.[0];
}

export function calculateStaffRoleCost(role: StaffRole) {
  const totalPerPerson = n(role.baseSalary) + n(role.mealAllowance) + n(role.transportAllowance) + n(role.incentive) + n(role.benefit) + n(role.otherAllowance);
  return {
    totalPerPerson,
    totalRoleCost: totalPerPerson * n(role.headcount),
    totalAllowance: (n(role.mealAllowance) + n(role.transportAllowance) + n(role.incentive) + n(role.benefit) + n(role.otherAllowance)) * n(role.headcount),
  };
}

export function calculateTotalPayroll(scenario?: StaffScenario) {
  return sum((scenario?.roles || []).map((role) => calculateStaffRoleCost(role).totalRoleCost));
}

export function calculatePayrollRevenueRatio(totalPayroll: number, monthlyRevenue: number) {
  return safeDivide(totalPayroll, monthlyRevenue) * 100;
}

export function calculatePayrollGrossProfitRatio(totalPayroll: number, grossProfit: number) {
  return safeDivide(totalPayroll, grossProfit) * 100;
}

export function generatePayrollWarnings(totalPayroll: number, monthlyRevenue: number, grossProfit: number, staffCount: number) {
  const warnings: string[] = [];
  if (staffCount === 0) warnings.push("Tambahkan estimasi staff agar proyeksi biaya operasional lebih realistis.");
  if (calculatePayrollRevenueRatio(totalPayroll, monthlyRevenue) > 30) warnings.push("Biaya staff cukup tinggi dibanding omzet. Pertimbangkan jadwal shift lebih efisien atau mulai dengan tim lebih kecil.");
  if (calculatePayrollGrossProfitRatio(totalPayroll, grossProfit) > 45) warnings.push("Payroll mengambil porsi besar dari laba kotor. Simulasi profit perlu ditinjau ulang.");
  return warnings;
}

export function calculateStaffPlanResult(project: Project) {
  const scenario = selectedStaffScenario(project);
  const mp = monthlyProjectionResultWithoutPayroll(project);
  const totalHeadcount = sum((scenario?.roles || []).map((role) => role.headcount));
  const totalBaseSalary = sum((scenario?.roles || []).map((role) => n(role.baseSalary) * n(role.headcount)));
  const totalAllowance = sum((scenario?.roles || []).map((role) => calculateStaffRoleCost(role).totalAllowance));
  const totalPayroll = calculateTotalPayroll(scenario);
  const payrollRevenueRatio = calculatePayrollRevenueRatio(totalPayroll, mp.monthlyRevenue);
  const payrollGrossProfitRatio = calculatePayrollGrossProfitRatio(totalPayroll, mp.grossProfit);
  const warnings = generatePayrollWarnings(totalPayroll, mp.monthlyRevenue, mp.grossProfit, totalHeadcount);
  const recommendations = warnings.length ? warnings : ["Komposisi staff terlihat cukup sehat untuk asumsi omzet saat ini."];
  return { totalHeadcount, totalBaseSalary, totalAllowance, totalPayroll, payrollRevenueRatio, payrollGrossProfitRatio, warnings, recommendations };
}

function monthlyProjectionResultWithoutPayroll(project: Project) {
  const mp = project.monthlyProjection;
  const productRevenue = sum(Object.values(mp.productRevenueByCategory || {}));
  const monthlyRevenue = n(mp.estimatedDailySales) * n(mp.operatingDaysPerMonth) + productRevenue + n(mp.vendorIncome) + n(mp.otherIncome);
  const cogs = n(mp.costs["COGS food"]) + n(mp.costs["COGS beverage"]);
  const grossProfit = monthlyRevenue - cogs;
  return { monthlyRevenue, grossProfit };
}

export function getProjectPayroll(project: Project) {
  if (project.monthlyProjection?.useManualStaffSalary) return n(project.monthlyProjection.manualStaffSalary || project.monthlyProjection.costs?.["Staff salary"]);
  return calculateTotalPayroll(selectedStaffScenario(project));
}

export function calculateWeightedGrossMargin(scenario: OpeningScenario) {
  const mix = scenario.productMix;
  const margin = scenario.marginAssumptions;
  return (
    pct(mix.ownBeverage) * pct(margin.ownBeverage) +
    pct(mix.ownFood) * pct(margin.ownFood) +
    pct(mix.consignment) * pct(margin.consignmentCafeShare) +
    pct(mix.vendorRevenueShare) * pct(margin.vendorCafeShare) +
    pct(mix.buyout) * pct(margin.buyout)
  );
}

export function calculateDailyRevenueFromScenario(scenario: OpeningScenario) {
  const customers = n(scenario.customersPerDay);
  const beverage = customers * pct(scenario.beverageBuyerPercentage) * n(scenario.averageBeveragePrice);
  const food = customers * pct(scenario.foodBuyerPercentage) * n(scenario.averageFoodPrice);
  const bothLift = customers * pct(scenario.bothBuyerPercentage) * ((n(scenario.averageBeveragePrice) + n(scenario.averageFoodPrice)) * 0.15);
  const external = customers * pct(scenario.productMix.consignment + scenario.productMix.vendorRevenueShare) * n(scenario.averageConsignmentPrice) * 0.35;
  return beverage + food + bothLift + external;
}

export function calculateMonthlyRevenueFromScenario(scenario: OpeningScenario) {
  return calculateDailyRevenueFromScenario(scenario) * n(scenario.operatingDaysPerMonth);
}

export function calculateScenarioGrossProfit(scenario: OpeningScenario) {
  return calculateMonthlyRevenueFromScenario(scenario) * calculateWeightedGrossMargin(scenario);
}

export function calculateScenarioNetProfit(scenario: OpeningScenario) {
  return calculateScenarioGrossProfit(scenario) - sum(Object.values(scenario.fixedCosts || {}));
}

export function calculateBreakEvenRevenue(monthlyOperatingCost: number, weightedGrossMargin: number) {
  return weightedGrossMargin <= 0 ? 0 : monthlyOperatingCost / weightedGrossMargin;
}

export function calculateBreakEvenCustomersPerDay(scenario: OpeningScenario, breakEvenMonthlyRevenue: number) {
  const averageTransactionValue = safeDivide(calculateDailyRevenueFromScenario(scenario), scenario.customersPerDay);
  return safeDivide(breakEvenMonthlyRevenue, scenario.operatingDaysPerMonth) / Math.max(1, averageTransactionValue);
}

export function calculatePaybackMonths(initialInvestment: number, monthlyNetProfit: number) {
  return monthlyNetProfit <= 0 ? null : initialInvestment / monthlyNetProfit;
}

export function generateScenarioInterpretation(paybackMonths: number | null, netProfit: number) {
  if (netProfit <= 0) return "Dengan asumsi saat ini, usaha belum menghasilkan laba. Perlu menaikkan omzet, mengurangi biaya tetap, atau memperbaiki margin produk.";
  if (paybackMonths !== null && paybackMonths <= 12) return "Simulasi ini cukup menarik. Dengan asumsi customer dan margin tercapai, modal berpotensi kembali dalam kurang dari 1 tahun.";
  if (paybackMonths !== null && paybackMonths <= 24) return "Simulasi ini masih cukup realistis untuk F&B, tetapi perlu kontrol biaya dan strategi penjualan yang stabil.";
  return "Balik modal cukup lama. Perlu evaluasi harga jual, biaya sewa, payroll, atau target customer.";
}

export function generateScenarioRecommendations(scenario: OpeningScenario, result: Pick<OpeningScenarioResult, "monthlyRevenue" | "monthlyOperatingCost" | "weightedGrossMargin" | "breakEvenCustomersPerDay">) {
  const recommendations: string[] = [];
  const rent = n(scenario.fixedCosts.Rent);
  const staff = n(scenario.fixedCosts["Staff salary"]);
  if (safeDivide(rent, result.monthlyRevenue) > 0.18) recommendations.push("Biaya sewa terlihat cukup berat dibanding omzet. Pertimbangkan negosiasi sewa atau target sales lebih tinggi.");
  if (safeDivide(staff, result.monthlyRevenue) > 0.22) recommendations.push("Biaya staff cukup besar. Pertimbangkan jadwal shift lebih efisien di awal.");
  if (result.weightedGrossMargin < 0.45) recommendations.push("Margin produk rendah. Review HPP, harga jual, atau komposisi produk sendiri vs konsinyasi.");
  if (result.breakEvenCustomersPerDay > scenario.customersPerDay * 1.2) recommendations.push("Target customer per hari cukup tinggi. Pastikan lokasi, traffic, dan marketing mampu mendukung angka ini.");
  if (scenario.productMix.consignment > 35) recommendations.push("Pendapatan dari produk konsinyasi cenderung lebih kecil. Pastikan produk sendiri tetap menjadi sumber margin utama.");
  if (!recommendations.length) recommendations.push("Asumsi utama terlihat sehat. Tetap cek harga bahan baku, traffic lokasi, dan repeat customer setelah opening.");
  return recommendations;
}

export function calculateOpeningScenarioResult(scenario: OpeningScenario, initialInvestment: number, payroll = n(scenario.fixedCosts["Staff salary"])): OpeningScenarioResult {
  const dailyRevenue = calculateDailyRevenueFromScenario(scenario);
  const monthlyRevenue = calculateMonthlyRevenueFromScenario(scenario);
  const weightedGrossMargin = calculateWeightedGrossMargin(scenario);
  const grossProfit = monthlyRevenue * weightedGrossMargin;
  const monthlyOperatingCost = sum(Object.entries(scenario.fixedCosts || {}).filter(([key]) => key !== "Staff salary").map(([, value]) => value)) + payroll;
  const netProfit = grossProfit - monthlyOperatingCost;
  const netMargin = safeDivide(netProfit, monthlyRevenue) * 100;
  const breakEvenMonthlyRevenue = calculateBreakEvenRevenue(monthlyOperatingCost, weightedGrossMargin);
  const breakEvenDailyRevenue = safeDivide(breakEvenMonthlyRevenue, scenario.operatingDaysPerMonth);
  const breakEvenCustomersPerDay = calculateBreakEvenCustomersPerDay(scenario, breakEvenMonthlyRevenue);
  const paybackMonths = calculatePaybackMonths(initialInvestment, netProfit);
  const paybackYears = paybackMonths === null ? null : paybackMonths / 12;
  const interpretation = generateScenarioInterpretation(paybackMonths, netProfit);
  const recommendations = generateScenarioRecommendations({ ...scenario, fixedCosts: { ...scenario.fixedCosts, "Staff salary": payroll } }, { monthlyRevenue, monthlyOperatingCost, weightedGrossMargin, breakEvenCustomersPerDay });
  return { dailyRevenue, monthlyRevenue, weightedGrossMargin, grossProfit, monthlyOperatingCost, netProfit, netMargin, breakEvenMonthlyRevenue, breakEvenDailyRevenue, breakEvenCustomersPerDay, paybackMonths, paybackYears, interpretation, recommendations };
}

export function calculateOpeningBuffer(setupBudget: number, bufferPercentage: number) {
  return n(setupBudget) * pct(bufferPercentage);
}

export function calculateCapitalNeededWithBuffer(setupBudget: number, bufferPercentage: number) {
  return n(setupBudget) + calculateOpeningBuffer(setupBudget, bufferPercentage);
}

export function generateCapitalReadinessStatus(project: Project) {
  const mp = monthlyProjectionResult(project);
  return {
    setupBudgetCompleted: project.setupBudget.some((item) => item.estimatedPrice > 0),
    staffCostEstimated: calculateTotalPayroll(selectedStaffScenario(project)) > 0,
    productMarginEstimated: project.products.some((product) => product.sellingPrice > 0 && (product.costPrice > 0 || product.cafeSharePercentage > 0)),
    electricityEstimated: project.equipment.some((equipment) => monthlyElectricityCost(equipment) > 0),
    monthlyProjectionFilled: mp.monthlyRevenue > 0,
    paybackScenarioSelected: project.openingScenarios.some((scenario) => scenario.selectedForPitch),
    profitSharingChecked: sum(project.ownership.partners.map((partner) => partner.profitSharingPercentage)) === 100,
    summaryReady: project.summary.decisionStatus === "Ready for investor" || project.summary.decisionStatus === "Approved",
  };
}

export function generateRiskRecommendations(project: Project): RiskItem[] {
  const mp = monthlyProjectionResult(project);
  const staff = calculateStaffPlanResult(project);
  const consignmentMix = safeDivide(project.products.filter((product) => product.type === "Consignment product").length, project.products.length) * 100;
  return (project.riskItems || []).map((risk) => {
    let recommendation = risk.recommendation;
    if (risk.title === "Payroll terlalu tinggi" && staff.payrollRevenueRatio > 30) recommendation = "Mulai dengan jadwal shift lebih ramping atau gunakan part-time di jam ramai.";
    if (risk.title === "Sewa terlalu tinggi" && safeDivide(n(project.monthlyProjection.costs.Rent), mp.monthlyRevenue) > 0.18) recommendation = "Negosiasi sewa, cari revenue sharing, atau naikkan target sales harian.";
    if (risk.title === "Margin produk rendah" && safeDivide(mp.grossProfit, mp.monthlyRevenue) < 0.45) recommendation = "Review HPP, harga jual, dan dorong produk margin tinggi.";
    if (risk.title === "Terlalu banyak konsinyasi" && consignmentMix > 35) recommendation = "Pastikan beverage/produk sendiri tetap jadi sumber margin utama.";
    return { ...risk, recommendation };
  });
}

export function calculateMenuItemGrossProfit(item: MenuMixItem) {
  return n(item.sellingPrice) - n(item.estimatedCost);
}

export function calculateMenuItemGrossMargin(item: MenuMixItem) {
  return safeDivide(calculateMenuItemGrossProfit(item), item.sellingPrice) * 100;
}

export function calculateOwnProductRatio(items: MenuMixItem[]) {
  return safeDivide(items.filter((item) => item.source === "Own product").length, items.length) * 100;
}

export function calculateVendorConsignmentRatio(items: MenuMixItem[]) {
  return safeDivide(items.filter((item) => item.source === "Vendor" || item.source === "Consignment").length, items.length) * 100;
}

export function calculateWeightedMenuMargin(items: MenuMixItem[]) {
  const revenue = sum(items.map((item) => item.sellingPrice * item.expectedSalesPerDay * 26));
  const grossProfit = sum(items.map((item) => calculateMenuItemGrossProfit(item) * item.expectedSalesPerDay * 26));
  return safeDivide(grossProfit, revenue) * 100;
}

export function calculateMenuMixSummary(items: MenuMixItem[]) {
  const normalized = items.map((item) => ({
    ...item,
    grossProfit: calculateMenuItemGrossProfit(item),
    grossMargin: calculateMenuItemGrossMargin(item),
    monthlyRevenueEstimate: n(item.sellingPrice) * n(item.expectedSalesPerDay) * 26,
    monthlyGrossProfitEstimate: calculateMenuItemGrossProfit(item) * n(item.expectedSalesPerDay) * 26,
  }));
  const totalMenuCount = normalized.length;
  const ownProductRatio = calculateOwnProductRatio(normalized);
  const vendorConsignmentRatio = calculateVendorConsignmentRatio(normalized);
  const weightedAverageMargin = calculateWeightedMenuMargin(normalized);
  const estimatedMonthlyRevenue = sum(normalized.map((item) => item.monthlyRevenueEstimate));
  const estimatedMonthlyGrossProfit = sum(normalized.map((item) => item.monthlyGrossProfitEstimate));
  const topMarginItems = [...normalized].sort((a, b) => b.grossMargin - a.grossMargin).slice(0, 5);
  const topRevenueItems = [...normalized].sort((a, b) => b.monthlyRevenueEstimate - a.monthlyRevenueEstimate).slice(0, 5);
  const lowMarginItems = normalized.filter((item) => item.grossMargin < 45);
  return { items: normalized, totalMenuCount, ownProductRatio, vendorConsignmentRatio, weightedAverageMargin, estimatedMonthlyRevenue, estimatedMonthlyGrossProfit, topMarginItems, topRevenueItems, lowMarginItems };
}

export function generateMenuMixRecommendations(items: MenuMixItem[]) {
  const summary = calculateMenuMixSummary(items);
  const ownBeverageCount = items.filter((item) => item.source === "Own product" && item.category === "Beverage").length;
  const beverageCount = items.filter((item) => item.category === "Beverage").length;
  const recommendations: string[] = [];
  if (summary.ownProductRatio < 50) recommendations.push("Produk sendiri masih terlalu sedikit. Untuk profit lebih sehat, pertimbangkan menambah produk sendiri terutama beverage dengan margin tinggi.");
  if (summary.vendorConsignmentRatio > 40) recommendations.push("Porsi vendor/konsinyasi cukup besar. Pendapatan cafe bisa lebih kecil karena margin dibagi dengan pihak luar.");
  if (summary.weightedAverageMargin < 45) recommendations.push("Margin rata-rata menu cukup rendah. Review HPP, harga jual, atau komposisi menu.");
  if (safeDivide(ownBeverageCount, beverageCount) * 100 >= 60) recommendations.push("Komposisi beverage sendiri cukup baik untuk menopang profit cafe.");
  if (!recommendations.length) recommendations.push("Menu mix terlihat cukup sehat. Tetap pantau kontribusi revenue dan margin tiap produk setelah opening.");
  return recommendations;
}

export function calculateCapitalBuffer(project: Project) {
  const estimated = totalEstimatedSetupBudget(project.setupBudget);
  const actual = totalActualSpending(project.setupBudget);
  const remaining = Math.max(0, estimated - actual);
  const buffer = project.capitalBuffer || { baseType: "estimated", bufferPercentage: project.openingBuffer?.percentage || 10 };
  const base = buffer.baseType === "actual" ? actual : buffer.baseType === "remaining" ? remaining : estimated;
  const bufferAmount = base * pct(buffer.bufferPercentage);
  const totalRecommendedCapital = estimated + bufferAmount;
  return { setupEstimatedBudget: estimated, setupActualSpending: actual, selectedBaseAmount: base, bufferAmount, totalRecommendedCapital };
}

export function calculateTotalRecommendedCapital(project: Project) {
  return calculateCapitalBuffer(project).totalRecommendedCapital;
}

export function generateBufferRecommendation(bufferPercentage: number) {
  if (bufferPercentage < 10) return "Buffer cukup kecil. Untuk F&B baru, dana cadangan 10-20% biasanya lebih aman.";
  if (bufferPercentage <= 20) return "Buffer cukup sehat untuk mengantisipasi pembengkakan biaya awal.";
  return "Buffer sangat aman, tetapi pastikan modal tidak terlalu besar dibanding potensi balik modal.";
}

export function calculateOverallRiskStatus(items: RiskItem[]) {
  const active = items.filter((item) => item.active && item.status !== "Resolved");
  const high = active.filter((item) => item.level === "High").length;
  const medium = active.filter((item) => item.level === "Medium").length;
  if (high >= 3) return "Needs Review" as const;
  if (high > 0) return "High Risk" as const;
  if (medium >= 3) return "Moderate Risk" as const;
  return "Low Risk" as const;
}

export function generateAutoRiskChecklist(project: Project) {
  const mp = monthlyProjectionResult(project);
  const staff = calculateStaffPlanResult(project);
  const menu = calculateMenuMixSummary(project.menuMixPlan?.items || []);
  const selectedScenario = project.openingScenarios.find((scenario) => scenario.selectedForPitch) || project.openingScenarios[0];
  const scenarioResult = selectedScenario ? calculateOpeningScenarioResult(selectedScenario, projectInitialInvestment(project, selectedScenario.investmentSource), getProjectPayroll(project)) : undefined;
  const buffer = project.capitalBuffer || { bufferPercentage: project.openingBuffer?.percentage || 0 };
  const actualOverBudget = totalActualSpending(project.setupBudget) > totalEstimatedSetupBudget(project.setupBudget);
  const suggestions: Record<string, Partial<RiskItem>> = {};
  if (safeDivide(n(project.monthlyProjection.costs.Rent), mp.monthlyRevenue) > 0.15) suggestions["Sewa terlalu tinggi"] = { active: true, level: "High", autoGenerated: true, recommendation: "Sewa melewati 15% omzet. Negosiasi sewa atau naikkan target sales." };
  if (staff.payrollRevenueRatio > 30) suggestions["Payroll terlalu tinggi"] = { active: true, level: "High", autoGenerated: true, recommendation: "Payroll melewati 30% omzet. Review shift dan headcount awal." };
  if (menu.weightedAverageMargin < 45) suggestions["Margin produk rendah"] = { active: true, level: "Medium", autoGenerated: true, recommendation: "Weighted menu margin di bawah 45%. Review HPP dan harga jual." };
  if (menu.vendorConsignmentRatio > 40) suggestions["Terlalu banyak produk konsinyasi/vendor"] = { active: true, level: "Medium", autoGenerated: true, recommendation: "Kurangi ketergantungan vendor/konsinyasi atau tambah produk sendiri." };
  if (scenarioResult && scenarioResult.breakEvenCustomersPerDay > selectedScenario.customersPerDay) suggestions["Target customer terlalu tinggi"] = { active: true, level: "High", autoGenerated: true, recommendation: "Target customer break-even lebih tinggi dari asumsi scenario." };
  if (n(buffer.bufferPercentage) < 10) suggestions["Tidak ada dana cadangan"] = { active: true, level: "Medium", autoGenerated: true, recommendation: "Tambahkan buffer minimal 10% untuk opening." };
  if (actualOverBudget) suggestions["Renovasi over budget"] = { active: true, level: "Medium", autoGenerated: true, recommendation: "Actual spending melewati estimasi. Review pengadaan dan buffer." };
  return (project.riskChecklist?.items || project.riskItems || []).map((item) => ({ ...item, ...(suggestions[item.title] || {}) }));
}

export function generateReadinessRecommendation(score: number) {
  if (score < 40) return "Project masih tahap draft. Lengkapi data utama seperti modal, staff, produk, dan proyeksi.";
  if (score < 70) return "Project sudah mulai terbentuk, tetapi masih perlu melengkapi beberapa bagian penting.";
  if (score < 90) return "Project hampir siap dipresentasikan. Review risiko dan asumsi keuangan sebelum pitch.";
  return "Project siap dipresentasikan sebagai simulasi bisnis awal.";
}

export function calculateReadinessScore(project: Project) {
  const riskItems = project.riskChecklist?.items || project.riskItems || [];
  const checks: Array<[string, boolean, string]> = [
    ["Project profile completed", Boolean(project.cafeName && project.businessType && project.projectStatus), "Project profile belum lengkap"],
    ["Ownership structure completed", project.ownership.partners.length > 0 && sum(project.ownership.partners.map((p) => p.ownershipPercentage)) > 0, "Ownership structure belum lengkap"],
    ["Setup budget completed", totalEstimatedSetupBudget(project.setupBudget) > 0, "Setup budget belum diisi"],
    ["Actual spending or estimate filled", project.setupBudget.some((item) => item.estimatedPrice > 0 || item.actualPrice > 0), "Actual spending atau estimasi belum diisi"],
    ["Staff planning completed", calculateTotalPayroll(selectedStaffScenario(project)) > 0, "Staff planning belum diisi"],
    ["Product/vendor strategy completed", project.products.length > 0, "Product/vendor strategy belum diisi"],
    ["Menu mix completed", (project.menuMixPlan?.items || []).length > 0, "Menu mix belum lengkap"],
    ["Equipment & electricity completed", project.equipment.some((equipment) => monthlyElectricityCost(equipment) > 0), "Equipment & electricity belum lengkap"],
    ["Monthly projection completed", monthlyProjectionResult(project).monthlyRevenue > 0, "Monthly projection belum diisi"],
    ["Balik modal scenario selected", project.openingScenarios.some((scenario) => scenario.selectedForPitch), "Balik modal scenario belum dipilih"],
    ["Profit sharing checked", sum(project.ownership.partners.map((p) => p.profitSharingPercentage)) === 100, "Profit sharing belum 100%"],
    ["Capital buffer added", n(project.capitalBuffer?.bufferPercentage || project.openingBuffer?.percentage) > 0, "Capital buffer belum ditambahkan"],
    ["Risk checklist reviewed", riskItems.some((risk) => risk.active || risk.status !== "Open" || risk.checked), "Risk checklist belum direview"],
    ["Consultant notes filled", Boolean(project.summary.strengths && project.summary.risks && project.summary.recommendation), "Consultant notes belum lengkap"],
    ["Pitch page ready", project.summary.decisionStatus === "Ready for investor" || project.summary.decisionStatus === "Approved", "Pitch page belum ready"],
  ];
  const completedItems = checks.filter(([, done]) => done).map(([label]) => label);
  const missingItems = checks.filter(([, done]) => !done).map(([, , missing]) => missing);
  const score = safeDivide(completedItems.length, checks.length) * 100;
  const status = score < 40 ? "Draft" : score < 70 ? "Needs Work" : score < 90 ? "Almost Ready" : "Ready to Pitch";
  return { score, status, completedItems, missingItems, recommendation: generateReadinessRecommendation(score) };
}

export function projectInitialInvestment(project: Project, source: "estimated" | "actual") {
  const setup = source === "actual" ? totalActualSpending(project.setupBudget) : totalEstimatedSetupBudget(project.setupBudget);
  return setup + existingAssetCapital(project.existingAssets);
}

export function profitSharing(project: Project, monthlyNetProfit: number) {
  const partners = project.ownership.partners;
  const fixedFees = sum(partners.map((partner) => partner.fixedFee));
  const distributable = monthlyNetProfit - fixedFees;
  return partners.map((partner) => {
    const percentage = project.profitSharing.mode === "Based on ownership percentage" ? partner.ownershipPercentage : partner.profitSharingPercentage;
    const share = Math.max(0, distributable) * pct(percentage);
    return { partner, fixedFee: partner.fixedFee, profitReceived: share, finalReceived: partner.fixedFee + share };
  });
}
