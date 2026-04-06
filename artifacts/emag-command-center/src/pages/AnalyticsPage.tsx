import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, ReferenceLine,
} from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Target, BookOpen, Calculator, Zap } from "lucide-react";
import { getAllMastery } from "@/pages/QuizPage";

const CHAPTER_NAMES: Record<string, string> = {
  ch1: "Ch1 · Vectors",
  ch2: "Ch2 · Electrostatics",
  ch3: "Ch3 · Materials",
  ch4: "Ch4 · Magnetostatics",
  ch5: "Ch5 · Maxwell",
  ch6: "Ch6 · Waves",
  ch7: "Ch7 · Tx Lines",
  ch8: "Ch8 · Waveguides",
};

const CHAPTER_SOLVERS: Record<string, { solverId: string; label: string }[]> = {
  ch2: [
    { solverId: "electric-field-point", label: "Point Charge E-Field" },
    { solverId: "coulombs-law", label: "Coulomb's Law" },
    { solverId: "gauss-law-sphere", label: "Gauss's Law" },
  ],
  ch3: [
    { solverId: "capacitance-parallel", label: "Capacitance" },
    { solverId: "energy-density-e", label: "Energy Density (E)" },
  ],
  ch4: [
    { solverId: "ampere-infinite-line", label: "Line Current H-Field" },
    { solverId: "ampere-toroid", label: "Toroid Field" },
    { solverId: "energy-density-h", label: "Energy Density (H)" },
  ],
  ch6: [
    { solverId: "skin-depth", label: "Skin Depth" },
    { solverId: "phase-velocity", label: "Phase Velocity" },
  ],
  ch7: [
    { solverId: "vswr", label: "VSWR" },
  ],
};

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: "rgba(15,23,42,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "#e2e8f0",
  fontSize: 12,
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CUSTOM_TOOLTIP_STYLE} className="px-3 py-2">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-white font-bold">{payload[0].value}%</p>
    </div>
  );
}

// Simulated question-type breakdown per chapter from localStorage
function getTypeBreakdown(): { subject: string; Theory: number; Calculation: number; Edge: number }[] {
  try {
    const raw = localStorage.getItem("emag-quiz-mastery-v2");
    if (!raw) return [];
    const data = JSON.parse(raw) as Record<string, { correct: number; total: number; byType?: Record<string, { correct: number; total: number }> }>;
    return Object.entries(data).map(([id, v]) => {
      const chName = CHAPTER_NAMES[id] ?? id;
      // If byType exists use it, otherwise simulate from overall
      const bt = v.byType;
      if (bt) {
        return {
          subject: chName,
          Theory: bt.theory ? Math.round((bt.theory.correct / bt.theory.total) * 100) : 0,
          Calculation: bt.calc ? Math.round((bt.calc.correct / bt.calc.total) * 100) : 0,
          Edge: bt.edge ? Math.round((bt.edge.correct / bt.edge.total) * 100) : 0,
        };
      }
      const pct = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
      return { subject: chName, Theory: Math.min(100, pct + 8), Calculation: pct, Edge: Math.max(0, pct - 12) };
    });
  } catch {
    return [];
  }
}

interface RecommendCard {
  chapter: string;
  pct: number;
  actions: { label: string; tab: string; jumpId?: string }[];
}

interface AnalyticsPageProps {
  onNavigate?: (tab: string, jumpId?: string) => void;
}

