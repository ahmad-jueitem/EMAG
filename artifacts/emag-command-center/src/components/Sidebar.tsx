import { motion } from "framer-motion";
import {
  Zap, BookOpen, Brain, FlaskConical, Calculator, X, ChevronRight,
  Box, ArrowLeftRight, Timer, Clock, TrendingUp, FolderOpen
} from "lucide-react";

const NAV_ITEMS = [
  { id: "solver", label: "Universal Solver", icon: Calculator, desc: "Step-by-step solutions" },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen, desc: "All formulas & theory" },
  { id: "flashcards", label: "Flashcards", icon: Brain, desc: "Active recall training" },
  { id: "quiz", label: "Pro Quiz", icon: FlaskConical, desc: "20Q per chapter · KaTeX reveal" },
  { id: "constants", label: "Constants & Units", icon: Zap, desc: "Converter & reference" },
];

const ADVANCED_ITEMS = [
  { id: "fieldviewer", label: "3D Field Visualizer", icon: Box, desc: "Interactive field lines" },
  { id: "coordtransform", label: "Coord Transformer", icon: ArrowLeftRight, desc: "Cartesian ↔ Cyl ↔ Sph" },
  { id: "exam", label: "Exam Mode", icon: Timer, desc: "20-min timed mock exam" },
];

const STUDY_ITEMS = [
  { id: "analytics", label: "Learning Analytics", icon: TrendingUp, desc: "Strengths · weakpoints · path" },
  { id: "vault", label: "Resource Vault", icon: FolderOpen, desc: "Worksheets 1–8 + solutions" },
];

// ─── Mastery ring component ───────────────────────────────────────────────────
function MasteryRing({ pct, size = 22 }: { pct: number; size?: number }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#eab308" : "#475569";
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={2.5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={2.5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// ─── Nav button — top-level component (not nested inside Sidebar) ─────────────
function NavButton({
  item, activeTab, onNav, masteryPct,
}: {
  item: typeof NAV_ITEMS[0];
  activeTab: string;
  onNav: (id: string) => void;
  masteryPct?: number;
}) {
  const Icon = item.icon;
  const isActive = activeTab === item.id;
  return (
    <motion.button
      onClick={() => onNav(item.id)}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group
        ${isActive
          ? "bg-blue-600/20 backdrop-blur-md border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/10"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
        }
      `}
    >
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
        ${isActive ? "bg-blue-500/30 text-blue-300" : "bg-white/[0.04] text-slate-500 group-hover:text-slate-300"}
      `}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? "text-blue-200" : ""}`}>{item.label}</p>
        <p className="text-xs text-slate-500 truncate">{item.desc}</p>
      </div>
      {masteryPct !== undefined && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <MasteryRing pct={masteryPct} />
          <span className={`text-xs font-bold ${masteryPct >= 70 ? "text-green-400" : masteryPct >= 40 ? "text-yellow-400" : "text-slate-600"}`}>
            {masteryPct}%
          </span>
        </div>
      )}
      {masteryPct === undefined && isActive && <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" />}
    </motion.button>
  );
}

// ─── Sidebar mastery chapter row ──────────────────────────────────────────────
function MasteryRow({ chapter, pct }: { chapter: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 px-3">
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-slate-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  recentSolvers: { id: string; name: string }[];
  onRecentClick: (id: string) => void;
  quizMastery: Record<string, number>;
}

export default function Sidebar({
  activeTab, setActiveTab, mobileOpen, setMobileOpen,
  recentSolvers, onRecentClick, quizMastery,
}: SidebarProps) {
  const handleNav = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const safeRecents = Array.isArray(recentSolvers) ? recentSolvers : [];
  const safeQuizMastery = quizMastery ?? {};
  const masteryValues = Object.values(safeQuizMastery);
  const overallMastery = masteryValues.length > 0
    ? Math.round(masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length)
    : 0;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — glassmorphism */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full z-40 w-72
          bg-slate-900/70 backdrop-blur-2xl border-r border-white/[0.08]
          flex flex-col transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04), 4px 0 24px rgba(0,0,0,0.4)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">EMAG Student</h1>
              <p className="text-blue-400 text-xs font-medium">Toolkit</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.07] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mastery overview pill */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.06]">
            <MasteryRing pct={overallMastery} size={28} />
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs">Overall Mastery</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                    style={{ width: `${overallMastery}%` }}
                  />
                </div>
                <span className="text-orange-400 font-bold text-xs">{overallMastery}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
          {/* Core modules */}
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 pb-2">Core Modules</p>
            <div className="space-y-1">
              {NAV_ITEMS.map(item => (
                <NavButton
                  key={item.id} item={item} activeTab={activeTab} onNav={handleNav}
                  masteryPct={item.id === "quiz" ? overallMastery : undefined}
                />
              ))}
            </div>
          </div>

          {/* Advanced tools */}
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 pb-2">Advanced Tools</p>
            <div className="space-y-1">
              {ADVANCED_ITEMS.map(item => (
                <NavButton key={item.id} item={item} activeTab={activeTab} onNav={handleNav} />
              ))}
            </div>
          </div>

          {/* Study Intelligence */}
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 pb-2">Study Intelligence</p>
            <div className="space-y-1">
              {STUDY_ITEMS.map(item => (
                <NavButton key={item.id} item={item} activeTab={activeTab} onNav={handleNav} />
              ))}
            </div>
          </div>

          {/* Mastery breakdown (compact) */}
          {overallMastery > 0 && (
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 pb-2 flex items-center gap-1.5">
                <Brain className="w-3 h-3" /> Chapter Mastery
              </p>
              <div className="space-y-1.5 px-3">
                {["ch1","ch2","ch3","ch4","ch5","ch6","ch7","ch8"].map((id, i) => {
                  const pct = safeQuizMastery[id] ?? 0;
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs w-8">Ch{i+1}</span>
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-slate-600"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-slate-600 text-xs w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recently Used Solvers */}
          {safeRecents.length > 0 && (
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 pb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Recently Used
              </p>
              <div className="space-y-1">
                {safeRecents.slice(0, 4).map((item, i) => (
                  <motion.button
                    key={`${item.id}-${i}`}
                    onClick={() => { onRecentClick(item.id); setMobileOpen(false); }}
                    whileHover={{ x: 2 }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40 group-hover:bg-blue-400 transition-colors" />
                    <span className="text-xs truncate">{item.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] space-y-2">
          <div className="bg-white/[0.03] backdrop-blur-md rounded-xl p-3 border border-white/[0.06]">
            <p className="text-slate-400 text-xs">EMAG Student Toolkit</p>
            <p className="text-blue-400 text-xs font-medium mt-0.5">Princess Sumaya University</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 backdrop-blur-md rounded-xl p-3 border border-blue-500/20">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest">Architect</p>
            <p className="text-cyan-300 text-xs font-bold mt-0.5">Built by Ahmad Jueitem</p>
          </div>
        </div>
      </aside>
    </>
  );
}
