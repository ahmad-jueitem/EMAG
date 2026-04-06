import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, ChevronRight, ExternalLink } from "lucide-react";
import KatexRenderer from "@/components/KatexRenderer";
import { CHAPTERS } from "@/data/formulas";

const COLOR_MAP: Record<string, { badge: string; border: string; dot: string; glow: string }> = {
  blue: { badge: "bg-blue-500/20 text-blue-300 border-blue-500/30", border: "border-blue-500/20 hover:border-blue-500/40", dot: "bg-blue-400", glow: "shadow-blue-500/10" },
  cyan: { badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", border: "border-cyan-500/20 hover:border-cyan-500/40", dot: "bg-cyan-400", glow: "shadow-cyan-500/10" },
  violet: { badge: "bg-violet-500/20 text-violet-300 border-violet-500/30", border: "border-violet-500/20 hover:border-violet-500/40", dot: "bg-violet-400", glow: "shadow-violet-500/10" },
  green: { badge: "bg-green-500/20 text-green-300 border-green-500/30", border: "border-green-500/20 hover:border-green-500/40", dot: "bg-green-400", glow: "shadow-green-500/10" },
  orange: { badge: "bg-orange-500/20 text-orange-300 border-orange-500/30", border: "border-orange-500/20 hover:border-orange-500/40", dot: "bg-orange-400", glow: "shadow-orange-500/10" },
  red: { badge: "bg-red-500/20 text-red-300 border-red-500/30", border: "border-red-500/20 hover:border-red-500/40", dot: "bg-red-400", glow: "shadow-red-500/10" },
  yellow: { badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", border: "border-yellow-500/20 hover:border-yellow-500/40", dot: "bg-yellow-400", glow: "shadow-yellow-500/10" },
  pink: { badge: "bg-pink-500/20 text-pink-300 border-pink-500/30", border: "border-pink-500/20 hover:border-pink-500/40", dot: "bg-pink-400", glow: "shadow-pink-500/10" },
};

interface ChapterDetailProps {
  chapter: typeof CHAPTERS[0];
  onClose: () => void;
}

function ChapterDetail({ chapter, onClose }: ChapterDetailProps) {
  const colors = COLOR_MAP[chapter.color] || COLOR_MAP.blue;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-8 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700/50 p-6 flex items-start justify-between">
          <div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}>Chapter {chapter.number}</span>
            <h3 className="text-white font-bold text-lg mt-2">{chapter.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-slate-300 text-sm leading-relaxed">{chapter.summary}</p>

          <div>
            <h4 className="text-slate-200 font-semibold text-sm mb-3">Key Equations</h4>
            <div className="space-y-3">
              {chapter.keyEquations.map((eq, i) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-2">{eq.description}</p>
                  <div className="overflow-x-auto text-center">
                    <KatexRenderer latex={eq.latex} display className="text-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold text-sm mb-3">Key Terms</h4>
            <div className="flex flex-wrap gap-2">
              {chapter.terms.map((term, i) => (
                <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${colors.badge}`}>{term}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function KnowledgePage() {
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<typeof CHAPTERS[0] | null>(null);

  const filtered = CHAPTERS.filter(ch =>
    ch.title.toLowerCase().includes(search.toLowerCase()) ||
    ch.summary.toLowerCase().includes(search.toLowerCase()) ||
    ch.terms.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Knowledge Base</h2>
        </div>
        <p className="text-slate-400 text-sm">All chapters, formulas, and key concepts from your Electromagnetics textbook.</p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search chapters, equations, or terms..."
          className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Chapters", value: CHAPTERS.length },
          { label: "Key Equations", value: CHAPTERS.reduce((s, ch) => s + ch.keyEquations.length, 0) },
          { label: "Key Terms", value: CHAPTERS.reduce((s, ch) => s + ch.terms.length, 0) },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chapter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((chapter, i) => {
          const colors = COLOR_MAP[chapter.color] || COLOR_MAP.blue;
          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedChapter(chapter)}
              className={`
                bg-slate-800/60 border rounded-2xl p-5 cursor-pointer transition-all group
                ${colors.border} hover:bg-slate-800/80 shadow-lg ${colors.glow}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colors.badge}`}>
                  Chapter {chapter.number}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors group-hover:translate-x-0.5 duration-200" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{chapter.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">{chapter.summary}</p>

              {/* Preview equations */}
              <div className="space-y-2">
                {chapter.keyEquations.slice(0, 2).map((eq, ei) => (
                  <div key={ei} className="bg-slate-900/50 rounded-lg p-2.5">
                    <p className="text-slate-500 text-xs mb-1">{eq.description}</p>
                    <div className="overflow-x-auto">
                      <KatexRenderer latex={eq.latex} className="text-slate-300 text-sm" />
                    </div>
                  </div>
                ))}
                {chapter.keyEquations.length > 2 && (
                  <p className="text-slate-500 text-xs pl-1">+{chapter.keyEquations.length - 2} more equations</p>
                )}
              </div>

              {/* Terms preview */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {chapter.terms.slice(0, 3).map((term, ti) => (
                  <span key={ti} className="text-xs text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded">{term}</span>
                ))}
                {chapter.terms.length > 3 && (
                  <span className="text-xs text-slate-600">+{chapter.terms.length - 3}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chapter Detail Modal */}
      {selectedChapter && (
        <ChapterDetail chapter={selectedChapter} onClose={() => setSelectedChapter(null)} />
      )}
    </div>
  );
}
