"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  Calculator,
  Copy,
  Download,
  Plus,
  Printer,
  Save,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  budgetDifference,
  calculateCapitalNeededWithBuffer,
  calculateCapitalBuffer as calculateProjectCapitalBuffer,
  calculateMenuItemGrossMargin,
  calculateMenuItemGrossProfit,
  calculateMenuMixSummary,
  calculateOverallRiskStatus,
  calculateOpeningBuffer,
  calculateOpeningScenarioResult,
  calculateReadinessScore,
  calculateStaffPlanResult,
  calculateStaffRoleCost,
  calculateTotalPayroll,
  cafeIncomePerProduct,
  equipmentElectricitySummary,
  existingAssetCapital,
  generateCapitalReadinessStatus,
  generateAutoRiskChecklist,
  generateBufferRecommendation,
  generateMenuMixRecommendations,
  generateRiskRecommendations,
  getProjectPayroll,
  monthlyElectricityCost,
  monthlyProductIncome,
  monthlyProjectionResult,
  productGrossMargin,
  productMarkup,
  profitSharing,
  projectInitialInvestment,
  safeDivide,
  sum,
  totalActualSpending,
  totalEstimatedSetupBudget,
} from "@/lib/calculations";
import { createBlankProject, demoProject, id, makeSetupItem, seedData } from "@/lib/seed";
import { loadData, saveData, touchProject } from "@/lib/storage";
import { AppData, ChecklistLibraryItem, Equipment, MasterCategory, MasterCategoryType, MenuMixItem, OpeningScenario, Partner, Product, Project, RiskItem, SetupBudgetItem, StaffRole, StaffScenario } from "@/lib/types";

type ModuleKey =
  | "dashboard"
  | "project"
  | "ownership"
  | "setup"
  | "products"
  | "equipment"
  | "staff"
  | "menuMix"
  | "capitalBuffer"
  | "riskChecklist"
  | "readiness"
  | "budget"
  | "projection"
  | "opening"
  | "sharing"
  | "summary"
  | "settings";

const modules: { key: ModuleKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "project", label: "Project Cafe" },
  { key: "ownership", label: "Kepemilikan" },
  { key: "setup", label: "Modal Awal" },
  { key: "products", label: "Produk & Vendor" },
  { key: "equipment", label: "Equipment & Listrik" },
  { key: "staff", label: "Staff Planning" },
  { key: "menuMix", label: "Menu Mix" },
  { key: "capitalBuffer", label: "Dana Cadangan" },
  { key: "riskChecklist", label: "Risk Checklist" },
  { key: "readiness", label: "Readiness Score" },
  { key: "budget", label: "Budget vs Actual" },
  { key: "projection", label: "Monthly Projection" },
  { key: "opening", label: "Balik Modal" },
  { key: "sharing", label: "Profit Sharing" },
  { key: "summary", label: "Pitch Page" },
  { key: "settings", label: "Settings" },
];

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

function money(value: number) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

function num(value: number) {
  return number.format(Number.isFinite(value) ? value : 0);
}

function activeCategories(settings: AppData["settings"], type: MasterCategoryType) {
  const categories = settings.masterCategories || [];
  return categories.filter((category) => category.active && (category.type === type || category.type === "all"));
}

function categoryName(settings: AppData["settings"], categoryId: string, fallback = "Other") {
  return settings.masterCategories?.find((category) => category.id === categoryId)?.name || fallback;
}

function setupCategoryName(categories: MasterCategory[], item: SetupBudgetItem) {
  return categories.find((category) => category.id === item.categoryId)?.name || item.category || "Other";
}

function now() {
  return new Date().toISOString();
}

function getProjectDisplayName(project?: Partial<Project> | null) {
  const explicitName = project?.name?.trim();
  const cafeBrandName = (project as Partial<Project> & { cafeBrandName?: string })?.cafeBrandName?.trim();
  const cafeName = project?.cafeName?.trim();
  return explicitName || cafeBrandName || cafeName || "Untitled Project";
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  helper,
  disabled = false,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  helper?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <input
        className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper ? <span className="text-xs leading-5 text-muted">{helper}</span> : null}
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <select className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function CategorySelect({ label = "Category", value, onChange, options }: { label?: string; value: string; onChange: (value: string) => void; options: string[] }) {
  const normalized = options.includes("Other") ? options : [...options, "Other"];
  return <Select label={label} value={normalized.includes(value) ? value : "Other"} onChange={onChange} options={normalized} />;
}

function MasterCategorySelect({ label = "Category", value, onChange, categories, disabled = false }: { label?: string; value: string; onChange: (value: string) => void; categories: MasterCategory[]; disabled?: boolean }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <select className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 disabled:bg-paper" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <textarea className="min-h-24 rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 disabled:bg-paper" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Card({ title, value, detail }: { title: string; value: string; detail?: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-muted">{detail}</p> : null}
    </div>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "border-line bg-paper text-muted",
        tone === "good" && "border-sage/30 bg-sage/10 text-sage",
        tone === "warn" && "border-saffron/40 bg-saffron/15 text-[#8a621d]",
        tone === "bad" && "border-clay/30 bg-clay/10 text-clay",
      )}
    >
      {children}
    </span>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-line bg-white/60 p-5 text-sm leading-6 text-muted">{children}</div>;
}

function copyProject(project: Project): Project {
  const now = new Date().toISOString();
  const displayName = getProjectDisplayName(project);
  return { ...structuredClone(project), id: id(), name: `${displayName} Copy`, cafeName: `${(project.cafeName || displayName).trim()} Copy`, createdAt: now, updatedAt: now, health: "Draft" };
}

function ConfirmDeleteModal({ projectName, onCancel, onConfirm }: { projectName: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft">
        <h3 className="text-lg font-bold">Hapus Project</h3>
        <p className="mt-2 text-sm leading-6 text-muted">Yakin ingin menghapus {projectName}? Data project akan hilang dari browser ini.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="h-10 rounded-md border border-line bg-white px-4 text-sm" onClick={onCancel}>Batal</button>
          <button className="h-10 rounded-md bg-clay px-4 text-sm font-medium text-white" onClick={onConfirm}>Hapus Project</button>
        </div>
      </div>
    </div>
  );
}

