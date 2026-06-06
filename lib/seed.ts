import { AppData, ChecklistLibraryItem, MasterCategory, MasterCategoryType, MenuMixItem, Project, Settings, SetupBudgetItem, StaffPlan, StaffRole, OpeningScenario, CapitalBuffer, RiskChecklist, ReadinessScore } from "./types";

export const id = () => {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (randomUUID) return randomUUID.call(globalThis.crypto);
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const checklist = [
  ["Deposit sewa", "Place / Location"],
  ["Sewa bulan pertama", "Place / Location"],
  ["Legal / permit / admin", "Place / Location"],
  ["Renovasi ringan", "Place / Location"],
  ["Interior", "Place / Location"],
  ["Signage / papan nama", "Place / Location"],
  ["Coffee machine", "Equipment"],
  ["Grinder", "Equipment"],
  ["Blender", "Equipment"],
  ["Chiller", "Equipment"],
  ["Showcase", "Equipment"],
  ["POS device", "Equipment"],
  ["Table", "Furniture & Interior"],
  ["Chair", "Furniture & Interior"],
  ["Bar counter", "Furniture & Interior"],
  ["Glass", "Smallwares"],
  ["Cup", "Smallwares"],
  ["Tray", "Smallwares"],
  ["Coffee beans", "Initial Stock"],
  ["Milk", "Initial Stock"],
  ["Syrup", "Initial Stock"],
  ["Packaging", "Initial Stock"],
  ["Training cost", "Operational"],
  ["Opening promo", "Operational"],
  ["Contingency fund", "Operational"],
] as const;

export const defaultSetupCategories = [
  "Place / Location",
  "Renovation",
  "Equipment",
  "Furniture & Interior",
  "Smallwares",
  "Initial Stock",
  "Packaging",
  "Branding & Marketing",
  "Operational",
  "Legal / Permit",
  "Utility",
  "Contingency",
  "Other",
];

const nowIso = () => new Date().toISOString();
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const categoryId = (type: MasterCategoryType, name: string) => `cat-${type}-${slug(name)}`;

function makeCategory(name: string, type: MasterCategoryType): MasterCategory {
  const now = nowIso();
  return { id: categoryId(type, name), name, type, active: true, createdAt: now, updatedAt: now };
}

export const defaultStaffRoles = [
  "Owner operator",
  "General manager",
  "Store manager",
  "Supervisor",
  "Head barista",
  "Barista",
  "Cashier",
  "Waiter / Server",
  "Kitchen crew",
  "Cook",
  "Chef",
  "Head chef",
  "Pastry / Baker",
  "Dishwasher",
  "Cleaning staff",
  "Marketing / Content creator",
  "Admin / Finance",
  "Delivery / Runner",
  "Part-time staff",
  "Other",
];

export const defaultMasterCategories: MasterCategory[] = [
  ...defaultSetupCategories.map((name) => makeCategory(name, "setup_budget")),
  ...["Beverage", "Food", "Snack", "Dessert", "Merchandise", "Other"].map((name) => makeCategory(name, "product")),
  ...["Showcase", "Chiller", "Freezer", "Oven", "Warmer", "Coffee machine", "Blender", "Stove", "Utility", "Other"].map((name) => makeCategory(name, "equipment")),
  ...["COGS food", "COGS beverage", "Rent", "Electricity", "Water", "Internet", "Gas", "Packaging", "Cleaning", "Marketing", "Platform fee", "Maintenance", "Miscellaneous", "Loan installment", "Investor return", "Other"].map((name) => makeCategory(name, "expense")),
  ...defaultStaffRoles.map((name) => makeCategory(name, "staff")),
];

function categoryNameToId(name: string, type: MasterCategoryType) {
  return defaultMasterCategories.find((category) => category.type === type && category.name === name)?.id || categoryId(type, name || "Other");
}

function makeChecklistLibraryItem(name: string, category: string, defaultEstimatedPrice = 0, defaultQuantity = 1, required = true): ChecklistLibraryItem {
  const now = nowIso();
  return {
    id: id(),
    name,
    categoryId: categoryNameToId(category, "setup_budget"),
    defaultEstimatedPrice,
    defaultQuantity,
    required,
    active: true,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

export const defaultSettings: Settings = {
  consultantName: "Konsultan F&B",
  phone: "",
  email: "",
  address: "",
  notes: "",
  defaultElectricityTariff: 1700,
  defaultChecklistItems: checklist.map(([name, category]) => makeChecklistLibraryItem(name, category)),
  masterCategories: defaultMasterCategories,
  categories: {
    setup: defaultSetupCategories,
    product: ["Beverage", "Food", "Snack", "Dessert", "Merchandise", "Other"],
    expense: ["COGS food", "COGS beverage", "Rent", "Electricity", "Water", "Internet", "Gas", "Packaging", "Cleaning", "Marketing", "Platform fee", "Maintenance", "Miscellaneous", "Loan installment", "Investor return", "Other"],
    equipment: ["Showcase", "Chiller", "Freezer", "Oven", "Warmer", "Coffee machine", "Blender", "Stove", "Utility", "Other"],
    staff: defaultStaffRoles,
  },
  pdf: {
    showLogo: true,
    showContact: true,
    disclaimer:
      "Dokumen ini adalah simulasi bisnis dan alat bantu konsultasi. Angka dapat berubah sesuai kondisi aktual, harga vendor, lokasi, operasional, dan perjanjian para pihak. Gunakan dokumen ini sebagai bahan diskusi, bukan pengganti perjanjian hukum atau laporan keuangan final.",
  },
};

export function makeSetupItem(name: string, category: string, estimatedPrice = 0, actualPrice = 0, quantity = 1): SetupBudgetItem {
  const now = nowIso();
  return {
    id: id(),
    name,
    categoryId: categoryNameToId(category, "setup_budget"),
    category,
    required: true,
    estimatedPrice,
    actualPrice,
    quantity,
    vendor: "",
    paidByPartnerId: "",
    paidBy: "",
    purchased: actualPrice > 0,
    purchaseDate: "",
    notes: "",
    sourceLibraryItemId: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function defaultScenarios(): OpeningScenario[] {
  const fixedCosts = {
    Rent: 8000000,
    "Staff salary": 12000000,
    Electricity: 2500000,
    Water: 500000,
    Internet: 400000,
    Gas: 600000,
    Marketing: 2000000,
    Cleaning: 500000,
    Maintenance: 600000,
    Miscellaneous: 1000000,
  };
  const base = {
    beverageBuyerPercentage: 75,
    foodBuyerPercentage: 45,
    bothBuyerPercentage: 30,
    averageConsignmentPrice: 28000,
    averageOwnProductPrice: 25000,
    productMix: { ownBeverage: 45, ownFood: 25, consignment: 15, vendorRevenueShare: 10, buyout: 5 },
    marginAssumptions: { ownBeverage: 65, ownFood: 55, consignmentCafeShare: 30, vendorCafeShare: 35, buyout: 45 },
    fixedCosts,
    investmentSource: "estimated" as const,
  };
  return [
    { id: id(), name: "Conservative", customersPerDay: 30, operatingDaysPerMonth: 26, averageBeveragePrice: 22000, averageFoodPrice: 30000, selectedForPitch: false, ...base },
    { id: id(), name: "Realistic", customersPerDay: 50, operatingDaysPerMonth: 26, averageBeveragePrice: 25000, averageFoodPrice: 35000, selectedForPitch: true, ...base },
    { id: id(), name: "Optimistic", customersPerDay: 80, operatingDaysPerMonth: 26, averageBeveragePrice: 28000, averageFoodPrice: 40000, selectedForPitch: false, ...base },
  ];
}

export function makeStaffRole(position: string, headcount: number, baseSalary: number, employmentType: StaffRole["employmentType"] = "Full-time"): StaffRole {
  return {
    id: id(),
    position,
    employmentType,
    headcount,
    baseSalary,
    mealAllowance: employmentType === "Owner unpaid" ? 0 : 300000,
    transportAllowance: employmentType === "Owner unpaid" ? 0 : 250000,
    incentive: 0,
    benefit: employmentType === "Full-time" ? 250000 : 0,
    otherAllowance: 0,
    notes: "",
  };
}

export function defaultStaffPlan(): StaffPlan {
  const leanId = id();
  const standardId = id();
  return {
    id: id(),
    selectedScenario: standardId,
    scenarios: [
      {
        id: leanId,
        name: "Lean Team",
        selectedForPitch: false,
        roles: [
          makeStaffRole("Owner operator", 1, 0, "Owner unpaid"),
          makeStaffRole("Barista", 1, 3500000),
          makeStaffRole("Kitchen crew", 1, 3200000),
          makeStaffRole("Part-time staff", 1, 1500000, "Part-time"),
        ],
      },
      {
        id: standardId,
        name: "Standard Team",
        selectedForPitch: true,
        roles: [
          makeStaffRole("Store manager", 1, 5000000),
          makeStaffRole("Barista", 2, 3500000),
          makeStaffRole("Kitchen crew", 2, 3200000),
          makeStaffRole("Cashier", 1, 3200000),
        ],
      },
      {
        id: id(),
        name: "Full Team",
        selectedForPitch: false,
        roles: [
          makeStaffRole("Store manager", 1, 5500000),
          makeStaffRole("Head barista", 1, 4500000),
          makeStaffRole("Barista", 3, 3500000),
          makeStaffRole("Chef", 2, 4500000),
          makeStaffRole("Waiter / Server", 2, 3000000),
          makeStaffRole("Cleaning staff", 1, 2500000),
          makeStaffRole("Marketing / Content creator", 1, 3500000),
        ],
      },
    ],
  };
}

export function defaultRiskItems() {
  return [
    "Sewa terlalu tinggi",
    "Payroll terlalu tinggi",
    "Margin produk rendah",
    "Terlalu banyak produk konsinyasi/vendor",
    "Customer target terlalu tinggi",
    "Modal terlalu kecil",
    "Renovasi over budget",
    "Belum ada menu costing",
    "Belum ada SOP operasional",
    "Belum ada marketing plan",
    "Lokasi kurang traffic",
    "Kompetitor sekitar kuat",
    "Harga jual tidak sesuai target market",
    "Owner terlalu optimis terhadap omzet",
    "Cash flow bulan pertama belum aman",
    "Tidak ada dana cadangan",
    "Ketergantungan pada 1 produk utama",
    "Staff belum jelas",
    "Vendor belum pasti",
    "Pembagian profit belum jelas",
  ].map((title) => ({ id: id(), title, level: "Medium" as const, active: false, notes: "", recommendation: "", responsiblePerson: "", targetResolutionDate: "", status: "Open" as const, autoGenerated: false, checked: false }));
}

function menuItem(name: string, category: MenuMixItem["category"], source: MenuMixItem["source"], sellingPrice: number, estimatedCost: number, expectedSalesPerDay: number, isHeroProduct = false): MenuMixItem {
  const grossProfit = sellingPrice - estimatedCost;
  const grossMargin = sellingPrice ? (grossProfit / sellingPrice) * 100 : 0;
  return {
    id: id(),
    name,
    category,
    source,
    sellingPrice,
    estimatedCost,
    grossProfit,
    grossMargin,
    expectedSalesPerDay,
    monthlyRevenueEstimate: sellingPrice * expectedSalesPerDay * 26,
    monthlyGrossProfitEstimate: grossProfit * expectedSalesPerDay * 26,
    isHeroProduct,
    isHighMargin: grossMargin >= 55,
    notes: "",
  };
}

export function defaultMenuMixItems(): MenuMixItem[] {
  return [
    menuItem("Es Kopi Susu Signature", "Beverage", "Own product", 25000, 8500, 35, true),
    menuItem("Tea Series", "Beverage", "Own product", 22000, 6500, 20),
    menuItem("Manual Brew", "Beverage", "Own product", 30000, 11000, 8),
    menuItem("Toast Savory", "Food", "Own product", 32000, 16000, 12),
    menuItem("Dessert Cup Vendor", "Consignment", "Consignment", 30000, 21000, 9),
  ];
}

export function defaultCapitalBuffer(): CapitalBuffer {
  return { id: id(), baseType: "estimated", bufferPercentage: 10, bufferAmount: 0, totalRecommendedCapital: 0, reasons: ["Renovasi bisa membengkak", "Biaya promosi opening", "Emergency cash flow bulan pertama"], notes: "" };
}

export function defaultRiskChecklist(): RiskChecklist {
  return { id: id(), items: defaultRiskItems(), overallRiskStatus: "Moderate Risk", updatedAt: nowIso() };
}

export function defaultReadinessScore(): ReadinessScore {
  return { score: 0, status: "Draft", completedItems: [], missingItems: [], recommendation: "Project masih tahap draft. Lengkapi data utama seperti modal, staff, produk, dan proyeksi." };
}

export function createBlankProject(): Project {
  const now = new Date().toISOString();
  return {
    id: id(),
    createdAt: now,
    updatedAt: now,
    name: "Project Cafe Baru",
    cafeName: "Cafe Baru",
    businessType: "Cafe full service",
    projectStatus: "Baru mulai",
    placeStatus: "Sewa",
    locationNotes: "",
    targetOpeningDate: "",
    consultantNotes: "",
    health: "Draft",
    ownership: {
      mode: "Cafe sendiri",
      partners: [
        { id: id(), name: "Owner", role: "Owner", capitalContribution: 0, ownershipPercentage: 100, profitSharingPercentage: 100, decisionPowerPercentage: 100, fixedFee: 0, notes: "" },
      ],
      businessSchemes: [],
    },
    existingAssets: [],
    setupBudget: checklist.map(([name, category]) => makeSetupItem(name, category)),
    products: [],
    equipment: [],
    staffPlan: defaultStaffPlan(),
    monthlyProjection: { estimatedDailySales: 0, operatingDaysPerMonth: 26, productRevenueByCategory: {}, vendorIncome: 0, otherIncome: 0, costs: {}, useManualStaffSalary: false, manualStaffSalary: 0 },
    openingScenarios: defaultScenarios(),
    profitSharing: { mode: "Based on custom profit percentage", monthlyNetProfit: 0 },
    riskItems: defaultRiskItems(),
    menuMix: { beverageCount: 8, foodCount: 4, dessertSnackCount: 3, ownProductPercentage: 70, vendorConsignmentPercentage: 30, heroProductTarget: "", highMarginProducts: "", lowMarginProducts: "", notes: "" },
    menuMixPlan: { id: id(), items: defaultMenuMixItems(), notes: "", updatedAt: now },
    capitalBuffer: defaultCapitalBuffer(),
    riskChecklist: defaultRiskChecklist(),
    readinessScore: defaultReadinessScore(),
    openingBuffer: { percentage: 10 },
    summary: { strengths: "", risks: "", recommendation: "", nextAction: "", decisionStatus: "Draft" },
  };
}

export function demoProject(): Project {
  const project = createBlankProject();
  project.name = "Demo Cafe Kemitraan";
  project.cafeName = "Demo Cafe Kemitraan";
  project.businessType = "Beverage only";
  project.projectStatus = "Baru mulai";
  project.placeStatus = "Revenue sharing dengan pemilik tempat";
  project.locationNotes = "Area depan ruko partner lokasi, traffic sore kuat.";
  project.targetOpeningDate = "2026-08-01";
  project.consultantNotes = "Fokus opening kecil, menu beverage kuat, dessert konsinyasi sebagai pelengkap.";
  project.health = "Ready to pitch";
  project.ownership = {
    mode: "Hybrid",
    partners: [
      { id: id(), name: "Investor A", role: "Investor", capitalContribution: 120000000, ownershipPercentage: 55, profitSharingPercentage: 45, decisionPowerPercentage: 50, fixedFee: 0, notes: "Modal tunai untuk setup awal." },
      { id: id(), name: "Operator B", role: "Operational partner", capitalContribution: 0, ownershipPercentage: 20, profitSharingPercentage: 30, decisionPowerPercentage: 30, fixedFee: 4500000, notes: "Saham kosong untuk operasional, resep, dan manajemen harian." },
      { id: id(), name: "Pemilik Lokasi C", role: "Landlord partner", capitalContribution: 25000000, ownershipPercentage: 25, profitSharingPercentage: 25, decisionPowerPercentage: 20, fixedFee: 0, notes: "Kontribusi tempat dan sebagian aset." },
    ],
    businessSchemes: [
      { id: id(), type: "Saham kosong", personName: "Operator B", percentage: 20, amount: 0, notes: "Berlaku selama operator aktif memegang operasional." },
      { id: id(), type: "Modal masuk", personName: "Investor A", percentage: 55, amount: 120000000, notes: "Return lewat profit sharing bulanan." },
    ],
  };
  project.existingAssets = [
    { id: id(), name: "Meja bar existing", category: "Furniture", owner: "Pemilik Lokasi C", currentValue: 12000000, originalPrice: 20000000, condition: "Good", countedAsCapital: true, notes: "Masih layak pakai." },
    { id: id(), name: "AC 1 PK", category: "Electronics", owner: "Pemilik Lokasi C", currentValue: 6000000, originalPrice: 8500000, condition: "Good", countedAsCapital: true, notes: "" },
  ];
  project.setupBudget = [
    makeSetupItem("Renovasi ringan", "Place / Location", 30000000, 28000000),
    makeSetupItem("Signage / papan nama", "Place / Location", 8000000, 9000000),
    makeSetupItem("Coffee machine", "Equipment", 42000000, 41000000),
    makeSetupItem("Grinder", "Equipment", 12000000, 12000000),
    makeSetupItem("Showcase dessert", "Equipment", 14000000, 0),
    makeSetupItem("POS device", "Equipment", 6500000, 6500000),
    makeSetupItem("Initial stock beverage", "Initial Stock", 18000000, 15000000),
    makeSetupItem("Opening promo", "Operational", 6000000, 0),
    makeSetupItem("Contingency fund", "Operational", 10000000, 0),
  ];
  project.products = [
    { id: id(), name: "Es Kopi Susu Signature", type: "Own product", category: "Beverage", source: "Made in-house", sellingPrice: 25000, costPrice: 8500, vendorName: "", vendorSharePercentage: 0, cafeSharePercentage: 100, monthlyEstimatedSales: 900, paymentTerm: "-", notes: "Produk margin utama." },
    { id: id(), name: "Dessert Cup Vendor", type: "Consignment product", category: "Dessert", source: "Consignment", sellingPrice: 30000, costPrice: 0, vendorName: "Dapur Manis", vendorSharePercentage: 70, cafeSharePercentage: 30, monthlyEstimatedSales: 240, paymentTerm: "Weekly", notes: "Butuh showcase dingin." },
  ];
  project.equipment = [
    { id: id(), name: "Showcase Dessert", usedFor: "Dessert Cup Vendor", owner: "Vendor", type: "Showcase", powerWatt: 350, hoursPerDay: 14, daysPerMonth: 26, tariffPerKwh: 1700, paidBy: "Shared", cafePercentage: 50, vendorPercentage: 50, value: 14000000, notes: "Biaya listrik dibagi dua." },
  ];
  project.monthlyProjection = {
    estimatedDailySales: 1850000,
    operatingDaysPerMonth: 26,
    productRevenueByCategory: { Beverage: 22500000, Dessert: 7200000 },
    vendorIncome: 2160000,
    otherIncome: 0,
    useManualStaffSalary: false,
    manualStaffSalary: 0,
    costs: { "COGS food": 0, "COGS beverage": 9800000, Rent: 8000000, Electricity: 2500000, Water: 500000, Internet: 400000, Gas: 600000, Packaging: 1800000, Cleaning: 500000, Marketing: 2000000, Maintenance: 600000, Miscellaneous: 1000000 },
  };
  project.staffPlan = defaultStaffPlan();
  project.menuMix = { beverageCount: 10, foodCount: 3, dessertSnackCount: 4, ownProductPercentage: 70, vendorConsignmentPercentage: 30, heroProductTarget: "Es Kopi Susu Signature", highMarginProducts: "Es Kopi Susu Signature, Tea Series, Add-on syrup", lowMarginProducts: "Dessert Cup Vendor", notes: "Beverage sendiri jadi tulang punggung margin." };
  project.menuMixPlan = { id: id(), items: defaultMenuMixItems(), notes: "Beverage sendiri menjadi fokus margin utama, dessert vendor sebagai pelengkap display.", updatedAt: new Date().toISOString() };
  project.capitalBuffer = { ...defaultCapitalBuffer(), bufferPercentage: 10 };
  project.riskChecklist = defaultRiskChecklist();
  project.readinessScore = defaultReadinessScore();
  project.profitSharing = { mode: "Fixed management fee first, then profit share", monthlyNetProfit: 0 };
  project.summary = {
    strengths: "Konsep beverage sederhana, operator kuat, dan lokasi sudah punya aset awal.",
    risks: "Sewa dan payroll harus dikontrol saat opening awal.",
    recommendation: "Gunakan skenario Realistic untuk pitch, tapi jalankan budget opening dengan angka Conservative.",
    nextAction: "Finalisasi vendor dessert, layout operasional, dan opening promo.",
    decisionStatus: "Ready for investor",
  };
  return project;
}

export const seedData: AppData = {
  projects: [demoProject()],
  settings: defaultSettings,
};
