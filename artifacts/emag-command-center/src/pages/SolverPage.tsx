import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, ChevronDown, Play, RotateCcw, Info } from "lucide-react";
import KatexRenderer from "@/components/KatexRenderer";
import { SOLVER_PROBLEMS } from "@/data/formulas";

const CATEGORIES = ["All", "Electrostatics", "Magnetostatics", "Materials", "Energy", "Wave Propagation", "Transmission Lines", "Magnetic Forces"];

export default function SolverPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProblem, setSelectedProblem] = useState(SOLVER_PROBLEMS[0]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ outputs: Record<string, number>; steps: string[] } | null>(null);
  const [error, setError] = useState("");

  const filtered = selectedCategory === "All"
    ? SOLVER_PROBLEMS
    : SOLVER_PROBLEMS.filter(p => p.category === selectedCategory);

  const handleSolve = () => {
    setError("");
    setResult(null);

    const numInputs: Record<string, number> = {};
    for (const inp of selectedProblem.inputs) {
      const val = parseFloat(inputs[inp.key] || "");
      if (isNaN(val)) {
        setError(`Please provide a valid number for "${inp.label}"`);
        return;
      }
      numInputs[inp.key] = val;
    }

    try {
      const outputs = selectedProblem.solve(numInputs);
      const steps = selectedProblem.steps(numInputs, outputs);
      setResult({ outputs, steps });
    } catch {
      setError("Calculation error. Please check your inputs.");
    }
  };

  const handleReset = () => {
    setInputs({});
    setResult(null);
    setError("");
  };

  const handleSelectProblem = (problem: typeof SOLVER_PROBLEMS[0]) => {
    setSelectedProblem(problem);
    setInputs({});
    setResult(null);
    setError("");
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Calculator className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Universal Solver</h2>
        </div>
        <p className="text-slate-400 text-sm">Select a problem type, enter known values, and get step-by-step solutions.</p>
      </motion.div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${selectedCategory === cat
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Problem List */}
        <div className="lg:w-64 flex-shrink-0">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Problem Types</p>
          <div className="space-y-1.5">
            {filtered.map(problem => (
              <button
                key={problem.id}
                onClick={() => handleSelectProblem(problem)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all
                  ${selectedProblem.id === problem.id
                    ? "bg-blue-600/20 border border-blue-500/40 text-blue-300"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
              >
                <span className="text-xs font-medium block text-slate-500 mb-0.5">{problem.category}</span>
                {problem.name}
              </button>
            ))}
          </div>
        </div>

        {/* Solver Panel */}
        <div className="flex-1 space-y-5">
          {/* Formula Display */}
          <motion.div
            key={selectedProblem.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold">{selectedProblem.name}</h3>
                <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">{selectedProblem.category}</span>
              </div>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-slate-700/30 overflow-x-auto">
              <KatexRenderer latex={selectedProblem.latexTemplate} display className="text-slate-200" />
            </div>
          </motion.div>

          {/* Input Fields */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h4 className="text-slate-300 font-medium text-sm mb-4">Enter Known Values</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedProblem.inputs.map(inp => (
                <div key={inp.key}>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">{inp.label}</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={inputs[inp.key] || ""}
                      onChange={e => setInputs(prev => ({ ...prev, [inp.key]: e.target.value }))}
                      placeholder={inp.placeholder}
                      className="flex-1 bg-slate-900/80 border border-slate-600/50 text-slate-200 text-sm rounded-l-lg px-3 py-2.5 focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 transition-all"
                      step="any"
                    />
                    {inp.unit && (
                      <span className="bg-slate-700/50 border border-l-0 border-slate-600/50 text-slate-400 text-xs px-3 py-2.5 rounded-r-lg flex items-center font-medium">
                        {inp.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-3 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSolve}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 text-sm"
              >
                <Play className="w-4 h-4" />
                Solve Step by Step
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Solution Steps */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-800/60 border border-green-500/20 rounded-2xl p-5"
              >
                <h4 className="text-green-400 font-semibold text-sm mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Step-by-Step Solution
                </h4>

                <div className="space-y-4">
                  {result.steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex gap-3 ${i === result.steps.length - 1 ? "bg-green-500/10 border border-green-500/20 rounded-xl p-3" : ""}`}
                    >
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5
                        ${i === result.steps.length - 1 ? "bg-green-500/30 text-green-300" : "bg-slate-700 text-slate-400"}
                      `}>
                        {i + 1}
                      </div>
                      <div className="flex-1 overflow-x-auto py-1">
                        <KatexRenderer latex={step} display className="text-slate-200" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProblem.outputs.map(out => (
                    <div key={out.key} className="bg-slate-900/60 border border-slate-600/30 rounded-xl p-3">
                      <p className="text-slate-500 text-xs mb-1">{out.label}</p>
                      <p className="text-white font-mono font-bold text-lg">
                        {result.outputs[out.key]?.toExponential(4)}
                        {out.unit && <span className="text-slate-400 font-normal text-sm ml-1">{out.unit}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