function ProjectManagerModal({ data, onClose, onSelect, onDuplicate, onDelete }: { data: AppData; onClose: () => void; onSelect: (id: string) => void; onDuplicate: (project: Project) => void; onDelete: (id: string) => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4">
      <div className="max-h-[86vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Kelola Project</h3>
          <button className="h-9 rounded-md border border-line px-3 text-sm" onClick={onClose}>Tutup</button>
        </div>
        <div className="mt-4 grid gap-3">
          {data.projects.map((project) => (
            <div key={project.id} className="grid gap-3 rounded-md border border-line p-3 md:grid-cols-[1fr_auto]">
              <button className="text-left" onClick={() => onSelect(project.id)}>
                <strong>{getProjectDisplayName(project)}</strong>
                <p className="text-sm text-muted">{project.health} · Last updated {new Date(project.updatedAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</p>
              </button>
              <div className="flex flex-wrap gap-2">
                <button className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => onDuplicate(project)}>Duplicate</button>
                <button className="h-9 rounded-md border border-line px-3 text-sm text-clay" onClick={() => onDelete(project.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyDashboard({ createProject, importBackupFile, resetDemo }: { createProject: () => void; importBackupFile: (file: File) => void; resetDemo: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-paper p-6">
      <div className="w-full max-w-xl rounded-lg border border-line bg-white p-6 text-center shadow-soft">
        <h1 className="text-2xl font-bold">Belum ada project cafe.</h1>
        <p className="mt-2 text-sm text-muted">Mulai project baru, import backup, atau load demo project.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button className="h-10 rounded-md bg-sage px-4 text-sm font-medium text-white" onClick={createProject}>Buat Project Baru</button>
          <label className="inline-flex h-10 cursor-pointer items-center rounded-md border border-line bg-white px-4 text-sm">
            Import Backup
            <input className="hidden" type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && importBackupFile(event.target.files[0])} />
          </label>
          <button className="h-10 rounded-md border border-line bg-white px-4 text-sm" onClick={resetDemo}>Load Demo Project</button>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  const [data, setData] = useState<AppData | null>(null);
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [selectedId, setSelectedId] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "unsaved">("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string>("");
  const [projectManagerOpen, setProjectManagerOpen] = useState(false);

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    setSelectedId(loaded.projects[0]?.id || "");
    setLastSavedAt(localStorage.getItem("fnb-consult-last-saved-at") || "");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!data || !hydrated) return;
    setSaveState("unsaved");
    const handle = window.setTimeout(() => {
      persistData(data);
    }, 700);
    return () => window.clearTimeout(handle);
  }, [data, hydrated]);

  const project = data?.projects.find((item) => item.id === selectedId) || data?.projects[0];

  const setProject = (next: Project) => {
    setData((current) => {
      if (!current) return current;
      const touched = touchProject(next);
      return { ...current, projects: current.projects.map((item) => (item.id === touched.id ? touched : item)) };
    });
  };

  const updateProject = <K extends keyof Project>(key: K, value: Project[K]) => {
    if (project) setProject({ ...project, [key]: value });
  };

  const persistData = (nextData: AppData) => {
    saveData(nextData);
    const savedAt = new Date().toISOString();
    localStorage.setItem("fnb-consult-last-saved-at", savedAt);
    setLastSavedAt(savedAt);
    setSaveState("saved");
  };

  const createProject = () => {
    const next = createBlankProject();
    setData((current) => current ? { ...current, projects: [next, ...current.projects] } : { ...seedData, projects: [next] });
    setSelectedId(next.id);
    setActive("project");
  };

  const duplicateProject = (target: Project) => {
    const next = copyProject(target);
    setData((current) => current ? { ...current, projects: [next, ...current.projects] } : current);
    setSelectedId(next.id);
  };

  const requestDeleteProject = (projectId: string) => {
    setPendingDeleteId(projectId);
  };

  const confirmDeleteProject = () => {
    if (!data || !pendingDeleteId) return;
    if (data.projects.length === 1) {
      const onlyProject = data.projects[0];
      if (onlyProject?.cafeName === "Demo Cafe Kemitraan") {
        window.alert("Demo project tidak bisa dihapus jika menjadi satu-satunya project. Buat atau import project lain dulu.");
        setPendingDeleteId("");
        return;
      }
    }
    const remaining = data.projects.filter((item) => item.id !== pendingDeleteId);
    const nextProjects = remaining.length ? remaining : [createBlankProject()];
    setData({ ...data, projects: nextProjects });
    setSelectedId(nextProjects[0]?.id || "");
    setActive(remaining.length ? active : "dashboard");
    setPendingDeleteId("");
  };

  const exportBackup = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fnb-consult-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importBackupFile = async (file: File) => {
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as AppData;
      if (!Array.isArray(parsed.projects) || !parsed.settings) {
        window.alert("Format backup tidak valid.");
        return;
      }
      if (!window.confirm("Import backup akan mengganti data saat ini. Lanjutkan?")) return;
      saveData(parsed);
      const migrated = loadData();
      setData(migrated);
      setSelectedId(migrated.projects[0]?.id || "");
      setActive("dashboard");
    } catch {
      window.alert("File backup tidak bisa dibaca. Pastikan formatnya JSON backup dari aplikasi ini.");
    }
  };

  const clearAllLocalData = () => {
    const typed = window.prompt("Ketik HAPUS untuk menghapus semua data lokal.");
    if (typed !== "HAPUS") return;
    localStorage.removeItem("fnb-consult-data-v1");
    localStorage.removeItem("fnb-consult-last-saved-at");
    const next = createBlankProject();
    setData({ ...seedData, projects: [next] });
    setSelectedId(next.id);
    setLastSavedAt("");
    setActive("dashboard");
  };

  const resetDemo = () => {
    if (!data) return;
    const demo = demoProject();
    const existing = data.projects.find((item) => item.cafeName === "Demo Cafe Kemitraan");
    if (existing) {
      const replace = window.confirm("Demo sudah ada. OK untuk replace demo, Cancel untuk buat salinan baru.");
      if (replace) {
        const projects = data.projects.map((item) => item.id === existing.id ? { ...demo, id: existing.id } : item);
        setData({ ...data, projects });
        setSelectedId(existing.id);
        return;
      }
    }
    const demoCopy = { ...demo, id: id() };
    setData({ ...data, projects: [demoCopy, ...data.projects] });
    setSelectedId(demoCopy.id);
  };

  if (!data) {
    return <main className="flex min-h-screen items-center justify-center bg-paper text-muted">Menyiapkan kalkulator...</main>;
  }

  if (!project) {
    return <EmptyDashboard createProject={createProject} importBackupFile={importBackupFile} resetDemo={resetDemo} />;
  }

  const estimatedSetup = totalEstimatedSetupBudget(project.setupBudget);
  const actualSetup = totalActualSpending(project.setupBudget);
  const mp = monthlyProjectionResult(project);
  const selectedScenario = project.openingScenarios.find((scenario) => scenario.selectedForPitch) || project.openingScenarios[0];
  const selectedScenarioResult = calculateOpeningScenarioResult(selectedScenario, projectInitialInvestment(project, selectedScenario.investmentSource), getProjectPayroll(project));

  return (
    <main className="min-h-screen bg-paper">
      <aside className="no-print fixed inset-y-0 left-0 hidden h-screen w-72 flex-col border-r border-line bg-[#fbfaf6] p-4 lg:flex">
        <div className="mb-4 flex shrink-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-sage text-white">
            <Calculator size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-5">F&B Business Consultant Calculator</h1>
            <p className="text-xs text-muted">Local-first MVP</p>
          </div>
        </div>
        <select className="mb-4 h-10 w-full shrink-0 rounded-md border border-line bg-white px-3 text-sm" value={project.id} onChange={(event) => {
          if (event.target.value === "__new__") return createProject();
          if (event.target.value === "__manage__") return setProjectManagerOpen(true);
          setSelectedId(event.target.value);
        }}>
          {data.projects.map((item) => (
            <option key={item.id} value={item.id}>
              {getProjectDisplayName(item)}
            </option>
          ))}
          <option value="__new__">+ Buat Project Baru</option>
          <option value="__manage__">Kelola Project</option>
        </select>
        <nav className="grid flex-1 gap-1 overflow-y-auto pb-8 pr-1">
          {modules.map((module) => (
            <button key={module.key} onClick={() => setActive(module.key)} className={cn("rounded-md px-3 py-2 text-left text-sm transition", active === module.key ? "bg-ink text-white" : "text-muted hover:bg-white hover:text-ink")}>
              {module.label}
            </button>
          ))}
        </nav>
        <button
          className="mt-4 inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-md bg-sage px-3 text-sm font-medium text-white"
          onClick={createProject}
        >
          <Plus size={16} /> Project baru
        </button>
      </aside>

      <section className="lg:pl-72">
        <header className="no-print sticky top-0 z-10 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Project aktif</p>
              <h2 className="text-xl font-bold">{getProjectDisplayName(project)}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="grid content-center text-right text-xs text-muted">
                <span>{saveState === "saved" ? "Saved locally" : "Unsaved changes"}</span>
                <span>{lastSavedAt ? `Last saved: ${new Date(lastSavedAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}` : "Belum pernah disimpan"}</span>
              </div>
              <select className="h-10 rounded-md border border-line bg-white px-3 text-sm lg:hidden" value={project.id} onChange={(event) => {
                if (event.target.value === "__new__") return createProject();
                if (event.target.value === "__manage__") return setProjectManagerOpen(true);
                setSelectedId(event.target.value);
              }}>
                {data.projects.map((item) => <option key={item.id} value={item.id}>{getProjectDisplayName(item)}</option>)}
                <option value="__new__">+ Buat Project Baru</option>
                <option value="__manage__">Kelola Project</option>
              </select>
              <select className="h-10 rounded-md border border-line bg-white px-3 text-sm lg:hidden" value={active} onChange={(event) => setActive(event.target.value as ModuleKey)}>
                {modules.map((module) => (
                  <option key={module.key} value={module.key}>
                    {module.label}
                  </option>
                ))}
              </select>
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm" onClick={() => window.print()}>
                <Printer size={16} /> Print / PDF
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-white" onClick={() => persistData(data)}>
                <Save size={16} /> Save
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 lg:px-8">
          {active === "dashboard" && <Dashboard data={data} selectedId={selectedId} setSelectedId={setSelectedId} setActive={setActive} resetDemo={resetDemo} createProject={createProject} duplicateProject={duplicateProject} requestDeleteProject={requestDeleteProject} importBackupFile={importBackupFile} />}
          {active === "project" && <ProjectBasics project={project} updateProject={updateProject} requestDeleteProject={requestDeleteProject} duplicateProject={duplicateProject} />}
          {active === "ownership" && <Ownership project={project} setProject={setProject} />}
          {active === "setup" && <SetupBudget project={project} setProject={setProject} settings={data.settings} />}
          {active === "products" && <Products project={project} setProject={setProject} categories={activeCategories(data.settings, "product").map((category) => category.name)} />}
          {active === "equipment" && <EquipmentPage project={project} setProject={setProject} categories={activeCategories(data.settings, "equipment").map((category) => category.name)} tariff={data.settings.defaultElectricityTariff} />}
          {active === "staff" && <StaffPlanning project={project} setProject={setProject} staffCategories={activeCategories(data.settings, "staff").map((category) => category.name)} />}
          {active === "menuMix" && <MenuMixPage project={project} setProject={setProject} />}
          {active === "capitalBuffer" && <CapitalBufferPage project={project} setProject={setProject} />}
          {active === "riskChecklist" && <RiskChecklistPage project={project} setProject={setProject} />}
          {active === "readiness" && <ReadinessPage project={project} />}
          {active === "budget" && <BudgetVsActual project={project} />}
          {active === "projection" && <Projection project={project} setProject={setProject} categories={activeCategories(data.settings, "expense").map((category) => category.name)} />}
          {active === "opening" && <OpeningScenarioPage project={project} setProject={setProject} />}
          {active === "sharing" && <ProfitSharingPage project={project} setProject={setProject} />}
          {active === "summary" && <SummaryPage project={project} setProject={setProject} settings={data.settings} result={selectedScenarioResult} scenario={selectedScenario} onDuplicate={() => {
            const next = copyProject(project);
            setData({ ...data, projects: [next, ...data.projects] });
            setSelectedId(next.id);
          }} />}
          {active === "settings" && (
            <SettingsPage
              data={data}
              setData={setData}
              resetDemo={resetDemo}
              selectedId={selectedId}
              createProject={createProject}
              exportBackup={exportBackup}
              importBackupFile={importBackupFile}
              clearAllLocalData={clearAllLocalData}
            />
          )}
        </div>
      </section>
      {pendingDeleteId && (
        <ConfirmDeleteModal
          projectName={getProjectDisplayName(data.projects.find((item) => item.id === pendingDeleteId))}
          onCancel={() => setPendingDeleteId("")}
          onConfirm={confirmDeleteProject}
        />
      )}
      {projectManagerOpen && (
        <ProjectManagerModal
          data={data}
          onClose={() => setProjectManagerOpen(false)}
          onSelect={(idValue) => { setSelectedId(idValue); setProjectManagerOpen(false); }}
          onDuplicate={duplicateProject}
          onDelete={requestDeleteProject}
        />
      )}
    </main>
  );
}

function Dashboard({ data, selectedId, setSelectedId, setActive, resetDemo, createProject, duplicateProject, requestDeleteProject, importBackupFile }: { data: AppData; selectedId: string; setSelectedId: (id: string) => void; setActive: (key: ModuleKey) => void; resetDemo: () => void; createProject: () => void; duplicateProject: (project: Project) => void; requestDeleteProject: (id: string) => void; importBackupFile: (file: File) => void }) {
  if (!data.projects.length) return <EmptyDashboard createProject={createProject} importBackupFile={importBackupFile} resetDemo={resetDemo} />;
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Project</h2>
          <p className="text-sm text-muted">Semua kartu memakai data project yang tersimpan di browser perangkat ini.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-sage px-3 text-sm font-medium text-white" onClick={createProject}>
            <Plus size={16} /> Buat Project
          </button>
          <button className="h-10 rounded-md border border-line bg-white px-3 text-sm" onClick={resetDemo}>Reset demo</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.projects.map((project) => {
          const mp = monthlyProjectionResult(project);
          const readiness = calculateReadinessScore(project);
          return (
            <div key={project.id} className={cn("rounded-lg border bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5", selectedId === project.id ? "border-sage ring-2 ring-sage/20" : "border-line")}>
              <div className="flex items-start justify-between gap-3">
                <button className="text-left" onClick={() => { setSelectedId(project.id); setActive("summary"); }}>
                  <h3 className="text-lg font-bold">{getProjectDisplayName(project)}</h3>
                  <p className="text-sm text-muted">{project.businessType} · {project.projectStatus}</p>
                </button>
                <Badge tone={project.health === "Ready to pitch" || project.health === "Opened" ? "good" : project.health === "Needs review" ? "bad" : "warn"}>{project.health}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <span className="text-muted">Estimasi modal</span><strong>{money(totalEstimatedSetupBudget(project.setupBudget))}</strong>
                <span className="text-muted">Actual spending</span><strong>{money(totalActualSpending(project.setupBudget))}</strong>
                <span className="text-muted">Biaya bulanan</span><strong>{money(mp.operatingCost)}</strong>
                <span className="text-muted">Net profit</span><strong>{money(mp.netProfit)}</strong>
                <span className="text-muted">Readiness</span><strong>{num(readiness.score)}% · {readiness.status}</strong>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="h-9 rounded-md bg-ink px-3 text-sm font-medium text-white" onClick={() => { setSelectedId(project.id); setActive("project"); }}>Open project</button>
                <button className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => duplicateProject(project)}>Duplicate</button>
                <button className="h-9 rounded-md border border-line px-3 text-sm text-clay" onClick={() => requestDeleteProject(project.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectBasics({ project, updateProject, requestDeleteProject, duplicateProject }: { project: Project; updateProject: <K extends keyof Project>(key: K, value: Project[K]) => void; requestDeleteProject: (id: string) => void; duplicateProject: (project: Project) => void }) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Buat / Edit Project Cafe</h2>
        <div className="flex gap-2">
          <button className="h-10 rounded-md border border-line bg-white px-3 text-sm" onClick={() => duplicateProject(project)}>Duplicate project</button>
          <button className="h-10 rounded-md border border-line bg-white px-3 text-sm text-clay" onClick={() => requestDeleteProject(project.id)}>Hapus Project</button>
        </div>
      </div>
      <div className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft md:grid-cols-2">
        <Input label="Project name" value={project.name} onChange={(value) => updateProject("name", value)} />
        <Input label="Cafe / brand name" value={project.cafeName} onChange={(value) => updateProject("cafeName", value)} />
        <Select label="Business type" value={project.businessType} onChange={(value) => updateProject("businessType", value)} options={["Cafe full service", "Beverage only", "Food and Beverage", "Dessert shop", "Cloud kitchen", "Booth / tenant", "Other"]} />
        <Select label="Project status" value={project.projectStatus} onChange={(value) => updateProject("projectStatus", value)} options={["Baru mulai", "Sudah berjalan", "Take over usaha lama", "Rebranding / renovasi"]} />
        <Select label="Place status" value={project.placeStatus} onChange={(value) => updateProject("placeStatus", value)} options={["Tempat sendiri", "Sewa", "Revenue sharing dengan pemilik tempat", "Tenant / booth", "Partnership location"]} />
        <Input label="Target opening date" type="date" value={project.targetOpeningDate} onChange={(value) => updateProject("targetOpeningDate", value)} />
        <Select label="Project health" value={project.health} onChange={(value) => updateProject("health", value as Project["health"])} options={["Draft", "In progress", "Ready to pitch", "Opened", "Needs review"]} />
        <TextArea label="Location notes" value={project.locationNotes} onChange={(value) => updateProject("locationNotes", value)} />
        <TextArea label="Consultant notes" value={project.consultantNotes} onChange={(value) => updateProject("consultantNotes", value)} />
      </div>
    </div>
  );
}

function Ownership({ project, setProject }: { project: Project; setProject: (project: Project) => void }) {
  const partners = project.ownership.partners;
  const totalOwnership = sum(partners.map((partner) => partner.ownershipPercentage));
  const totalProfit = sum(partners.map((partner) => partner.profitSharingPercentage));
  const updatePartner = (index: number, patch: Partial<Partner>) => {
    const next = partners.map((partner, partnerIndex) => (partnerIndex === index ? { ...partner, ...patch } : partner));
    setProject({ ...project, ownership: { ...project.ownership, partners: next } });
  };
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-bold">Struktur Kepemilikan & Investor</h2>
        <p className="text-sm text-muted">Saham kosong berarti bagian kepemilikan atau profit untuk kontribusi non-tunai seperti skill, lokasi, brand, atau operasional.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Card title="Total ownership" value={`${num(totalOwnership)}%`} detail={totalOwnership === 100 ? "Sudah pas 100%" : "Perlu disesuaikan ke 100%"} />
        <Card title="Total profit share" value={`${num(totalProfit)}%`} detail={totalProfit === 100 ? "Sudah pas 100%" : "Profit share boleh beda dari ownership, tapi total sebaiknya 100%"} />
        <Card title="Total modal tunai" value={money(sum(partners.map((partner) => partner.capitalContribution)))} />
      </div>
      {(totalOwnership !== 100 || totalProfit !== 100) && <EmptyHint>Warning: total ownership atau profit sharing belum 100%. App tetap menyimpan data, tapi angka ini perlu dirapikan sebelum pitch.</EmptyHint>}
      <Select label="Ownership mode" value={project.ownership.mode} onChange={(value) => setProject({ ...project, ownership: { ...project.ownership, mode: value as Project["ownership"]["mode"] } })} options={["Cafe sendiri", "Equal ownership", "Custom percentage", "Based on capital contribution", "Hybrid"]} />
      <div className="grid gap-3">
        {partners.map((partner, index) => (
          <div key={partner.id} className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-soft md:grid-cols-4">
            <Input label="Name" value={partner.name} onChange={(value) => updatePartner(index, { name: value })} />
            <Select label="Role" value={partner.role} onChange={(value) => updatePartner(index, { role: value as Partner["role"] })} options={["Owner", "Investor", "Operational partner", "Landlord partner", "Brand owner", "Silent investor"]} />
            <Input label="Capital contribution" type="number" value={partner.capitalContribution} onChange={(value) => updatePartner(index, { capitalContribution: Number(value) })} />
            <Input label="Ownership %" type="number" value={partner.ownershipPercentage} onChange={(value) => updatePartner(index, { ownershipPercentage: Number(value) })} />
            <Input label="Profit share %" type="number" value={partner.profitSharingPercentage} onChange={(value) => updatePartner(index, { profitSharingPercentage: Number(value) })} />
            <Input label="Decision power %" type="number" value={partner.decisionPowerPercentage} onChange={(value) => updatePartner(index, { decisionPowerPercentage: Number(value) })} />
            <Input label="Fixed fee / salary" type="number" value={partner.fixedFee} onChange={(value) => updatePartner(index, { fixedFee: Number(value) })} />
            <Input label="Notes" value={partner.notes} onChange={(value) => updatePartner(index, { notes: value })} />
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line text-sm text-clay md:col-span-4" onClick={() => setProject({ ...project, ownership: { ...project.ownership, partners: partners.filter((item) => item.id !== partner.id) } })}>
              <Trash2 size={16} /> Hapus partner
            </button>
          </div>
        ))}
      </div>
      <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-sage px-3 text-sm font-medium text-white" onClick={() => setProject({ ...project, ownership: { ...project.ownership, partners: [...partners, { id: id(), name: "Partner baru", role: "Investor", capitalContribution: 0, ownershipPercentage: 0, profitSharingPercentage: 0, decisionPowerPercentage: 0, fixedFee: 0, notes: "" }] } })}>
        <Plus size={16} /> Tambah partner
      </button>
    </div>
  );
}

function SetupBudget({ project, setProject, settings }: { project: Project; setProject: (project: Project) => void; settings: AppData["settings"] }) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryCategory, setLibraryCategory] = useState("all");
  const [selectedLibraryItems, setSelectedLibraryItems] = useState<string[]>([]);
  const categories = activeCategories(settings, "setup_budget");
  const otherCategory = categories.find((category) => category.name === "Other") || categories[0];
  const requiredNotPurchased = project.setupBudget.filter((item) => item.required && !item.purchased).length;
  const overBudgetAmount = sum(project.setupBudget.map((item) => Math.max(0, item.actualPrice * Math.max(1, item.quantity) - item.estimatedPrice * Math.max(1, item.quantity))));
  const underBudgetAmount = sum(project.setupBudget.map((item) => (item.actualPrice > 0 ? Math.max(0, item.estimatedPrice * Math.max(1, item.quantity) - item.actualPrice * Math.max(1, item.quantity)) : 0)));
  const completion = safeDivide(project.setupBudget.filter((item) => item.purchased).length, project.setupBudget.length) * 100;
  const updateItem = (index: number, patch: Partial<SetupBudgetItem>) => setProject({ ...project, setupBudget: project.setupBudget.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch, updatedAt: now() } : item)) });
  const blankItem = (): SetupBudgetItem => ({ ...makeSetupItem("Item baru", otherCategory?.name || "Other"), categoryId: otherCategory?.id || "", category: otherCategory?.name || "Other", createdAt: now(), updatedAt: now() });
  const setupFromLibrary = (item: ChecklistLibraryItem): SetupBudgetItem => ({
    ...makeSetupItem(item.name, categoryName(settings, item.categoryId), item.defaultEstimatedPrice, 0, item.defaultQuantity),
    categoryId: item.categoryId,
    category: categoryName(settings, item.categoryId),
    required: item.required,
    sourceLibraryItemId: item.id,
    notes: item.notes,
    createdAt: now(),
    updatedAt: now(),
  });
  const addLibraryItems = (idsToAdd: string[]) => {
    const selected = settings.defaultChecklistItems.filter((item) => idsToAdd.includes(item.id) && item.active);
    const duplicates = selected.filter((item) => project.setupBudget.some((budget) => budget.sourceLibraryItemId === item.id || budget.name.toLowerCase() === item.name.toLowerCase()));
    if (duplicates.length && !window.confirm(`${duplicates.length} item sudah ada di project. Tetap tambahkan duplikat?`)) {
      const duplicateIds = new Set(duplicates.map((item) => item.id));
      setProject({ ...project, setupBudget: [...project.setupBudget, ...selected.filter((item) => !duplicateIds.has(item.id)).map(setupFromLibrary)] });
    } else {
      setProject({ ...project, setupBudget: [...project.setupBudget, ...selected.map(setupFromLibrary)] });
    }
    setSelectedLibraryItems([]);
    setLibraryOpen(false);
  };
  const filteredLibrary = settings.defaultChecklistItems.filter((item) => {
    const matchesCategory = libraryCategory === "all" || item.categoryId === libraryCategory;
    const matchesSearch = item.name.toLowerCase().includes(librarySearch.toLowerCase());
    return item.active && matchesCategory && matchesSearch;
  });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Modal Awal & Pengadaan</h2>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Card title="Estimated total" value={money(totalEstimatedSetupBudget(project.setupBudget))} />
        <Card title="Actual total" value={money(totalActualSpending(project.setupBudget))} />
        <Card title="Selisih" value={money(budgetDifference(project.setupBudget))} />
        <Card title="Belum dibeli" value={`${requiredNotPurchased} item`} />
        <Card title="Over budget" value={money(overBudgetAmount)} />
        <Card title="Completion" value={`${num(completion)}%`} detail={`Under budget ${money(underBudgetAmount)}`} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-sage px-3 text-sm font-medium text-white" onClick={() => setProject({ ...project, setupBudget: [...project.setupBudget, blankItem()] })}>
          <Plus size={16} /> Tambah item manual
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm" onClick={() => setLibraryOpen(true)}>
          <Plus size={16} /> Tambah dari Checklist Library
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm" onClick={() => addLibraryItems(settings.defaultChecklistItems.filter((item) => item.required && item.active).map((item) => item.id))}>
          Tambahkan semua required items
        </button>
      </div>
      {libraryOpen && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/30 p-4">
          <div className="max-h-[86vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Tambah dari Checklist Library</h3>
                <p className="text-sm text-muted">Pilih item library untuk dimasukkan ke project ini.</p>
              </div>
              <button className="h-9 rounded-md border border-line px-3 text-sm" onClick={() => setLibraryOpen(false)}>Tutup</button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input label="Search item" value={librarySearch} onChange={setLibrarySearch} />
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium text-ink">Filter category</span>
                <select className="h-10 rounded-md border border-line bg-white px-3 text-sm" value={libraryCategory} onChange={(event) => setLibraryCategory(event.target.value)}>
                  <option value="all">Semua kategori</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-4 grid gap-2">
              {filteredLibrary.map((item) => (
                <label key={item.id} className="grid gap-2 rounded-md border border-line p-3 text-sm md:grid-cols-[auto_1fr_auto_auto]">
                  <input type="checkbox" checked={selectedLibraryItems.includes(item.id)} onChange={(event) => setSelectedLibraryItems(event.target.checked ? [...selectedLibraryItems, item.id] : selectedLibraryItems.filter((idValue) => idValue !== item.id))} />
                  <span><strong>{item.name}</strong><br /><span className="text-muted">{categoryName(settings, item.categoryId)} · Qty {item.defaultQuantity} · {money(item.defaultEstimatedPrice)}</span></span>
                  <Badge tone={item.required ? "warn" : "neutral"}>{item.required ? "Required" : "Optional"}</Badge>
                  <Badge tone={project.setupBudget.some((budget) => budget.sourceLibraryItemId === item.id || budget.name.toLowerCase() === item.name.toLowerCase()) ? "bad" : "good"}>{project.setupBudget.some((budget) => budget.sourceLibraryItemId === item.id || budget.name.toLowerCase() === item.name.toLowerCase()) ? "Sudah ada" : "Baru"}</Badge>
                </label>
              ))}
            </div>
            <button className="mt-4 h-10 rounded-md bg-ink px-4 text-sm font-medium text-white" onClick={() => addLibraryItems(selectedLibraryItems)} disabled={!selectedLibraryItems.length}>Tambahkan item terpilih ke project</button>
          </div>
        </div>
      )}
      <div className="grid gap-3">
        {project.setupBudget.map((item, index) => (
          <div key={item.id} className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-soft md:grid-cols-6">
            <div className="md:col-span-6"><SetupStatusBadge item={item} /></div>
            <Input label="Item" value={item.name} onChange={(value) => updateItem(index, { name: value })} />
            <MasterCategorySelect value={item.categoryId || otherCategory?.id || ""} onChange={(value) => updateItem(index, { categoryId: value, category: categoryName(settings, value) })} categories={categories} />
            <Input label="Estimated price" type="number" value={item.estimatedPrice} onChange={(value) => updateItem(index, { estimatedPrice: Number(value) })} />
            <Input label="Actual price" type="number" value={item.actualPrice} onChange={(value) => updateItem(index, { actualPrice: Number(value), purchased: Number(value) > 0 })} />
            <Input label="Qty" type="number" value={item.quantity} onChange={(value) => updateItem(index, { quantity: Number(value) })} />
            <Input label="Vendor" value={item.vendor} onChange={(value) => updateItem(index, { vendor: value })} />
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ink">Paid by</span>
              <select className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20" value={item.paidByPartnerId || ""} onChange={(event) => updateItem(index, { paidByPartnerId: event.target.value, paidBy: project.ownership.partners.find((partner) => partner.id === event.target.value)?.name || "" })}>
                <option value="">Belum dipilih</option>
                {project.ownership.partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
              </select>
            </label>
            <Input label="Purchase date" type="date" value={item.purchaseDate} onChange={(value) => updateItem(index, { purchaseDate: value })} />
            <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={item.required} onChange={(event) => updateItem(index, { required: event.target.checked })} /> Required</label>
            <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={item.purchased} onChange={(event) => updateItem(index, { purchased: event.target.checked })} /> Sudah dibeli</label>
            <TextArea label="Notes" value={item.notes} onChange={(value) => updateItem(index, { notes: value })} />
            <button className="h-10 rounded-md border border-line text-sm text-clay md:col-span-6" onClick={() => setProject({ ...project, setupBudget: project.setupBudget.filter((row) => row.id !== item.id) })}>Hapus item</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetupStatusBadge({ item }: { item: SetupBudgetItem }) {
  if (!item.required) return <Badge tone="neutral">Optional</Badge>;
  if (!item.purchased) return <Badge tone="warn">Belum dibeli</Badge>;
  const estimated = item.estimatedPrice * Math.max(1, item.quantity);
  const actual = item.actualPrice * Math.max(1, item.quantity);
  if (actual > estimated) return <Badge tone="bad">Over budget</Badge>;
  if (actual < estimated) return <Badge tone="good">Under budget</Badge>;
  return <Badge tone="good">On budget</Badge>;
}

function Products({ project, setProject, categories }: { project: Project; setProject: (project: Project) => void; categories: string[] }) {
  const updateProduct = (index: number, patch: Partial<Product>) => setProject({ ...project, products: project.products.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Produk & Vendor System</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <Card title="Cafe income per bulan" value={money(sum(project.products.map(monthlyProductIncome)))} />
        <Card title="Produk sendiri" value={`${project.products.filter((item) => item.type === "Own product").length} item`} />
        <Card title="Vendor / konsinyasi" value={`${project.products.filter((item) => item.type !== "Own product").length} item`} />
      </div>
      {project.products.map((product, index) => (
        <div key={product.id} className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-soft md:grid-cols-5">
          <Input label="Product name" value={product.name} onChange={(value) => updateProduct(index, { name: value })} />
          <Select label="Type" value={product.type} onChange={(value) => updateProduct(index, { type: value as Product["type"] })} options={["Own product", "Vendor product", "Consignment product", "Beli putus", "Bagi hasil", "Tenant product", "Dropship / external product"]} />
          <CategorySelect value={product.category} onChange={(value) => updateProduct(index, { category: value })} options={categories} />
          <Input label="Selling price" type="number" value={product.sellingPrice} onChange={(value) => updateProduct(index, { sellingPrice: Number(value) })} />
          <Input label="Cost price" type="number" value={product.costPrice} onChange={(value) => updateProduct(index, { costPrice: Number(value) })} />
          <Input label="Vendor name" value={product.vendorName} onChange={(value) => updateProduct(index, { vendorName: value })} />
          <Input label="Cafe share %" type="number" value={product.cafeSharePercentage} onChange={(value) => updateProduct(index, { cafeSharePercentage: Number(value), vendorSharePercentage: 100 - Number(value) })} />
          <Input label="Vendor share %" type="number" value={product.vendorSharePercentage} onChange={(value) => updateProduct(index, { vendorSharePercentage: Number(value) })} />
          <Input label="Monthly sales qty" type="number" value={product.monthlyEstimatedSales} onChange={(value) => updateProduct(index, { monthlyEstimatedSales: Number(value) })} />
          <Input label="Payment term" value={product.paymentTerm} onChange={(value) => updateProduct(index, { paymentTerm: value })} />
          {product.category === "Other" && <Input label="Notes untuk kategori Other" value={product.notes} onChange={(value) => updateProduct(index, { notes: value })} />}
          <div className="rounded-md bg-paper p-3 text-sm md:col-span-5">
            Margin: <strong>{num(productGrossMargin(product))}%</strong> · Markup: <strong>{num(productMarkup(product))}%</strong> · Cafe income/item: <strong>{money(cafeIncomePerProduct(product))}</strong> · Est. income/month: <strong>{money(monthlyProductIncome(product))}</strong>
          </div>
          <button className="h-10 rounded-md border border-line text-sm text-clay md:col-span-5" onClick={() => setProject({ ...project, products: project.products.filter((row) => row.id !== product.id) })}>Hapus produk</button>
        </div>
      ))}
      <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-sage px-3 text-sm font-medium text-white" onClick={() => setProject({ ...project, products: [...project.products, { id: id(), name: "Produk baru", type: "Own product", category: "Beverage", source: "Made in-house", sellingPrice: 0, costPrice: 0, vendorName: "", vendorSharePercentage: 0, cafeSharePercentage: 100, monthlyEstimatedSales: 0, paymentTerm: "", notes: "" }] })}>
        <Plus size={16} /> Tambah produk
      </button>
    </div>
  );
}

function EquipmentPage({ project, setProject, categories, tariff }: { project: Project; setProject: (project: Project) => void; categories: string[]; tariff: number }) {
  const summary = equipmentElectricitySummary(project.equipment);
  const updateEquipment = (index: number, patch: Partial<Equipment>) => setProject({ ...project, equipment: project.equipment.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)) });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Equipment & Electricity Calculator</h2>
      <div className="grid gap-3 md:grid-cols-4">
        <Card title="Total kWh / bulan" value={`${num(summary.kwh)} kWh`} />
        <Card title="Total listrik" value={money(summary.totalCost)} />
        <Card title="Tanggung jawab cafe" value={money(summary.cafeCost)} />
        <Card title="Tanggung jawab vendor" value={money(summary.vendorCost)} />
      </div>
      {project.equipment.map((item, index) => (
        <div key={item.id} className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-soft md:grid-cols-5">
          <Input label="Equipment name" value={item.name} onChange={(value) => updateEquipment(index, { name: value })} />
          <Input label="Used for product/vendor" value={item.usedFor} onChange={(value) => updateEquipment(index, { usedFor: value })} />
          <Select label="Owner" value={item.owner} onChange={(value) => updateEquipment(index, { owner: value as Equipment["owner"] })} options={["Cafe", "Vendor", "Shared"]} />
          <CategorySelect label="Equipment type" value={item.type} onChange={(value) => updateEquipment(index, { type: value })} options={categories} />
          <Input label="Power watt" type="number" value={item.powerWatt} onChange={(value) => updateEquipment(index, { powerWatt: Number(value) })} />
          <Input label="Hours / day" type="number" value={item.hoursPerDay} onChange={(value) => updateEquipment(index, { hoursPerDay: Number(value) })} />
          <Input label="Days / month" type="number" value={item.daysPerMonth} onChange={(value) => updateEquipment(index, { daysPerMonth: Number(value) })} />
          <Input label="Tariff / kWh" type="number" value={item.tariffPerKwh} onChange={(value) => updateEquipment(index, { tariffPerKwh: Number(value) })} />
          <Select label="Who pays electricity" value={item.paidBy} onChange={(value) => updateEquipment(index, { paidBy: value as Equipment["paidBy"] })} options={["Cafe", "Vendor", "Shared"]} />
          <Input label="Cafe share %" type="number" value={item.cafePercentage} onChange={(value) => updateEquipment(index, { cafePercentage: Number(value), vendorPercentage: 100 - Number(value) })} />
          {item.type === "Other" && <Input label="Notes untuk kategori Other" value={item.notes} onChange={(value) => updateEquipment(index, { notes: value })} />}
          <div className="rounded-md bg-paper p-3 text-sm md:col-span-5">Monthly electricity cost: <strong>{money(monthlyElectricityCost(item))}</strong></div>
          <button className="h-10 rounded-md border border-line text-sm text-clay md:col-span-5" onClick={() => setProject({ ...project, equipment: project.equipment.filter((row) => row.id !== item.id) })}>Hapus equipment</button>
        </div>
      ))}
      <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-sage px-3 text-sm font-medium text-white" onClick={() => setProject({ ...project, equipment: [...project.equipment, { id: id(), name: "Equipment baru", usedFor: "", owner: "Cafe", type: "Other", powerWatt: 0, hoursPerDay: 8, daysPerMonth: 26, tariffPerKwh: tariff, paidBy: "Cafe", cafePercentage: 100, vendorPercentage: 0, value: 0, notes: "" }] })}>
        <Plus size={16} /> Tambah equipment
      </button>
    </div>
  );
}

function StaffPlanning({ project, setProject, staffCategories }: { project: Project; setProject: (project: Project) => void; staffCategories: string[] }) {
  const [tab, setTab] = useState(project.staffPlan.selectedScenario || project.staffPlan.scenarios[0]?.id);
  const scenario = project.staffPlan.scenarios.find((item) => item.id === tab) || project.staffPlan.scenarios[0];
  const result = calculateStaffPlanResult({ ...project, staffPlan: { ...project.staffPlan, selectedScenario: scenario.id } });
  const updateScenario = (patch: Partial<StaffScenario>) => setProject({ ...project, staffPlan: { ...project.staffPlan, selectedScenario: scenario.id, scenarios: project.staffPlan.scenarios.map((item) => (item.id === scenario.id ? { ...item, ...patch } : item)) } });
  const updateRole = (index: number, patch: Partial<StaffRole>) => updateScenario({ roles: scenario.roles.map((role, roleIndex) => (roleIndex === index ? { ...role, ...patch } : role)) });
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-bold">Staff Planning & Payroll Estimate</h2>
        <p className="text-sm text-muted">Simulator kebutuhan staff dan biaya payroll bulanan untuk feasibility dan pitch.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {project.staffPlan.scenarios.map((item) => (
          <button key={item.id} className={cn("h-10 rounded-md border px-4 text-sm", item.id === scenario.id ? "border-ink bg-ink text-white" : "border-line bg-white")} onClick={() => setTab(item.id)}>
            {item.name}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Card title="Total jumlah staff" value={`${num(result.totalHeadcount)} orang`} />
        <Card title="Total gaji pokok" value={money(result.totalBaseSalary)} />
        <Card title="Total allowance" value={money(result.totalAllowance)} />
        <Card title="Payroll per bulan" value={money(result.totalPayroll)} />
        <Card title="% dari omzet" value={`${num(result.payrollRevenueRatio)}%`} />
        <Card title="% dari laba kotor" value={`${num(result.payrollGrossProfitRatio)}%`} />
      </div>
      {result.warnings.length ? <EmptyHint>{result.warnings.join(" ")}</EmptyHint> : null}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={scenario.selectedForPitch}
          onChange={(event) =>
            setProject({
              ...project,
              staffPlan: {
                ...project.staffPlan,
                selectedScenario: scenario.id,
                scenarios: project.staffPlan.scenarios.map((item) => ({ ...item, selectedForPitch: item.id === scenario.id ? event.target.checked : false })),
              },
            })
          }
        />
        Pakai staff scenario ini untuk pitch
      </label>
      <div className="grid gap-3">
        {scenario.roles.map((role, index) => {
          const cost = calculateStaffRoleCost(role);
          return (
            <div key={role.id} className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-soft md:grid-cols-5">
              <CategorySelect label="Position / role" value={role.position} onChange={(value) => updateRole(index, { position: value })} options={staffCategories} />
              <Select label="Employment type" value={role.employmentType} onChange={(value) => updateRole(index, { employmentType: value as StaffRole["employmentType"] })} options={["Full-time", "Part-time", "Daily worker", "Owner unpaid", "Outsourced"]} />
              <Input label="Number of staff" type="number" value={role.headcount} onChange={(value) => updateRole(index, { headcount: Number(value) })} />
              <Input label="Base salary / person" type="number" value={role.baseSalary} onChange={(value) => updateRole(index, { baseSalary: Number(value) })} />
              <Input label="Meal allowance / person" type="number" value={role.mealAllowance} onChange={(value) => updateRole(index, { mealAllowance: Number(value) })} />
              <Input label="Transport allowance / person" type="number" value={role.transportAllowance} onChange={(value) => updateRole(index, { transportAllowance: Number(value) })} />
              <Input label="Service charge / incentive" type="number" value={role.incentive} onChange={(value) => updateRole(index, { incentive: Number(value) })} />
              <Input label="BPJS / benefit estimate" type="number" value={role.benefit} onChange={(value) => updateRole(index, { benefit: Number(value) })} />
              <Input label="Other allowance" type="number" value={role.otherAllowance} onChange={(value) => updateRole(index, { otherAllowance: Number(value) })} />
              <Input label="Notes" value={role.notes} onChange={(value) => updateRole(index, { notes: value })} />
              <div className="rounded-md bg-paper p-3 text-sm md:col-span-5">
                Total per person: <strong>{money(cost.totalPerPerson)}</strong> · Total role cost: <strong>{money(cost.totalRoleCost)}</strong>
              </div>
              <button className="h-10 rounded-md border border-line text-sm text-clay md:col-span-5" onClick={() => updateScenario({ roles: scenario.roles.filter((item) => item.id !== role.id) })}>Hapus role</button>
            </div>
          );
        })}
      </div>
      <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-sage px-3 text-sm font-medium text-white" onClick={() => updateScenario({ roles: [...scenario.roles, { id: id(), position: "Other", employmentType: "Full-time", headcount: 1, baseSalary: 0, mealAllowance: 0, transportAllowance: 0, incentive: 0, benefit: 0, otherAllowance: 0, notes: "" }] })}>
        <Plus size={16} /> Tambah role
      </button>
    </div>
  );
}

function BudgetVsActual({ project }: { project: Project }) {
  const rows = Object.values(project.setupBudget.reduce<Record<string, { category: string; estimated: number; actual: number; count: number }>>((acc, item) => {
    acc[item.category] ||= { category: item.category, estimated: 0, actual: 0, count: 0 };
    acc[item.category].estimated += item.estimatedPrice * Math.max(1, item.quantity);
    acc[item.category].actual += item.actualPrice * Math.max(1, item.quantity);
    if (!item.purchased) acc[item.category].count += 1;
    return acc;
  }, {}));
  const completion = safeDivide(project.setupBudget.filter((item) => item.purchased).length, project.setupBudget.length) * 100;
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Budget vs Actual</h2>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Card title="Total estimated" value={money(totalEstimatedSetupBudget(project.setupBudget))} />
        <Card title="Total actual" value={money(totalActualSpending(project.setupBudget))} />
        <Card title="Remaining budget" value={money(budgetDifference(project.setupBudget))} />
        <Card title="Over budget amount" value={money(Math.max(0, totalActualSpending(project.setupBudget) - totalEstimatedSetupBudget(project.setupBudget)))} />
        <Card title="Items not purchased" value={`${project.setupBudget.filter((item) => !item.purchased).length}`} />
        <Card title="Completion" value={`${num(completion)}%`} />
      </div>
      <div className="overflow-auto rounded-lg border border-line bg-white shadow-soft">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-paper text-left text-muted"><tr><th className="p-3">Category</th><th>Estimated budget</th><th>Actual spending</th><th>Difference</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            {rows.map((row) => {
              const diff = row.estimated - row.actual;
              const status = row.actual === 0 ? "Not Purchased Yet" : row.actual > row.estimated ? "Over Budget" : row.actual < row.estimated ? "Under Budget" : "On Budget";
              return <tr key={row.category} className="border-t border-line"><td className="p-3 font-medium">{row.category}</td><td>{money(row.estimated)}</td><td>{money(row.actual)}</td><td>{money(diff)}</td><td><Badge tone={status === "Over Budget" ? "bad" : status === "Under Budget" ? "good" : "neutral"}>{status}</Badge></td><td>{row.count ? `${row.count} item belum dibeli` : "-"}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Projection({ project, setProject, categories }: { project: Project; setProject: (project: Project) => void; categories: string[] }) {
  const mp = project.monthlyProjection;
  const result = monthlyProjectionResult(project);
  const payroll = getProjectPayroll(project);
  const updateCost = (key: string, value: number) => setProject({ ...project, monthlyProjection: { ...mp, costs: { ...mp.costs, [key]: value } } });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Monthly Operating Projection</h2>
      <div className="grid gap-3 md:grid-cols-4">
        <Card title="Monthly gross revenue" value={money(result.monthlyRevenue)} />
        <Card title="Gross profit" value={money(result.grossProfit)} />
        <Card title="Staff salary" value={money(payroll)} detail={mp.useManualStaffSalary ? "Manual override aktif" : "Dari Staff Planning"} />
        <Card title="Operating expense" value={money(result.operatingCost)} />
        <Card title="Net profit" value={money(result.netProfit)} detail={`Net margin ${num(result.netMargin)}%`} />
      </div>
      <div className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft md:grid-cols-3">
        <Input label="Estimated daily sales" type="number" value={mp.estimatedDailySales} onChange={(value) => setProject({ ...project, monthlyProjection: { ...mp, estimatedDailySales: Number(value) } })} />
        <Input label="Operating days / month" type="number" value={mp.operatingDaysPerMonth} onChange={(value) => setProject({ ...project, monthlyProjection: { ...mp, operatingDaysPerMonth: Number(value) } })} />
        <Input label="Vendor / consignment income" type="number" value={mp.vendorIncome} onChange={(value) => setProject({ ...project, monthlyProjection: { ...mp, vendorIncome: Number(value) } })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mp.useManualStaffSalary} onChange={(event) => setProject({ ...project, monthlyProjection: { ...mp, useManualStaffSalary: event.target.checked } })} /> Gunakan angka manual</label>
        <Input label="Staff salary from Staff Planning" type="number" value={payroll} onChange={(value) => setProject({ ...project, monthlyProjection: { ...mp, manualStaffSalary: Number(value), useManualStaffSalary: true } })} helper={mp.useManualStaffSalary ? "Manual override aktif." : "Read-only secara konsep: angka berasal dari Staff Planning."} />
        {categories.filter((key) => key !== "Staff salary").map((key) => (
          <Input key={key} label={key} type="number" value={mp.costs[key] || 0} onChange={(value) => updateCost(key, Number(value))} />
        ))}
      </div>
    </div>
  );
}

function OpeningScenarioPage({ project, setProject }: { project: Project; setProject: (project: Project) => void }) {
  const [tab, setTab] = useState(project.openingScenarios.find((scenario) => scenario.selectedForPitch)?.id || project.openingScenarios[0]?.id);
  const scenario = project.openingScenarios.find((item) => item.id === tab) || project.openingScenarios[0];
  const investment = projectInitialInvestment(project, scenario.investmentSource);
  const payroll = getProjectPayroll(project);
  const result = calculateOpeningScenarioResult(scenario, investment, payroll);
  const bufferAmount = calculateOpeningBuffer(totalEstimatedSetupBudget(project.setupBudget), project.openingBuffer.percentage);
  const capitalWithBuffer = calculateCapitalNeededWithBuffer(totalEstimatedSetupBudget(project.setupBudget), project.openingBuffer.percentage);
  const readiness = generateCapitalReadinessStatus(project);
  const risks = generateRiskRecommendations(project);
  const mixTotal = sum(Object.values(scenario.productMix));
  const updateScenario = (patch: Partial<OpeningScenario>) => setProject({ ...project, openingScenarios: project.openingScenarios.map((item) => (item.id === scenario.id ? { ...item, ...patch } : item)) });
  const updateFixed = (key: string, value: number) => updateScenario({ fixedCosts: { ...scenario.fixedCosts, [key]: value } });
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-bold">Simulasi Balik Modal & Realistic Opening Scenario</h2>
        <p className="text-sm text-muted">Gunakan angka konservatif untuk awal opening agar proyeksi tidak terlalu optimis.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {project.openingScenarios.map((item) => <button key={item.id} className={cn("h-10 rounded-md border px-4 text-sm", item.id === scenario.id ? "border-ink bg-ink text-white" : "border-line bg-white")} onClick={() => setTab(item.id)}>{item.name}</button>)}
      </div>
      {mixTotal !== 100 && <EmptyHint>Warning: total product mix saat ini {num(mixTotal)}%. Sesuaikan ke 100% agar weighted margin lebih akurat.</EmptyHint>}
      <div className="grid gap-3 md:grid-cols-5">
        <Card title="Omzet per bulan" value={money(result.monthlyRevenue)} />
        <Card title="Laba kotor" value={money(result.grossProfit)} detail={`Weighted margin ${num(result.weightedGrossMargin * 100)}%`} />
        <Card title="Biaya operasional" value={money(result.monthlyOperatingCost)} />
        <Card title="Payroll Staff Planning" value={money(payroll)} />
        <Card title="Estimasi laba bersih" value={money(result.netProfit)} detail={`Net margin ${num(result.netMargin)}%`} />
        <Card title="Balik modal" value={result.paybackMonths ? `${num(result.paybackMonths)} bulan` : "Belum balik modal"} detail={result.paybackYears ? `${num(result.paybackYears)} tahun` : "Profit belum cukup"} />
      </div>
      <div className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft md:grid-cols-4">
        <Input label="Average customers per day" type="range" value={scenario.customersPerDay} onChange={(value) => updateScenario({ customersPerDay: Number(value) })} helper={`${scenario.customersPerDay} customer/hari`} />
        <Input label="Operating days / month" type="number" value={scenario.operatingDaysPerMonth} onChange={(value) => updateScenario({ operatingDaysPerMonth: Number(value) })} />
        <Input label="% buying beverage" type="number" value={scenario.beverageBuyerPercentage} onChange={(value) => updateScenario({ beverageBuyerPercentage: Number(value) })} />
        <Input label="% buying food" type="number" value={scenario.foodBuyerPercentage} onChange={(value) => updateScenario({ foodBuyerPercentage: Number(value) })} />
        <Input label="% buying both" type="number" value={scenario.bothBuyerPercentage} onChange={(value) => updateScenario({ bothBuyerPercentage: Number(value) })} />
        <Input label="Average beverage price" type="number" value={scenario.averageBeveragePrice} onChange={(value) => updateScenario({ averageBeveragePrice: Number(value) })} />
        <Input label="Average food price" type="number" value={scenario.averageFoodPrice} onChange={(value) => updateScenario({ averageFoodPrice: Number(value) })} />
        <Input label="Average consignment price" type="number" value={scenario.averageConsignmentPrice} onChange={(value) => updateScenario({ averageConsignmentPrice: Number(value) })} />
        {Object.entries(scenario.productMix).map(([key, value]) => <Input key={key} label={`Mix ${key} %`} type="number" value={value} onChange={(next) => updateScenario({ productMix: { ...scenario.productMix, [key]: Number(next) } })} />)}
        {Object.entries(scenario.marginAssumptions).map(([key, value]) => <Input key={key} label={`Margin ${key} %`} type="number" value={value} onChange={(next) => updateScenario({ marginAssumptions: { ...scenario.marginAssumptions, [key]: Number(next) } })} />)}
        <Input label="Staff salary" type="number" value={payroll} onChange={() => undefined} helper="Otomatis dari Staff Planning. Ubah di module Staff Planning atau aktifkan manual override di Monthly Projection." />
        {Object.entries(scenario.fixedCosts).filter(([key]) => key !== "Staff salary").map(([key, value]) => <Input key={key} label={key} type="number" value={value} onChange={(next) => updateFixed(key, Number(next))} />)}
        <Select label="Calculate payback from" value={scenario.investmentSource} onChange={(value) => updateScenario({ investmentSource: value as OpeningScenario["investmentSource"] })} options={["estimated", "actual"]} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={scenario.selectedForPitch} onChange={(event) => setProject({ ...project, openingScenarios: project.openingScenarios.map((item) => ({ ...item, selectedForPitch: item.id === scenario.id ? event.target.checked : false })) })} /> Pakai untuk pitch</label>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Card title="Target omzet minimal" value={money(result.breakEvenMonthlyRevenue)} />
        <Card title="Target sales per hari" value={money(result.breakEvenDailyRevenue)} />
        <Card title="Target customer minimal" value={`${num(result.breakEvenCustomersPerDay)} / hari`} />
        <Card title="Initial investment" value={money(investment)} />
      </div>
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h3 className="font-bold">Simple Break-even Explanation</h3>
        <p className="mt-2 text-sm leading-6 text-muted">Butuh omzet minimal per bulan <strong>{money(result.breakEvenMonthlyRevenue)}</strong>, omzet minimal per hari <strong>{money(result.breakEvenDailyRevenue)}</strong>, dan customer minimal <strong>{num(result.breakEvenCustomersPerDay)} per hari</strong>. Kalau customer kurang dari angka ini, bisnis kemungkinan belum menutup biaya bulanan.</p>
      </div>
      <div className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft md:grid-cols-4">
        <Select label="Opening cost buffer" value={String(project.openingBuffer.percentage)} onChange={(value) => setProject({ ...project, openingBuffer: { percentage: Number(value) } })} options={["5", "10", "15", "20"]} />
        <Card title="Buffer amount" value={money(bufferAmount)} />
        <Card title="Capital + buffer" value={money(capitalWithBuffer)} />
        <Card title="Setup budget" value={money(totalEstimatedSetupBudget(project.setupBudget))} />
      </div>
      <ConsultantPlanning project={project} setProject={setProject} readiness={readiness} risks={risks} />
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h3 className="font-bold">Interpretasi</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{result.interpretation}</p>
        <h3 className="mt-4 font-bold">Rekomendasi otomatis</h3>
        <ul className="mt-2 grid gap-2 text-sm leading-6 text-muted">{result.recommendations.map((item) => <li key={item}>• {item}</li>)}</ul>
        <p className="mt-4 text-xs leading-5 text-muted">Simulasi ini adalah estimasi awal. Hasil aktual dapat berbeda tergantung traffic lokasi, kualitas produk, repeat customer, promosi, harga bahan baku, dan operasional harian.</p>
      </div>
    </div>
  );
}

function ConsultantPlanning({ project, setProject, readiness, risks }: { project: Project; setProject: (project: Project) => void; readiness: Record<string, boolean>; risks: RiskItem[] }) {
  const updateRisk = (idValue: string, patch: Partial<RiskItem>) => setProject({ ...project, riskItems: (project.riskItems || []).map((risk) => (risk.id === idValue ? { ...risk, ...patch } : risk)) });
  const updateMenuMix = (patch: Partial<Project["menuMix"]>) => setProject({ ...project, menuMix: { ...project.menuMix, ...patch } });
  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h3 className="font-bold">Capital Readiness Checklist</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {Object.entries(readiness).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between rounded-md bg-paper p-3 text-sm">
              <span>{key.replace(/([A-Z])/g, " $1")}</span>
              <Badge tone={value ? "good" : "warn"}>{value ? "Ready" : "Check"}</Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h3 className="font-bold">Risk Checklist</h3>
        <div className="mt-3 grid gap-3">
          {risks.map((risk) => (
            <div key={risk.id} className="grid gap-3 rounded-md bg-paper p-3 md:grid-cols-5">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={risk.checked} onChange={(event) => updateRisk(risk.id, { checked: event.target.checked })} /> {risk.title}</label>
              <Select label="Risk level" value={risk.level} onChange={(value) => updateRisk(risk.id, { level: value as RiskItem["level"] })} options={["Low", "Medium", "High"]} />
              <Input label="Notes" value={risk.notes} onChange={(value) => updateRisk(risk.id, { notes: value })} />
              <Input label="Recommendation" value={risk.recommendation} onChange={(value) => updateRisk(risk.id, { recommendation: value })} />
              <Badge tone={risk.level === "High" ? "bad" : risk.level === "Medium" ? "warn" : "good"}>{risk.level}</Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft md:grid-cols-3">
        <h3 className="font-bold md:col-span-3">Menu Mix Planner</h3>
        <Input label="Beverage count" type="number" value={project.menuMix.beverageCount} onChange={(value) => updateMenuMix({ beverageCount: Number(value) })} />
        <Input label="Food count" type="number" value={project.menuMix.foodCount} onChange={(value) => updateMenuMix({ foodCount: Number(value) })} />
        <Input label="Dessert/snack count" type="number" value={project.menuMix.dessertSnackCount} onChange={(value) => updateMenuMix({ dessertSnackCount: Number(value) })} />
        <Input label="Own product %" type="number" value={project.menuMix.ownProductPercentage} onChange={(value) => updateMenuMix({ ownProductPercentage: Number(value) })} />
        <Input label="Vendor/consignment %" type="number" value={project.menuMix.vendorConsignmentPercentage} onChange={(value) => updateMenuMix({ vendorConsignmentPercentage: Number(value) })} />
        <Input label="Hero product / best seller target" value={project.menuMix.heroProductTarget} onChange={(value) => updateMenuMix({ heroProductTarget: value })} />
        <TextArea label="High margin product list" value={project.menuMix.highMarginProducts} onChange={(value) => updateMenuMix({ highMarginProducts: value })} />
        <EmptyHint>Untuk cafe awal, sebaiknya ada beberapa produk margin tinggi sebagai penopang profit, terutama beverage sendiri.</EmptyHint>
      </div>
    </div>
  );
}

function MenuMixPage({ project, setProject }: { project: Project; setProject: (project: Project) => void }) {
  const summary = calculateMenuMixSummary(project.menuMixPlan.items || []);
  const recommendations = generateMenuMixRecommendations(project.menuMixPlan.items || []);
  const updateItem = (index: number, patch: Partial<MenuMixItem>) => {
    const next = project.menuMixPlan.items.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const merged = { ...item, ...patch };
      const grossProfit = calculateMenuItemGrossProfit(merged);
      const grossMargin = calculateMenuItemGrossMargin(merged);
      return { ...merged, grossProfit, grossMargin, monthlyRevenueEstimate: merged.sellingPrice * merged.expectedSalesPerDay * 26, monthlyGrossProfitEstimate: grossProfit * merged.expectedSalesPerDay * 26 };
    });
    setProject({ ...project, menuMixPlan: { ...project.menuMixPlan, items: next, updatedAt: now() } });
  };
  const addItem = () => setProject({ ...project, menuMixPlan: { ...project.menuMixPlan, items: [...project.menuMixPlan.items, { id: id(), name: "Menu baru", category: "Beverage", source: "Own product", sellingPrice: 0, estimatedCost: 0, grossProfit: 0, grossMargin: 0, expectedSalesPerDay: 0, monthlyRevenueEstimate: 0, monthlyGrossProfitEstimate: 0, isHeroProduct: false, isHighMargin: false, notes: "" }], updatedAt: now() } });
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-bold">Menu Mix Planner</h2>
        <p className="text-sm text-muted">Gunakan Menu Mix untuk melihat apakah komposisi produk terlalu bergantung pada vendor/konsinyasi atau sudah cukup kuat dari produk sendiri.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Card title="Total menu" value={`${summary.totalMenuCount}`} />
        <Card title="Own product ratio" value={`${num(summary.ownProductRatio)}%`} />
        <Card title="Vendor/consignment" value={`${num(summary.vendorConsignmentRatio)}%`} />
        <Card title="Weighted margin" value={`${num(summary.weightedAverageMargin)}%`} />
        <Card title="Monthly revenue" value={money(summary.estimatedMonthlyRevenue)} />
        <Card title="Monthly gross profit" value={money(summary.estimatedMonthlyGrossProfit)} />
      </div>
      <EmptyHint>{recommendations.join(" ")}</EmptyHint>
      <div className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft md:grid-cols-4">
        <Input label="Hero product / best seller target" value={project.menuMix.heroProductTarget} onChange={(value) => setProject({ ...project, menuMix: { ...project.menuMix, heroProductTarget: value } })} />
        <TextArea label="High margin product list" value={project.menuMix.highMarginProducts} onChange={(value) => setProject({ ...project, menuMix: { ...project.menuMix, highMarginProducts: value } })} />
        <TextArea label="Low margin product list" value={project.menuMix.lowMarginProducts} onChange={(value) => setProject({ ...project, menuMix: { ...project.menuMix, lowMarginProducts: value } })} />
        <TextArea label="Notes" value={project.menuMixPlan.notes} onChange={(value) => setProject({ ...project, menuMixPlan: { ...project.menuMixPlan, notes: value, updatedAt: now() }, menuMix: { ...project.menuMix, notes: value } })} />
      </div>
      <div className="grid gap-3">
        {project.menuMixPlan.items.map((item, index) => (
          <div key={item.id} className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-soft md:grid-cols-5">
            <Input label="Menu name" value={item.name} onChange={(value) => updateItem(index, { name: value })} />
            <Select label="Category" value={item.category} onChange={(value) => updateItem(index, { category: value as MenuMixItem["category"] })} options={["Beverage", "Food", "Dessert", "Snack", "Vendor product", "Consignment", "Merchandise", "Other"]} />
            <Select label="Source" value={item.source} onChange={(value) => updateItem(index, { source: value as MenuMixItem["source"] })} options={["Own product", "Vendor", "Consignment", "Beli putus", "Bagi hasil"]} />
            <Input label="Selling price" type="number" value={item.sellingPrice} onChange={(value) => updateItem(index, { sellingPrice: Number(value) })} />
            <Input label="Estimated cost" type="number" value={item.estimatedCost} onChange={(value) => updateItem(index, { estimatedCost: Number(value) })} />
            <Input label="Expected sales / day" type="number" value={item.expectedSalesPerDay} onChange={(value) => updateItem(index, { expectedSalesPerDay: Number(value) })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.isHeroProduct} onChange={(event) => updateItem(index, { isHeroProduct: event.target.checked })} /> Hero product</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.isHighMargin} onChange={(event) => updateItem(index, { isHighMargin: event.target.checked })} /> High margin</label>
            <Input label="Notes" value={item.notes} onChange={(value) => updateItem(index, { notes: value })} />
            <div className="rounded-md bg-paper p-3 text-sm md:col-span-5">Gross profit <strong>{money(item.grossProfit)}</strong> · Margin <strong>{num(item.grossMargin)}%</strong> · Monthly revenue <strong>{money(item.monthlyRevenueEstimate)}</strong> · Monthly gross profit <strong>{money(item.monthlyGrossProfitEstimate)}</strong></div>
            <button className="h-10 rounded-md border border-line text-sm text-clay md:col-span-5" onClick={() => setProject({ ...project, menuMixPlan: { ...project.menuMixPlan, items: project.menuMixPlan.items.filter((row) => row.id !== item.id), updatedAt: now() } })}>Hapus menu</button>
          </div>
        ))}
      </div>
      <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-sage px-3 text-sm font-medium text-white" onClick={addItem}><Plus size={16} /> Tambah menu item</button>
    </div>
  );
}

function CapitalBufferPage({ project, setProject }: { project: Project; setProject: (project: Project) => void }) {
  const buffer = project.capitalBuffer;
  const result = calculateProjectCapitalBuffer(project);
  const recommendation = generateBufferRecommendation(buffer.bufferPercentage);
  const reasons = ["Renovasi bisa membengkak", "Harga alat berubah", "Opening stock kurang", "Kerusakan alat", "Biaya promosi opening", "Biaya training staff", "Biaya legal/admin tambahan", "Emergency cash flow bulan pertama", "Other"];
  const updateBuffer = (patch: Partial<Project["capitalBuffer"]>) => setProject({ ...project, capitalBuffer: { ...buffer, ...patch, bufferAmount: result.bufferAmount, totalRecommendedCapital: result.totalRecommendedCapital }, openingBuffer: { percentage: patch.bufferPercentage ?? buffer.bufferPercentage } });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Capital Buffer / Dana Cadangan</h2>
      <div className="grid gap-3 md:grid-cols-4">
        <Card title="Modal awal estimasi" value={money(result.setupEstimatedBudget)} />
        <Card title="Dana cadangan disarankan" value={money(result.bufferAmount)} />
        <Card title="Total modal aman" value={money(result.totalRecommendedCapital)} />
        <Card title="Persentase buffer" value={`${num(buffer.bufferPercentage)}%`} />
      </div>
      <div className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft md:grid-cols-3">
        <Select label="Buffer base" value={buffer.baseType} onChange={(value) => updateBuffer({ baseType: value as Project["capitalBuffer"]["baseType"] })} options={["estimated", "actual", "remaining"]} />
        <Select label="Buffer percentage" value={["5", "10", "15", "20"].includes(String(buffer.bufferPercentage)) ? String(buffer.bufferPercentage) : "Custom"} onChange={(value) => value !== "Custom" && updateBuffer({ bufferPercentage: Number(value) })} options={["5", "10", "15", "20", "Custom"]} />
        <Input label="Custom buffer %" type="number" value={buffer.bufferPercentage} onChange={(value) => updateBuffer({ bufferPercentage: Number(value) })} />
        <TextArea label="Custom notes" value={buffer.notes} onChange={(value) => updateBuffer({ notes: value })} />
      </div>
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h3 className="font-bold">Buffer reason checklist</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {reasons.map((reason) => <label key={reason} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={buffer.reasons.includes(reason)} onChange={(event) => updateBuffer({ reasons: event.target.checked ? [...buffer.reasons, reason] : buffer.reasons.filter((item) => item !== reason) })} /> {reason}</label>)}
        </div>
      </div>
      <EmptyHint>{recommendation}</EmptyHint>
    </div>
  );
}

function RiskChecklistPage({ project, setProject }: { project: Project; setProject: (project: Project) => void }) {
  const autoItems = generateAutoRiskChecklist(project);
  const status = calculateOverallRiskStatus(autoItems);
  const high = autoItems.filter((item) => item.active && item.level === "High").length;
  const medium = autoItems.filter((item) => item.active && item.level === "Medium").length;
  const low = autoItems.filter((item) => item.active && item.level === "Low").length;
  const resolved = autoItems.filter((item) => item.status === "Resolved").length;
  const recommendation = high >= 3 ? "Project perlu ditinjau ulang sebelum dipitch. Ada beberapa risiko tinggi yang bisa mengganggu profit dan cash flow." : high === 0 && calculateReadinessScore(project).score >= 70 ? "Project cukup siap untuk dipresentasikan, dengan catatan angka asumsi tetap harus divalidasi." : "Review risiko aktif dan tetapkan PIC sebelum pitch.";
  const updateRisk = (idValue: string, patch: Partial<RiskItem>) => setProject({ ...project, riskChecklist: { ...project.riskChecklist, items: autoItems.map((item) => (item.id === idValue ? { ...item, ...patch } : item)), overallRiskStatus: status, updatedAt: now() }, riskItems: autoItems.map((item) => (item.id === idValue ? { ...item, ...patch } : item)) });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Risk Checklist</h2>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Card title="Total risks" value={`${autoItems.length}`} />
        <Card title="High risks" value={`${high}`} />
        <Card title="Medium risks" value={`${medium}`} />
        <Card title="Low risks" value={`${low}`} />
        <Card title="Resolved risks" value={`${resolved}`} />
        <Card title="Overall risk status" value={status} />
      </div>
      <EmptyHint>{recommendation}</EmptyHint>
      <div className="grid gap-3">
        {autoItems.map((risk) => (
          <div key={risk.id} className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-soft md:grid-cols-5">
            <Input label="Risk title" value={risk.title} onChange={(value) => updateRisk(risk.id, { title: value })} />
            <Select label="Risk level" value={risk.level} onChange={(value) => updateRisk(risk.id, { level: value as RiskItem["level"] })} options={["Low", "Medium", "High"]} />
            <Select label="Status" value={risk.status} onChange={(value) => updateRisk(risk.id, { status: value as RiskItem["status"] })} options={["Open", "In progress", "Resolved", "Accepted risk"]} />
            <Input label="Owner/person responsible" value={risk.responsiblePerson} onChange={(value) => updateRisk(risk.id, { responsiblePerson: value })} />
            <Input label="Target resolution date" type="date" value={risk.targetResolutionDate} onChange={(value) => updateRisk(risk.id, { targetResolutionDate: value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={risk.active} onChange={(event) => updateRisk(risk.id, { active: event.target.checked, checked: event.target.checked })} /> Active risk</label>
            <Badge tone={risk.autoGenerated ? "warn" : "neutral"}>{risk.autoGenerated ? "Auto suggestion" : "Manual"}</Badge>
            <TextArea label="Notes" value={risk.notes} onChange={(value) => updateRisk(risk.id, { notes: value })} />
            <TextArea label="Recommendation" value={risk.recommendation} onChange={(value) => updateRisk(risk.id, { recommendation: value })} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadinessPage({ project }: { project: Project }) {
  const readiness = calculateReadinessScore(project);
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Readiness Score</h2>
      <div className="grid gap-3 md:grid-cols-4">
        <Card title="Readiness percentage" value={`${num(readiness.score)}%`} />
        <Card title="Status" value={readiness.status} />
        <Card title="Completed items" value={`${readiness.completedItems.length}`} />
        <Card title="Missing items" value={`${readiness.missingItems.length}`} />
      </div>
      <EmptyHint>Project {num(readiness.score)}% ready to pitch. {readiness.recommendation}</EmptyHint>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft"><h3 className="font-bold">Completed</h3><ul className="mt-3 grid gap-2 text-sm text-muted">{readiness.completedItems.map((item) => <li key={item}>• {item}</li>)}</ul></div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft"><h3 className="font-bold">Missing</h3><ul className="mt-3 grid gap-2 text-sm text-muted">{readiness.missingItems.map((item) => <li key={item}>• {item}</li>)}</ul></div>
      </div>
    </div>
  );
}

function ProfitSharingPage({ project, setProject }: { project: Project; setProject: (project: Project) => void }) {
  const selectedScenario = project.openingScenarios.find((scenario) => scenario.selectedForPitch) || project.openingScenarios[0];
  const scenarioResult = calculateOpeningScenarioResult(selectedScenario, projectInitialInvestment(project, selectedScenario.investmentSource), getProjectPayroll(project));
  const netProfit = project.profitSharing.monthlyNetProfit || scenarioResult.netProfit;
  const rows = profitSharing(project, netProfit);
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Profit Sharing Simulation</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <Card title="Profit before sharing" value={money(netProfit)} />
        <Card title="Total fixed fees" value={money(sum(rows.map((row) => row.fixedFee)))} />
        <Card title="Distributable profit" value={money(Math.max(0, netProfit - sum(rows.map((row) => row.fixedFee))))} />
      </div>
      <div className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft md:grid-cols-2">
        <Input label="Monthly net profit override" type="number" value={project.profitSharing.monthlyNetProfit} onChange={(value) => setProject({ ...project, profitSharing: { ...project.profitSharing, monthlyNetProfit: Number(value) } })} helper="Kosongkan/0 untuk memakai skenario pitch." />
        <Select label="Profit sharing mode" value={project.profitSharing.mode} onChange={(value) => setProject({ ...project, profitSharing: { ...project.profitSharing, mode: value as Project["profitSharing"]["mode"] } })} options={["Based on ownership percentage", "Based on custom profit percentage", "Fixed management fee first, then profit share", "Investor return first, then profit share", "Operator salary first, then profit share"]} />
      </div>
      <div className="overflow-auto rounded-lg border border-line bg-white shadow-soft">
        <table className="w-full min-w-[720px] text-sm"><thead className="bg-paper text-left text-muted"><tr><th className="p-3">Partner</th><th>Role</th><th>Ownership</th><th>Profit %</th><th>Fixed fee</th><th>Profit received</th><th>Final received</th></tr></thead><tbody>{rows.map((row) => <tr key={row.partner.id} className="border-t border-line"><td className="p-3 font-medium">{row.partner.name}</td><td>{row.partner.role}</td><td>{num(row.partner.ownershipPercentage)}%</td><td>{num(row.partner.profitSharingPercentage)}%</td><td>{money(row.fixedFee)}</td><td>{money(row.profitReceived)}</td><td>{money(row.finalReceived)}</td></tr>)}</tbody></table>
      </div>
      <EmptyHint>Simulasi ini hanya estimasi. Skema final harus disepakati dalam perjanjian tertulis.</EmptyHint>
    </div>
  );
}

function SummaryPage({ project, setProject, settings, result, scenario, onDuplicate }: { project: Project; setProject: (project: Project) => void; settings: AppData["settings"]; result: ReturnType<typeof calculateOpeningScenarioResult>; scenario: OpeningScenario; onDuplicate: () => void }) {
  const mp = monthlyProjectionResult(project);
  const equipment = equipmentElectricitySummary(project.equipment);
  const staff = calculateStaffPlanResult(project);
  const staffScenario = project.staffPlan.scenarios.find((item) => item.id === project.staffPlan.selectedScenario) || project.staffPlan.scenarios.find((item) => item.selectedForPitch) || project.staffPlan.scenarios[0];
  const sharing = profitSharing(project, project.profitSharing.monthlyNetProfit || result.netProfit);
  const menuSummary = calculateMenuMixSummary(project.menuMixPlan.items || []);
  const menuRecommendations = generateMenuMixRecommendations(project.menuMixPlan.items || []);
  const buffer = calculateProjectCapitalBuffer(project);
  const bufferRecommendation = generateBufferRecommendation(project.capitalBuffer.bufferPercentage);
  const riskItems = generateAutoRiskChecklist(project);
  const riskStatus = calculateOverallRiskStatus(riskItems);
  const highRisks = riskItems.filter((risk) => risk.active && risk.level === "High");
  const readiness = calculateReadinessScore(project);
  return (
    <div className="print-page grid gap-5 rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="no-print flex flex-wrap justify-end gap-2">
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm" onClick={() => window.print()}><Printer size={16} /> Print</button>
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm" onClick={() => window.print()}><Download size={16} /> Export PDF</button>
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm" onClick={onDuplicate}><Copy size={16} /> Duplicate project</button>
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-sage">Project Summary / Pitch Page</p>
        <h2 className="mt-1 text-3xl font-bold">{getProjectDisplayName(project)}</h2>
        <p className="mt-2 text-sm text-muted">Generated {new Date().toLocaleDateString("id-ID")} · {settings.consultantName}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Card title="Estimated setup cost" value={money(totalEstimatedSetupBudget(project.setupBudget))} />
        <Card title="Actual spending" value={money(totalActualSpending(project.setupBudget))} />
        <Card title="Estimated net profit" value={money(result.netProfit)} />
        <Card title="Payback period" value={result.paybackMonths ? `${num(result.paybackMonths)} bulan` : "Belum balik modal"} />
      </div>
      <SummarySection title="1. Project Overview">
        <p>{project.businessType} · {project.projectStatus} · {project.placeStatus}</p>
        <p>Target opening: {project.targetOpeningDate || "-"}</p>
        <p>{project.locationNotes}</p>
      </SummarySection>
      <SummarySection title="2. Ownership & Partnership">
        {project.ownership.partners.map((partner) => <p key={partner.id}>{partner.name}: modal {money(partner.capitalContribution)}, ownership {num(partner.ownershipPercentage)}%, profit share {num(partner.profitSharingPercentage)}%. {partner.notes}</p>)}
      </SummarySection>
      <SummarySection title="3. Setup Budget">
        <p>Estimated {money(totalEstimatedSetupBudget(project.setupBudget))}, actual {money(totalActualSpending(project.setupBudget))}, remaining {money(budgetDifference(project.setupBudget))}.</p>
      </SummarySection>
      <SummarySection title="4. Existing Assets">
        <p>Total asset value {money(sum(project.existingAssets.map((asset) => asset.currentValue)))}. Counted as capital {money(existingAssetCapital(project.existingAssets))}.</p>
      </SummarySection>
      <SummarySection title="5. Product & Vendor Strategy">
        <p>Own products: {project.products.filter((item) => item.type === "Own product").length}. Consignment/vendor/bagi hasil: {project.products.filter((item) => item.type !== "Own product").length}. Expected cafe income {money(sum(project.products.map(monthlyProductIncome)))} / month.</p>
      </SummarySection>
      <SummarySection title="6. Equipment & Electricity">
        <p>Total monthly electricity {money(equipment.totalCost)}. Cafe responsibility {money(equipment.cafeCost)}, vendor responsibility {money(equipment.vendorCost)}.</p>
      </SummarySection>
      <SummarySection title="Rencana Staff & Payroll">
        <p>Total staff {num(staff.totalHeadcount)} orang. Scenario: {staffScenario?.name || "-"}. Estimated monthly payroll {money(staff.totalPayroll)}.</p>
        <p>Payroll {num(staff.payrollRevenueRatio)}% dari revenue dan {num(staff.payrollGrossProfitRatio)}% dari laba kotor.</p>
        <p>{staff.recommendations[0]}</p>
        <p>Key roles: {(staffScenario?.roles || []).filter((role) => role.headcount > 0).slice(0, 5).map((role) => `${role.position} (${role.headcount})`).join(", ") || "-"}</p>
      </SummarySection>
      <SummarySection title="7. Monthly Projection">
        <p>Revenue {money(mp.monthlyRevenue)}, cost {money(mp.operatingCost + mp.cogs)}, net profit {money(mp.netProfit)}, net margin {num(mp.netMargin)}%, break-even sales {money(mp.breakEvenSales)}.</p>
      </SummarySection>
      <SummarySection title="Simulasi Balik Modal & Target Realistis">
        <p>Selected scenario: {scenario.name}. Customers {scenario.customersPerDay}/day, estimated monthly revenue {money(result.monthlyRevenue)}, net profit {money(result.netProfit)}, break-even sales target {money(result.breakEvenMonthlyRevenue)}, break-even customer target {num(result.breakEvenCustomersPerDay)}/day.</p>
        <p>{result.interpretation}</p>
        <p>{result.recommendations[0]}</p>
      </SummarySection>
      <SummarySection title="Menu Mix & Margin Health">
        <p>Own product ratio {num(menuSummary.ownProductRatio)}%, vendor/consignment ratio {num(menuSummary.vendorConsignmentRatio)}%, weighted average margin {num(menuSummary.weightedAverageMargin)}%.</p>
        <p>High margin products: {project.menuMix.highMarginProducts || menuSummary.topMarginItems.map((item) => item.name).join(", ") || "-"}</p>
        <p>{menuRecommendations[0]}</p>
      </SummarySection>
      <SummarySection title="Capital Buffer">
        <p>Setup budget {money(buffer.setupEstimatedBudget)}, selected buffer {num(project.capitalBuffer.bufferPercentage)}%, buffer amount {money(buffer.bufferAmount)}, total recommended capital {money(buffer.totalRecommendedCapital)}.</p>
        <p>{bufferRecommendation}</p>
      </SummarySection>
      <SummarySection title="Risk Assessment">
        <p>Overall risk status: {riskStatus}. High risk count: {highRisks.length}.</p>
        <p>Main risks: {highRisks.slice(0, 4).map((risk) => risk.title).join(", ") || "Tidak ada high risk aktif."}</p>
        <p>{highRisks.length >= 3 ? "Project perlu ditinjau ulang sebelum dipitch." : "Review risiko aktif dan validasi asumsi utama sebelum pitch."}</p>
      </SummarySection>
      <SummarySection title="Readiness Score">
        <p>Readiness {num(readiness.score)}% · {readiness.status}. Completed {readiness.completedItems.length}, missing {readiness.missingItems.length}.</p>
        <p>{readiness.recommendation}</p>
        <p>Missing: {readiness.missingItems.slice(0, 5).join(", ") || "-"}</p>
      </SummarySection>
      <SummarySection title="8. Partner Profit Simulation">
        {sharing.map((row) => <p key={row.partner.id}>{row.partner.name}: estimated received {money(row.finalReceived)} / month.</p>)}
      </SummarySection>
      <SummarySection title="9. Consultant Notes">
        <div className="grid gap-3 md:grid-cols-2">
          <TextArea label="Strength" value={project.summary.strengths} onChange={(value) => setProject({ ...project, summary: { ...project.summary, strengths: value } })} />
          <TextArea label="Risk" value={project.summary.risks} onChange={(value) => setProject({ ...project, summary: { ...project.summary, risks: value } })} />
          <TextArea label="Recommendation" value={project.summary.recommendation} onChange={(value) => setProject({ ...project, summary: { ...project.summary, recommendation: value } })} />
          <TextArea label="Next action" value={project.summary.nextAction} onChange={(value) => setProject({ ...project, summary: { ...project.summary, nextAction: value } })} />
        </div>
      </SummarySection>
      <SummarySection title="10. Decision Status">
        <Select label="Decision status" value={project.summary.decisionStatus} onChange={(value) => setProject({ ...project, summary: { ...project.summary, decisionStatus: value as Project["summary"]["decisionStatus"] } })} options={["Draft", "Need revision", "Ready for investor", "Approved", "Opened"]} />
      </SummarySection>
      <p className="border-t border-line pt-4 text-xs leading-5 text-muted">{settings.pdf.disclaimer}</p>
    </div>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="grid gap-2 border-t border-line pt-4 text-sm leading-6 text-muted"><h3 className="text-base font-bold text-ink">{title}</h3>{children}</section>;
}

function LocalDataSettings({ data, selectedId, createProject, exportBackup, importBackupFile, clearAllLocalData, resetDemo }: { data: AppData; selectedId: string; createProject: () => void; exportBackup: () => void; importBackupFile: (file: File) => void; clearAllLocalData: () => void; resetDemo: () => void }) {
  const activeProject = data.projects.find((project) => project.id === selectedId);
  const lastSavedAt = typeof window !== "undefined" ? localStorage.getItem("fnb-consult-last-saved-at") : "";
  const dataSize = new Blob([JSON.stringify(data)]).size;
  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <h3 className="font-bold">Local Data & Backup</h3>
      <p className="mt-2 text-sm leading-6 text-muted">Data aplikasi ini tersimpan di browser/perangkat ini. Jika browser cache dihapus atau membuka dari perangkat lain, data bisa berbeda. Gunakan export backup untuk menyimpan salinan data.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <Card title="Storage mode" value="Local browser storage" />
        <Card title="Total projects" value={`${data.projects.length}`} />
        <Card title="Last saved" value={lastSavedAt ? new Date(lastSavedAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "-"} />
        <Card title="Data size" value={`${(dataSize / 1024).toFixed(1)} KB`} />
        <Card title="Active project" value={getProjectDisplayName(activeProject)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="h-10 rounded-md bg-ink px-3 text-sm font-medium text-white" onClick={exportBackup}>Export backup JSON</button>
        <label className="inline-flex h-10 cursor-pointer items-center rounded-md border border-line bg-white px-3 text-sm">
          Import backup JSON
          <input className="hidden" type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && importBackupFile(event.target.files[0])} />
        </label>
        <button className="h-10 rounded-md border border-line bg-white px-3 text-sm text-clay" onClick={clearAllLocalData}>Clear all local data</button>
        <button className="h-10 rounded-md border border-line bg-white px-3 text-sm" onClick={resetDemo}>Reset demo data</button>
        <button className="h-10 rounded-md bg-sage px-3 text-sm font-medium text-white" onClick={createProject}>Create blank project</button>
      </div>
    </div>
  );
}

function SettingsPage({ data, setData, resetDemo, selectedId, createProject, exportBackup, importBackupFile, clearAllLocalData }: { data: AppData; setData: (data: AppData) => void; resetDemo: () => void; selectedId: string; createProject: () => void; exportBackup: () => void; importBackupFile: (file: File) => void; clearAllLocalData: () => void }) {
  const settings = data.settings;
  const [editingChecklistId, setEditingChecklistId] = useState("");
  const [checklistDraft, setChecklistDraft] = useState<ChecklistLibraryItem | null>(null);
  const setupCategories = activeCategories(settings, "setup_budget");
  const updateSettings = (patch: Partial<AppData["settings"]>) => setData({ ...data, settings: { ...settings, ...patch } });
  const startChecklistEdit = (item: ChecklistLibraryItem) => {
    setEditingChecklistId(item.id);
    setChecklistDraft({ ...item });
  };
  const saveChecklistDraft = () => {
    if (!checklistDraft) return;
    const saved = { ...checklistDraft, updatedAt: now() };
    updateSettings({ defaultChecklistItems: settings.defaultChecklistItems.map((item) => (item.id === saved.id ? saved : item)) });
    setEditingChecklistId("");
    setChecklistDraft(null);
  };
  const addChecklistItem = () => {
    const createdAt = now();
    const item: ChecklistLibraryItem = { id: id(), name: "Checklist item baru", categoryId: setupCategories[0]?.id || "", defaultEstimatedPrice: 0, defaultQuantity: 1, required: true, active: true, notes: "", createdAt, updatedAt: createdAt };
    updateSettings({ defaultChecklistItems: [item, ...settings.defaultChecklistItems] });
    startChecklistEdit(item);
  };
  const duplicateChecklistItem = (item: ChecklistLibraryItem) => {
    const createdAt = now();
    updateSettings({ defaultChecklistItems: [{ ...item, id: id(), name: `${item.name} Copy`, createdAt, updatedAt: createdAt }, ...settings.defaultChecklistItems] });
  };
  const deleteChecklistItem = (itemId: string) => updateSettings({ defaultChecklistItems: settings.defaultChecklistItems.filter((item) => item.id !== itemId) });
  const addMasterCategory = () => {
    const createdAt = now();
    updateSettings({ masterCategories: [{ id: id(), name: "Kategori baru", type: "setup_budget", active: true, createdAt, updatedAt: createdAt }, ...settings.masterCategories] });
  };
  const updateMasterCategory = (categoryIdValue: string, patch: Partial<MasterCategory>) => updateSettings({ masterCategories: settings.masterCategories.map((category) => (category.id === categoryIdValue ? { ...category, ...patch, updatedAt: now() } : category)) });
  const deleteMasterCategory = (category: MasterCategory) => {
    const usedByChecklist = settings.defaultChecklistItems.some((item) => item.categoryId === category.id);
    const usedByProject = data.projects.some((project) => project.setupBudget.some((item) => item.categoryId === category.id));
    if (usedByChecklist || usedByProject) {
      window.alert("Kategori masih digunakan di checklist library atau project. Nonaktifkan kategori jika tidak ingin muncul di dropdown.");
      return;
    }
    updateSettings({ masterCategories: settings.masterCategories.filter((item) => item.id !== category.id) });
  };
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-bold">Settings / Master Data</h2>
      <LocalDataSettings data={data} selectedId={selectedId} createProject={createProject} exportBackup={exportBackup} importBackupFile={importBackupFile} clearAllLocalData={clearAllLocalData} resetDemo={resetDemo} />
      <div className="grid gap-4 rounded-lg border border-line bg-white p-5 shadow-soft md:grid-cols-2">
        <Input label="Consultant / company name" value={settings.consultantName} onChange={(value) => updateSettings({ consultantName: value })} />
        <Input label="Phone" value={settings.phone} onChange={(value) => updateSettings({ phone: value })} />
        <Input label="Email" value={settings.email} onChange={(value) => updateSettings({ email: value })} />
        <Input label="Default electricity tariff / kWh" type="number" value={settings.defaultElectricityTariff} onChange={(value) => updateSettings({ defaultElectricityTariff: Number(value) })} />
        <TextArea label="Address" value={settings.address} onChange={(value) => updateSettings({ address: value })} />
        <TextArea label="Default disclaimer" value={settings.pdf.disclaimer} onChange={(value) => updateSettings({ pdf: { ...settings.pdf, disclaimer: value } })} />
      </div>
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold">Default Checklist Library</h3>
            <p className="text-sm text-muted">Item di sini bisa diimpor ke Modal Awal / Setup Budget.</p>
          </div>
          <button className="h-10 rounded-md bg-sage px-3 text-sm font-medium text-white" onClick={addChecklistItem}>Add checklist item</button>
        </div>
        <div className="mt-4 grid gap-3">
          {settings.defaultChecklistItems.map((item) => {
            const isEditing = editingChecklistId === item.id && checklistDraft;
            const row = isEditing ? checklistDraft : item;
            return (
              <div key={item.id} className="grid gap-3 rounded-md bg-paper p-3 md:grid-cols-6">
                <Input label="Item name" value={row.name} disabled={!isEditing} onChange={(value) => setChecklistDraft(row ? { ...row, name: value } : null)} />
                <MasterCategorySelect value={row.categoryId} disabled={!isEditing} onChange={(value) => setChecklistDraft(row ? { ...row, categoryId: value } : null)} categories={setupCategories} />
                <Input label="Default estimated price" type="number" value={row.defaultEstimatedPrice} disabled={!isEditing} onChange={(value) => setChecklistDraft(row ? { ...row, defaultEstimatedPrice: Number(value) } : null)} />
                <Input label="Default quantity" type="number" value={row.defaultQuantity} disabled={!isEditing} onChange={(value) => setChecklistDraft(row ? { ...row, defaultQuantity: Number(value) } : null)} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.required} disabled={!isEditing} onChange={(event) => setChecklistDraft(row ? { ...row, required: event.target.checked } : null)} /> Required</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.active} disabled={!isEditing} onChange={(event) => setChecklistDraft(row ? { ...row, active: event.target.checked } : null)} /> Active</label>
                <TextArea label="Notes" value={row.notes} disabled={!isEditing} onChange={(value) => setChecklistDraft(row ? { ...row, notes: value } : null)} />
                <div className="flex flex-wrap gap-2 md:col-span-5">
                  {isEditing ? (
                    <>
                      <button className="h-10 rounded-md bg-ink px-3 text-sm font-medium text-white" onClick={saveChecklistDraft}>Save item</button>
                      <button className="h-10 rounded-md border border-line bg-white px-3 text-sm" onClick={() => { setEditingChecklistId(""); setChecklistDraft(null); }}>Cancel edit</button>
                    </>
                  ) : (
                    <>
                      <button className="h-10 rounded-md border border-line bg-white px-3 text-sm" onClick={() => startChecklistEdit(item)}>Edit item</button>
                      <button className="h-10 rounded-md border border-line bg-white px-3 text-sm" onClick={() => duplicateChecklistItem(item)}>Duplicate item</button>
                      <button className="h-10 rounded-md border border-line bg-white px-3 text-sm text-clay" onClick={() => deleteChecklistItem(item.id)}>Delete item</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold">Master Categories</h3>
            <p className="text-sm text-muted">Semua dropdown memakai kategori aktif dari daftar ini.</p>
          </div>
          <button className="h-10 rounded-md bg-sage px-3 text-sm font-medium text-white" onClick={addMasterCategory}>Add category</button>
        </div>
        <div className="mt-4 grid gap-3">
          {settings.masterCategories.map((category) => (
            <div key={category.id} className="grid gap-3 rounded-md bg-paper p-3 md:grid-cols-5">
              <Input label="Name" value={category.name} onChange={(value) => updateMasterCategory(category.id, { name: value })} />
              <Select label="Type" value={category.type} onChange={(value) => updateMasterCategory(category.id, { type: value as MasterCategoryType })} options={["setup_budget", "product", "equipment", "expense", "staff", "all"]} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={category.active} onChange={(event) => updateMasterCategory(category.id, { active: event.target.checked })} /> Active</label>
              <div className="text-xs leading-5 text-muted">ID: {category.id}</div>
              <button className="h-10 rounded-md border border-line bg-white px-3 text-sm text-clay" onClick={() => deleteMasterCategory(category)}>Delete category</button>
            </div>
          ))}
        </div>
      </div>
      <button className="h-10 w-fit rounded-md border border-line bg-white px-3 text-sm text-clay" onClick={resetDemo}>Reset local data ke demo</button>
    </div>
  );
}
