import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SolverPage from "@/pages/SolverPage";
import KnowledgePage from "@/pages/KnowledgePage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import QuizPage, { getAllMastery } from "@/pages/QuizPage";
import ConstantsPage from "@/pages/ConstantsPage";
import FieldViewerPage from "@/pages/FieldViewerPage";
import CoordTransformPage from "@/pages/CoordTransformPage";
import ExamPage from "@/pages/ExamPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ResourceVaultPage from "@/pages/ResourceVaultPage";
import "katex/dist/katex.min.css";

interface RecentSolver { id: string; name: string }

function App() {
  const [activeTab, setActiveTab] = useState("solver");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentSolvers, setRecentSolvers] = useState<RecentSolver[]>([]);
  const [quizMastery, setQuizMastery] = useState<Record<string, number>>(getAllMastery());
  const [jumpToSolver, setJumpToSolver] = useState<string | null>(null);

  // Refresh mastery from localStorage on tab focus
  useEffect(() => {
    const handler = () => setQuizMastery(getAllMastery());
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  const handleProblemUsed = useCallback((id: string, name: string) => {
    setRecentSolvers(prev => {
      const filtered = prev.filter(r => r.id !== id);
      return [{ id, name }, ...filtered].slice(0, 5);
    });
  }, []);

  const handleRecentClick = useCallback((id: string) => {
    setActiveTab("solver");
    setJumpToSolver(id);
    setTimeout(() => setJumpToSolver(null), 100);
  }, []);

  const handleMasteryChange = useCallback((mastery: Record<string, number>) => {
    setQuizMastery(mastery);
  }, []);

  const handleAnalyticsNavigate = useCallback((tab: string, jumpId?: string) => {
    setActiveTab(tab);
    if (tab === "solver" && jumpId) {
      setJumpToSolver(jumpId);
      setTimeout(() => setJumpToSolver(null), 100);
    }
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
        return <QuizPage onMasteryChange={handleMasteryChange} />;
      case "constants":
        return <ConstantsPage />;
      case "fieldviewer":
        return <FieldViewerPage />;
      case "coordtransform":
        return <CoordTransformPage />;
      case "exam":
        return <ExamPage />;
      case "analytics":
        return <AnalyticsPage onNavigate={handleAnalyticsNavigate} />;
      case "vault":
        return <ResourceVaultPage onNavigate={handleAnalyticsNavigate} />;
      default:
        return <SolverPage onProblemUsed={handleProblemUsed} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      {/* Subtle grid */}
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
        quizMastery={quizMastery}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/[0.07] bg-slate-900/60 backdrop-blur-xl flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-sm">Universal EMag Master Suite</h1>
            <p className="text-cyan-400 text-[10px] font-medium">Built by Ahmad Jueitem</p>
          </div>
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
