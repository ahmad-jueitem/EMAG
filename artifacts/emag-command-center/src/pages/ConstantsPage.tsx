import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Copy, Check, ArrowLeftRight } from "lucide-react";
import { CONSTANTS } from "@/data/formulas";
import KatexRenderer from "@/components/KatexRenderer";

const UNIT_CONVERSIONS = [
  {
    category: "Charge",
    conversions: [
      { from: "nC", to: "C", factor: 1e-9, fromLatex: "\\text{nC}", toLatex: "\\text{C}" },
      { from: "μC", to: "C", factor: 1e-6, fromLatex: "\\mu\\text{C}", toLatex: "\\text{C}" },
      { from: "mC", to: "C", factor: 1e-3, fromLatex: "\\text{mC}", toLatex: "\\text{C}" },
      { from: "pC", to: "C", factor: 1e-12, fromLatex: "\\text{pC}", toLatex: "\\text{C}" },
    ],
  },
  {
    category: "Length",
    conversions: [
      { from: "cm", to: "m", factor: 0.01, fromLatex: "\\text{cm}", toLatex: "\\text{m}" },
      { from: "mm", to: "m", factor: 0.001, fromLatex: "\\text{mm}", toLatex: "\\text{m}" },
      { from: "km", to: "m", factor: 1000, fromLatex: "\\text{km}", toLatex: "\\text{m}" },
      { from: "in", to: "m", factor: 0.0254, fromLatex: "\\text{in}", toLatex: "\\text{m}" },
      { from: "ft", to: "m", factor: 0.3048, fromLatex: "\\text{ft}", toLatex: "\\text{m}" },
    ],
  },
  {
    category: "Magnetic Flux Density",
    conversions: [
      { from: "T", to: "Gauss", factor: 1e4, fromLatex: "\\text{T}", toLatex: "\\text{Gauss}" },
      { from: "mT", to: "T", factor: 1e-3, fromLatex: "\\text{mT}", toLatex: "\\text{T}" },
      { from: "μT", to: "T", factor: 1e-6, fromLatex: "\\mu\\text{T}", toLatex: "\\text{T}" },
      { from: "Gauss", to: "T", factor: 1e-4, fromLatex: "\\text{Gauss}", toLatex: "\\text{T}" },
    ],
  },
  {
    category: "Frequency",
    conversions: [
      { from: "MHz", to: "Hz", factor: 1e6, fromLatex: "\\text{MHz}", toLatex: "\\text{Hz}" },
      { from: "GHz", to: "Hz", factor: 1e9, fromLatex: "\\text{GHz}", toLatex: "\\text{Hz}" },
      { from: "kHz", to: "Hz", factor: 1e3, fromLatex: "\\text{kHz}", toLatex: "\\text{Hz}" },
    ],
  },
  {
    category: "Electric Field",
    conversions: [
      { from: "V/cm", to: "V/m", factor: 100, fromLatex: "\\text{V/cm}", toLatex: "\\text{V/m}" },
      { from: "kV/m", to: "V/m", factor: 1e3, fromLatex: "\\text{kV/m}", toLatex: "\\text{V/m}" },
      { from: "MV/m", to: "V/m", factor: 1e6, fromLatex: "\\text{MV/m}", toLatex: "\\text{V/m}" },
    ],
  },
];

export default function ConstantsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [converterValues, setConverterValues] = useState<Record<string, string>>({});

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatValue = (v: number) => {
    if (Math.abs(v) < 1e-2 || Math.abs(v) > 1e6) return v.toExponential(6);
    return v.toPrecision(10).replace(/\.?0+$/, "");
  };

  const handleConvert = (catIdx: number, convIdx: number, value: string) => {
    const key = `${catIdx}-${convIdx}`;
    setConverterValues(prev => ({ ...prev, [key]: value }));
  };

  const getConverted = (catIdx: number, convIdx: number) => {
    const key = `${catIdx}-${convIdx}`;
    const val = parseFloat(converterValues[key] || "");
    if (isNaN(val)) return "";
    const conv = UNIT_CONVERSIONS[catIdx].conversions[convIdx];
    return (val * conv.factor).toExponential(6);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Constants & Unit Converter</h2>
        </div>
        <p className="text-slate-400 text-sm">All fundamental EMag constants and precision unit conversion tools.</p>
      </motion.div>

      {/* Constants Grid */}
      <div>
        <h3 className="text-slate-300 font-semibold text-sm mb-3">Fundamental Constants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(CONSTANTS).map(([key, c], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
                    <KatexRenderer latex={c.symbol} className="text-yellow-300 text-xs" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{c.name}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(c.value.toString(), key)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all"
                >
                  {copiedKey === key ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/20">
                <p className="text-white font-mono text-sm font-medium">{formatValue(c.value)}</p>
                <p className="text-slate-500 text-xs mt-0.5">{c.unit}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Unit Converter */}
      <div>
        <h3 className="text-slate-300 font-semibold text-sm mb-3">Unit Converter</h3>
        <div className="space-y-4">
          {UNIT_CONVERSIONS.map((cat, catIdx) => (
            <div key={catIdx} className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5">
              <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">{cat.category}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cat.conversions.map((conv, convIdx) => {
                  const key = `${catIdx}-${convIdx}`;
                  const converted = getConverted(catIdx, convIdx);
                  return (
                    <div key={convIdx} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                      <div className="flex items-center gap-2 mb-3">
                        <KatexRenderer latex={conv.fromLatex} className="text-blue-300 text-sm" />
                        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                        <KatexRenderer latex={conv.toLatex} className="text-cyan-300 text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={converterValues[key] || ""}
                          onChange={e => handleConvert(catIdx, convIdx, e.target.value)}
                          placeholder={`Enter ${conv.from}`}
                          className="flex-1 bg-slate-800 border border-slate-600/50 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50 transition-all"
                          step="any"
                        />
                        <span className="bg-slate-700/50 border border-slate-600/30 text-slate-400 text-xs px-2.5 py-2 rounded-lg flex items-center">
                          {conv.from}
                        </span>
                      </div>
                      {converted && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 flex items-center gap-2"
                        >
                          <span className="text-slate-500 text-xs">=</span>
                          <span className="text-cyan-300 font-mono text-sm font-medium">{converted}</span>
                          <span className="text-slate-500 text-xs">{conv.to}</span>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
