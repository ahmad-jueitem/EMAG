import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SolverPage from "@/pages/SolverPage";
import KnowledgePage from "@/pages/KnowledgePage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import QuizPage from "@/pages/QuizPage";
import ConstantsPage from "@/pages/ConstantsPage";
import FieldViewerPage from "@/pages/FieldViewerPage";
import CoordTransformPage from "@/pages/CoordTransformPage";
import ExamPage from "@/pages/ExamPage";
import { SOLVER_PROBLEMS } from "@/data/formulas";
import "katex/dist/katex.min.css";

interface RecentSolver { id: string; name: string }

function App() {
  const [activeTab, setActiveTab] = useState("solver");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentSolvers, setRecentSolvers] = useState<RecentSolver[]>([]);

  const handleProblemUsed = useCallback((id: string, name: string) => {
    setRecentSolvers(prev => {
      const filtered = prev.filter(r => r.id !== id);
      return [{ id, name }, ...filtered].slice(0, 5);
    });
  }, []);

  // When user clicks a recent solver — switch to solver tab and pre-select
  const [jumpToSolver, setJumpToSolver] = useState<string | null>(null);

  const handleRecentClick = useCallback((id: string) => {
    setActiveTab("solver");
    setJumpToSolver(id);
    setTimeout(() => setJumpToSolver(null), 100);
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case "solver":
        return <SolverPage key={jumpToSolver ?? "solver"} onProblemUsed={handleProblemUsed} jumpTo={jumpToSolver} />;
      case "knowledge":
        return <KnowledgePage />;
      case "flashcards":
        return <FlashcardsPage />;
      case "quiz":
        return <QuizPage />;
      case "constants":
        return <ConstantsPage />;
      case "fieldviewer":
        return <FieldViewerPage />;
      case "coordtransform":
        return <CoordTransformPage />;
      case "exam":
        return <ExamPage />;
      default:
        return <SolverPage onProblemUsed={handleProblemUsed} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,179,237,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,179,237,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        recentSolvers={recentSolvers}
        onRecentClick={handleRecentClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/[0.07] bg-slate-900/60 backdrop-blur-xl flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-white font-bold text-sm">EMag Command Center</h1>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