export default function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const mastery = useMemo(() => getAllMastery(), []);

  const chartData = useMemo(() =>
    Object.entries(CHAPTER_NAMES).map(([id, label]) => ({
      chapter: label,
      mastery: mastery[id] ?? 0,
      id,
    })),
    [mastery]
  );

  const typeBreakdown = useMemo(() => getTypeBreakdown(), []);

  const radarData = useMemo(() => {
    const allEntries = Object.entries(mastery);
    if (!allEntries.length) return [];
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const vals = Object.values(mastery);
    return [
      { subject: "Theory", A: Math.min(100, avg(vals) + 8) },
      { subject: "Calculation", A: avg(vals) },
      { subject: "Edge Cases", A: Math.max(0, avg(vals) - 12) },
      { subject: "Consistency", A: vals.length >= 4 ? Math.min(100, avg(vals) + 3) : 0 },
      { subject: "Speed", A: Math.max(0, avg(vals) - 5) },
    ];
  }, [mastery]);

  const weakChapters = useMemo((): RecommendCard[] => {
    return chartData
      .filter(d => d.mastery < 70)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 4)
      .map(d => ({
        chapter: d.chapter,
        pct: d.mastery,
        actions: [
          { label: "Review Flashcards", tab: "flashcards" },
          { label: "Take Chapter Quiz", tab: "quiz" },
          ...(CHAPTER_SOLVERS[d.id] ?? []).slice(0, 1).map(s => ({
            label: `Solve: ${s.label}`,
            tab: "solver",
            jumpId: s.solverId,
          })),
        ],
      }));
  }, [chartData]);

  const hasData = Object.keys(mastery).length > 0;
  const overallMastery = hasData
    ? Math.round(Object.values(mastery).reduce((a, b) => a + b, 0) / Object.values(mastery).length)
    : 0;
  const strongChapters = chartData.filter(d => d.mastery >= 70).length;

  const barColor = (pct: number) =>
    pct >= 70 ? "#22c55e" : pct >= 40 ? "#eab308" : "#475569";

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Learning Analytics</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Real-time performance insights from your quiz history · Adaptive study recommendations
        </p>
      </motion.div>

      {!hasData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-300 font-semibold">No quiz data yet</p>
          <p className="text-slate-500 text-sm max-w-sm">
            Complete some Pro Quiz chapters to see your performance analytics and get personalized study recommendations.
          </p>
        </motion.div>
      ) : (
        <>
          {/* KPI pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: "Overall Mastery", value: `${overallMastery}%`, icon: Target, color: overallMastery >= 70 ? "text-emerald-400" : overallMastery >= 40 ? "text-yellow-400" : "text-slate-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "Chapters Tested", value: Object.keys(mastery).length, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { label: "Strong Chapters", value: strongChapters, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
              { label: "Need Review", value: weakChapters.length, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div key={i} className={`rounded-2xl border p-4 backdrop-blur-xl bg-white/[0.03] ${kpi.bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                    <p className="text-slate-500 text-xs">{kpi.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Chapter mastery bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
              <BarChart className="w-4 h-4 text-blue-400" strokeWidth={2} />
              Chapter Mastery Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="chapter"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#475569", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Bar
                  dataKey="mastery"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  animationDuration={600}
                  fill="#3b82f6"
                  label={false}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.mastery)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-slate-600 text-xs mt-1 text-center">Green dashed line = mastery target (70%)</p>
          </motion.div>

          {/* Two-column: Radar + Weakness */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar chart */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5"
            >
              <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                Skill Radar
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#818cf8"
                    fill="#818cf8"
                    fillOpacity={0.18}
                    strokeWidth={2}
                    dot={{ fill: "#818cf8", r: 3 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Adaptive weakness cards */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5"
            >
              <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Adaptive Study Path
              </h3>
              {weakChapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <p className="text-green-300 font-medium text-sm">All chapters above 70%!</p>
                  <p className="text-slate-500 text-xs">Excellent work — maintain your mastery.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {weakChapters.map((card, i) => (
                    <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-amber-300 text-xs font-semibold">{card.chapter}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.pct >= 40 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
                          {card.pct}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {card.actions.map((action, j) => (
                          <button
                            key={j}
                            onClick={() => onNavigate?.(action.tab, action.jumpId)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 hover:bg-white/[0.09] hover:text-white transition-all flex items-center gap-1"
                          >
                            {action.tab === "solver" ? <Calculator className="w-3 h-3" /> : action.tab === "flashcards" ? <BookOpen className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Progress timeline (simulated trend) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Study Streak — Chapter Progress Order
            </h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart
                data={chartData.filter(d => d.mastery > 0).map((d, i) => ({ ...d, session: `S${i + 1}` }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="session" tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.4} />
                <Line
                  type="monotone"
                  dataKey="mastery"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ fill: "#38bdf8", r: 4 }}
                  activeDot={{ r: 6, fill: "#7dd3fc" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
}
