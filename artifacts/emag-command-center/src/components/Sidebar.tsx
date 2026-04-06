import { motion } from "framer-motion";
import {
  Zap, BookOpen, Brain, FlaskConical, Calculator, X, ChevronRight
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const NAV_ITEMS = [
  { id: "solver", label: "Universal Solver", icon: Calculator, desc: "Step-by-step solutions" },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen, desc: "All formulas & theory" },
  { id: "flashcards", label: "Flashcards", icon: Brain, desc: "Active recall training" },
  { id: "quiz", label: "Auto-Quiz", icon: FlaskConical, desc: "Test your knowledge" },
  { id: "constants", label: "Constants & Units", icon: Zap, desc: "Converter & reference" },
];

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }: SidebarProps) {
  const handleNav = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full z-40 w-72
          bg-slate-900/95 border-r border-slate-700/50 backdrop-blur-xl
          flex flex-col transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">EMag Command</h1>
              <p className="text-blue-400 text-xs font-medium">Ultimate Center</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 pb-2">Modules</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNav(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group
                  ${isActive
                    ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                  ${isActive ? "bg-blue-500/30 text-blue-300" : "bg-slate-800 text-slate-500 group-hover:text-slate-300"}
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? "text-blue-200" : ""}`}>{item.label}</p>
                  <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" />}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-slate-400 text-xs">Based on Princess Sumaya University Electromagnetics I</p>
            <p className="text-blue-400 text-xs font-medium mt-1">Communication Engineering Dept.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
