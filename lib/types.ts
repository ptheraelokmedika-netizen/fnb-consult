export type ProjectHealth = "Draft" | "In progress" | "Ready to pitch" | "Opened" | "Needs review";
export type ScenarioName = "Conservative" | "Realistic" | "Optimistic" | "Custom";
export type StaffScenarioName = "Lean Team" | "Standard Team" | "Full Team" | "Custom";
export type MasterCategoryType = "setup_budget" | "product" | "equipment" | "expense" | "staff" | "all";

export interface MasterCategory {
  id: string;
  name: string;
  type: MasterCategoryType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistLibraryItem {
  id: string;
  name: string;
  categoryId: string;
  defaultEstimatedPrice: number;
  defaultQuantity: number;
  required: boolean;
  active: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  id: string;
  name: string;
  role: "Owner" | "Investor" | "Operational partner" | "Landlord partner" | "Brand owner" | "Silent investor";
  capitalContribution: number;
  ownershipPercentage: number;
  profitSharingPercentage: number;
  decisionPowerPercentage: number;
  fixedFee: number;
  notes: string;
}

export interface OwnershipStructure {
  mode: "Cafe sendiri" | "Equal ownership" | "Custom percentage" | "Based on capital contribution" | "Hybrid";
  partners: Partner[];
  businessSchemes: BusinessScheme[];
}

export interface BusinessScheme {
  id: string;
  type: "Saham kosong" | "Bagi hasil rata" | "Bagi hasil custom" | "Modal masuk" | "Cafe lama" | "Cafe baru";
  personName: string;
  percentage: number;
  amount: number;
  notes: string;
}

export interface ExistingAsset {
  id: string;
  name: string;
  category: string;
  owner: string;
  currentValue: number;
  originalPrice: number;
  condition: "New" | "Good" | "Used" | "Needs repair";
  countedAsCapital: boolean;
  notes: string;
}

export interface SetupBudgetItem {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  required: boolean;
  estimatedPrice: number;
  actualPrice: number;
  quantity: number;
  vendor: string;
  paidByPartnerId: string;
  paidBy: string;
  purchased: boolean;
  purchaseDate: string;
  notes: string;
  sourceLibraryItemId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  type: "Own product" | "Vendor product" | "Consignment product" | "Beli putus" | "Bagi hasil" | "Tenant product" | "Dropship / external product";
  category: string;
  source: "Made in-house" | "Bought from vendor" | "Consignment" | "Revenue sharing" | "Tenant";
  sellingPrice: number;
  costPrice: number;
  vendorName: string;
  vendorSharePercentage: number;
  cafeSharePercentage: number;
  monthlyEstimatedSales: number;
  paymentTerm: string;
  notes: string;
}

export interface Equipment {
  id: string;
  name: string;
  usedFor: string;
  owner: "Cafe" | "Vendor" | "Shared";
  type: string;
  powerWatt: number;
  hoursPerDay: number;
  daysPerMonth: number;
  tariffPerKwh: number;
  paidBy: "Cafe" | "Vendor" | "Shared";
  cafePercentage: number;
  vendorPercentage: number;
  value: number;
  notes: string;
}

export interface MonthlyProjection {
  estimatedDailySales: number;
  operatingDaysPerMonth: number;
  productRevenueByCategory: Record<string, number>;
  vendorIncome: number;
  otherIncome: number;
  costs: Record<string, number>;
  useManualStaffSalary: boolean;
  manualStaffSalary: number;
}

export interface ProductMix {
  ownBeverage: number;
  ownFood: number;
  consignment: number;
  vendorRevenueShare: number;
  buyout: number;
}

export interface MarginAssumptions {
  ownBeverage: number;
  ownFood: number;
  consignmentCafeShare: number;
  vendorCafeShare: number;
  buyout: number;
}

export interface OpeningScenario {
  id: string;
  name: ScenarioName;
  customersPerDay: number;
  operatingDaysPerMonth: number;
  beverageBuyerPercentage: number;
  foodBuyerPercentage: number;
  bothBuyerPercentage: number;
  averageBeveragePrice: number;
  averageFoodPrice: number;
  averageConsignmentPrice: number;
  averageOwnProductPrice: number;
  productMix: ProductMix;
  marginAssumptions: MarginAssumptions;
  fixedCosts: Record<string, number>;
  investmentSource: "estimated" | "actual";
  selectedForPitch: boolean;
}

export interface OpeningScenarioResult {
  dailyRevenue: number;
  monthlyRevenue: number;
  weightedGrossMargin: number;
  grossProfit: number;
  monthlyOperatingCost: number;
  netProfit: number;
  netMargin: number;
  breakEvenMonthlyRevenue: number;
  breakEvenDailyRevenue: number;
  breakEvenCustomersPerDay: number;
  paybackMonths: number | null;
  paybackYears: number | null;
  interpretation: string;
  recommendations: string[];
}

export interface ProfitSharingSimulation {
  mode: "Based on ownership percentage" | "Based on custom profit percentage" | "Fixed management fee first, then profit share" | "Investor return first, then profit share" | "Operator salary first, then profit share";
  monthlyNetProfit: number;
}

export interface Summary {
  strengths: string;
  risks: string;
  recommendation: string;
  nextAction: string;
  decisionStatus: "Draft" | "Need revision" | "Ready for investor" | "Approved" | "Opened";
}

export interface StaffRole {
  id: string;
  position: string;
  employmentType: "Full-time" | "Part-time" | "Daily worker" | "Owner unpaid" | "Outsourced";
  headcount: number;
  baseSalary: number;
  mealAllowance: number;
  transportAllowance: number;
  incentive: number;
  benefit: number;
  otherAllowance: number;
  notes: string;
}

export interface StaffScenario {
  id: string;
  name: StaffScenarioName;
  selectedForPitch: boolean;
  roles: StaffRole[];
}

export interface StaffPlan {
  id: string;
  selectedScenario: string;
  scenarios: StaffScenario[];
}

export interface StaffPlanResult {
  totalHeadcount: number;
  totalBaseSalary: number;
  totalAllowance: number;
  totalPayroll: number;
  payrollRevenueRatio: number;
  payrollGrossProfitRatio: number;
  warnings: string[];
  recommendations: string[];
}

export interface RiskItem {
  id: string;
  title: string;
  level: "Low" | "Medium" | "High";
  active: boolean;
  notes: string;
  recommendation: string;
  responsiblePerson: string;
  targetResolutionDate: string;
  status: "Open" | "In progress" | "Resolved" | "Accepted risk";
  autoGenerated: boolean;
  checked: boolean;
}

export interface RiskChecklist {
  id: string;
  items: RiskItem[];
  overallRiskStatus: "Low Risk" | "Moderate Risk" | "High Risk" | "Needs Review";
  updatedAt: string;
}

export interface MenuMixItem {
  id: string;
  name: string;
  category: "Beverage" | "Food" | "Dessert" | "Snack" | "Vendor product" | "Consignment" | "Merchandise" | "Other";
  source: "Own product" | "Vendor" | "Consignment" | "Beli putus" | "Bagi hasil";
  sellingPrice: number;
  estimatedCost: number;
  grossProfit: number;
  grossMargin: number;
  expectedSalesPerDay: number;
  monthlyRevenueEstimate: number;
  monthlyGrossProfitEstimate: number;
  isHeroProduct: boolean;
  isHighMargin: boolean;
  notes: string;
}

export interface MenuMixPlan {
  id: string;
  items: MenuMixItem[];
  notes: string;
  updatedAt: string;
}

export interface CapitalReadiness {
  setupBudgetCompleted: boolean;
  staffCostEstimated: boolean;
  productMarginEstimated: boolean;
  electricityEstimated: boolean;
  monthlyProjectionFilled: boolean;
  paybackScenarioSelected: boolean;
  profitSharingChecked: boolean;
  summaryReady: boolean;
}

export interface MenuMixPlanner {
  beverageCount: number;
  foodCount: number;
  dessertSnackCount: number;
  ownProductPercentage: number;
  vendorConsignmentPercentage: number;
  heroProductTarget: string;
  highMarginProducts: string;
  lowMarginProducts: string;
  notes: string;
}

export interface CapitalBuffer {
  id: string;
  baseType: "estimated" | "actual" | "remaining";
  bufferPercentage: number;
  bufferAmount: number;
  totalRecommendedCapital: number;
  reasons: string[];
  notes: string;
}

export interface OpeningBuffer {
  percentage: number;
}

export interface ReadinessScore {
  score: number;
  status: "Draft" | "Needs Work" | "Almost Ready" | "Ready to Pitch";
  completedItems: string[];
  missingItems: string[];
  recommendation: string;
}

export interface Project {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  cafeName: string;
  businessType: string;
  projectStatus: string;
  placeStatus: string;
  locationNotes: string;
  targetOpeningDate: string;
  consultantNotes: string;
  health: ProjectHealth;
  ownership: OwnershipStructure;
  existingAssets: ExistingAsset[];
  setupBudget: SetupBudgetItem[];
  products: Product[];
  equipment: Equipment[];
  staffPlan: StaffPlan;
  monthlyProjection: MonthlyProjection;
  openingScenarios: OpeningScenario[];
  profitSharing: ProfitSharingSimulation;
  riskItems: RiskItem[];
  menuMix: MenuMixPlanner;
  menuMixPlan: MenuMixPlan;
  capitalBuffer: CapitalBuffer;
  riskChecklist: RiskChecklist;
  readinessScore: ReadinessScore;
  openingBuffer: OpeningBuffer;
  summary: Summary;
}

export interface Settings {
  consultantName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  defaultElectricityTariff: number;
  defaultChecklistItems: ChecklistLibraryItem[];
  masterCategories: MasterCategory[];
  categories: {
    setup: string[];
    product: string[];
    expense: string[];
    equipment: string[];
    staff: string[];
  };
  pdf: {
    showLogo: boolean;
    showContact: boolean;
    disclaimer: string;
  };
}

export interface AppData {
  projects: Project[];
  settings: Settings;
}
