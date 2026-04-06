import { useState } from "react";
import { motion } from "framer-motion";
import { Box, Zap } from "lucide-react";
import FieldViewer3D, { FieldMode } from "@/components/FieldViewer3D";
import KatexRenderer from "@/components/KatexRenderer";

const FIELD_INFO = {
  "electric-point": {
    title: "Point Charge Electric Field",
    formula: "\\mathbf{E} = \\frac{Q}{4\\pi\\varepsilon_0 r^2}\\hat{a}_r",
    desc: "The electric field of a point charge radiates radially outward (positive charge) or inward (negative charge). Field strength falls as 1/r².",
    controls: [
      { label: "Charge sign", key: "charge_sign", type: "toggle", options: [{ label: "+Q (positive)", value: "1" }, { label: "−Q (negative)", value: "-1" }] },
    ],
  },
  "electric-dipole": {
    title: "Electric Dipole",
    formula: "\\mathbf{E} = \\frac{1}{4\\pi\\varepsilon_0}\\left[\\frac{q}{r_1^2}\\hat{a}_{r_1} - \\frac{q}{r_2^2}\\hat{a}_{r_2}\\right]",
    desc: "A dipole consists of equal and opposite charges. Field lines emerge from +Q and terminate at −Q, forming characteristic closed loops far from the pair.",
    controls: [],
  },
  "magnetic-wire": {
    title: "Infinite Line Current — Magnetic Field",
    formula: "\\mathbf{H} = \\frac{I}{2\\pi\\rho}\\hat{a}_\\phi",
    desc: "By Ampere's law, an infinite current-carrying wire produces concentric circular magnetic field lines. The field strength decreases as 1/ρ from the wire.",
    controls: [],
  },
};

export default function FieldViewerPage() {
  const [mode, setMode] = useState<FieldMode>("electric-point");
  const [chargeSign, setChargeSign] = useState(1);

  const info = FIELD_INFO[mode];

  return (
    <div className="h-full flex flex-col gap-4 p-6 overflow-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Box className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">3D Field Visualizer</h2>
        </div>
        <p className="text-slate-400 text-sm">Interactive 3D electromagnetic field visualization. Orbit, zoom, and toggle vectors.</p>
      </motion.div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left — Info Panel */}
        <div className="lg:w-72 flex-shrink-0 space-y-4 overflow-auto">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-white font-bold text-base mb-3">{info.title}</h3>
            <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 mb-3 overflow-x-auto text-center">
              <KatexRenderer latex={info.formula} display className="text-slate-200" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{info.desc}</p>
          </motion.div>

          {/* Charge sign toggle (electric-point mode only) */}
          {mode === "electric-point" && (
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Charge</p>
              <div className="flex gap-2">
                {[{ label: "+Q", value: 1, color: "text-blue-300 bg-blue-500/20 border-blue-500/40" },
                  { label: "−Q", value: -1, color: "text-red-300 bg-red-500/20 border-red-500/40" }].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setChargeSign(opt.value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all
                      ${chargeSign === opt.value ? opt.color : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key observations */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Key Observations</p>
            {mode === "electric-point" && (
              <ul className="space-y-2 text-slate-300 text-xs">
                <li className="flex gap-2"><span className="text-blue-400">→</span> Field lines are radially symmetric</li>
                <li className="flex gap-2"><span className="text-blue-400">→</span> Density decreases with distance (1/r²)</li>
                <li className="flex gap-2"><span className="text-blue-400">→</span> Positive charge: lines radiate outward</li>
                <li className="flex gap-2"><span className="text-blue-400">→</span> Negative charge: lines point inward</li>
              </ul>
            )}
            {mode === "electric-dipole" && (
              <ul className="space-y-2 text-slate-300 text-xs">
                <li className="flex gap-2"><span className="text-purple-400">→</span> Lines emerge from red (−) charge</li>
                <li className="flex gap-2"><span className="text-purple-400">→</span> Lines terminate at blue (+) charge</li>
                <li className="flex gap-2"><span className="text-purple-400">→</span> Far field resembles 1/r³ dipole</li>
                <li className="flex gap-2"><span className="text-purple-400">→</span> E ⊥ equipotential surfaces</li>
              </ul>
            )}
            {mode === "magnetic-wire" && (
              <ul className="space-y-2 text-slate-300 text-xs">
                <li className="flex gap-2"><span className="text-violet-400">→</span> Circles centered on wire (φ̂ direction)</li>
                <li className="flex gap-2"><span className="text-violet-400">→</span> Right-hand rule: thumb = I, fingers = H</li>
                <li className="flex gap-2"><span className="text-violet-400">→</span> Field strength ∝ 1/ρ from wire</li>
                <li className="flex gap-2"><span className="text-violet-400">→</span> Wire shown in yellow (current in +ẑ)</li>
              </ul>
            )}
          </div>
        </div>

        {/* Right — 3D Viewer */}
        <div className="flex-1 min-h-0 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <FieldViewer3D
            mode={mode}
            charge={chargeSign}
            onModeChange={setMode}
          />
        </div>
      </div>
    </div>
  );
}
