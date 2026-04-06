import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SolverPage from "@/pages/SolverPage";
import KnowledgePage from "@/pages/KnowledgePage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import QuizPage from "@/pages/QuizPage";
import ConstantsPage from "@/pages/ConstantsPage";
import "katex/dist/katex.min.css";

const PAGE_COMPONENTS: Record<string, React.ComponentType> = {
  solver: SolverPage,
  knowledge: KnowledgePage,
  flashcards: FlashcardsPage,
  quiz: QuizPage,
  constants: ConstantsPage,
};

function App() {
  const [activeTab, setActiveTab] = useState("solver");
  const [mobileOpen, setMobileOpen] = useState(false);

  const PageComponent = PAGE_COMPONENTS[activeTab] || SolverPage;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar (mobile) */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-white font-bold text-sm">EMag Command Center</h1>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
