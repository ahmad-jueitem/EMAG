import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, CheckCircle, XCircle, RotateCcw, Trophy,
  BookOpen, ChevronDown, Zap, Calculator, Lightbulb, Brain,
  ChevronRight,
} from "lucide-react";
import KatexRenderer from "@/components/KatexRenderer";
import { CHAPTERS } from "@/data/formulas";
import {
  ALL_QUIZ_QUESTIONS, QUIZ_QUESTIONS_BY_CHAPTER, type QuizQuestion, type QuizType,
} from "@/data/quiz-data";

// ─── Mastery storage helpers ──────────────────────────────────────────────────
const STORAGE_KEY = "emag-quiz-mastery-v2";

interface MasteryRecord {
  [chapterId: string]: {
    answered: string[];   // question IDs answered correctly
    attempted: string[];  // all question IDs attempted
  };
}

function loadMastery(): MasteryRecord {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}

function saveMastery(m: MasteryRecord) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
}

export function getMasteryPercent(chapterId: string): number {
  const m = loadMastery();
  const ch = m[chapterId];
  if (!ch) return 0;
  return Math.round((ch.answered.length / 20) * 100);
}

export function getAllMastery(): Record<string, number> {
  const out: Record<string, number> = {};
  CHAPTERS.forEach(ch => { out[ch.id] = getMasteryPercent(ch.id); });
  return out;
}

function recordAnswer(chapterId: string, questionId: string, isCorrect: boolean) {
  const m = loadMastery();
  if (!m[chapterId]) m[chapterId] = { answered: [], attempted: [] };
  if (!m[chapterId].attempted.includes(questionId)) {
    m[chapterId].attempted.push(questionId);
  }
  if (isCorrect && !m[chapterId].answered.includes(questionId)) {
    m[chapterId].answered.push(questionId);
  }
  saveMastery(m);
}

// ─── Type badge component ─────────────────────────────────────────────────────
function TypeBadge({ type }: { type: QuizType }) {
  const cfg = {
    theory: { label: "Theory", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", Icon: Brain },
    calculation: { label: "Calculation", color: "bg-orange-500/20 text-orange-300 border-orange-500/30", Icon: Calculator },
    edge: { label: "Edge Case", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", Icon: Lightbulb },
  }[type];
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

// ─── Solution reveal component ────────────────────────────────────────────────
function SolutionReveal({ question, isCorrect }: { question: QuizQuestion; isCorrect: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl overflow-hidden border ${isCorrect ? "bg-green-500/[0.07] border-green-500/20" : "bg-amber-500/[0.07] border-amber-500/20"}`}>
      {/* Explanation */}
      <div className="p-4">
        <p className={`text-sm font-semibold mb-1.5 flex items-center gap-2 ${isCorrect ? "text-green-400" : "text-amber-400"}`}>
          {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {isCorrect ? "Correct!" : "Incorrect — Study this"}
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">{question.explanation}</p>
      </div>

      {/* Step-by-step LaTeX toggle */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-slate-400 hover:text-white text-xs font-semibold transition-colors hover:bg-white/[0.03]"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Step-by-Step Solution (KaTeX)
          <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5"
            >
              <div className="p-4 space-y-3">
                {question.latexSolution.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 overflow-x-auto bg-slate-950/40 rounded-lg px-3 py-2 border border-white/[0.05]">
                      <KatexRenderer latex={step} display className="text-slate-200 text-sm" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Quiz results screen ──────────────────────────────────────────────────────
function ResultsScreen({
  questions, answers, score,
  onReset, onRetakeWrong,
}: {
  questions: QuizQuestion[];
  answers: (number | null)[];
  score: number;
  onReset: () => void;
  onRetakeWrong: (wrongQs: QuizQuestion[]) => void;
}) {
  const pct = Math.round((score / questions.length) * 100);
  const grade =
    pct >= 90 ? { label: "Excellent", color: "text-green-400", emoji: "🏆", bg: "bg-green-500/10 border-green-500/20" } :
    pct >= 75 ? { label: "Good Work", color: "text-blue-400", emoji: "⚡", bg: "bg-blue-500/10 border-blue-500/20" } :
    pct >= 60 ? { label: "Adequate", color: "text-yellow-400", emoji: "📚", bg: "bg-yellow-500/10 border-yellow-500/20" } :
               { label: "Needs Review", color: "text-red-400", emoji: "🔄", bg: "bg-red-500/10 border-red-500/20" };

  const wrongQs = questions.filter((_, i) => answers[i] !== questions[i].correct);

  // Type breakdown
  const byType = ["theory", "calculation", "edge"] as QuizType[];
  const typeStats = byType.map(t => ({
    type: t,
    total: questions.filter(q => q.type === t).length,
    correct: questions.filter((q, i) => q.type === t && answers[i] === q.correct).length,
  }));

  return (
    <div className="h-full flex flex-col gap-5 p-6 overflow-auto">
      {/* Score card */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className={`rounded-2xl border p-6 ${grade.bg}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">{grade.emoji} {grade.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-6xl font-black font-mono ${grade.color}`}>{score}</span>
                <span className="text-slate-500 text-2xl font-bold">/ {questions.length}</span>
              </div>
              <p className="text-slate-400 text-sm mt-1">{pct}% correct</p>
            </div>
            <div className="space-y-2 text-right">
              {typeStats.map(t => (
                <div key={t.type} className="flex items-center gap-2 justify-end">
                  <TypeBadge type={t.type} />
                  <span className="text-white font-mono text-sm">{t.correct}/{t.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={onReset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white text-sm font-medium transition-all">
          <RotateCcw className="w-4 h-4" /> New Quiz
        </button>
        {wrongQs.length > 0 && (
          <button onClick={() => onRetakeWrong(wrongQs)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 text-sm font-medium transition-all">
            <Brain className="w-4 h-4" /> Retry {wrongQs.length} Wrong
          </button>
        )}
      </div>

      {/* Question review */}
      <div className="space-y-3">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Detailed Review</p>
        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.correct;
          return (
            <div key={i} className={`rounded-2xl border overflow-hidden ${isCorrect ? "border-green-500/15" : "border-red-500/20"}`}>
              <div className="flex items-start gap-3 p-4 bg-white/[0.02]">
                {isCorrect
                  ? <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 items-center mb-1 flex-wrap">
                    <TypeBadge type={q.type} />
                    <span className="text-slate-500 text-xs">Q{i + 1}</span>
                  </div>
                  <p className="text-slate-300 text-sm font-medium mb-1.5">{q.question}</p>
                  {!isCorrect && answers[i] !== null && (
                    <p className="text-red-400 text-xs">Your answer: {q.options[answers[i]!]}</p>
                  )}
                </div>
              </div>
              <SolutionReveal question={q} isCorrect={isCorrect} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Setup screen ─────────────────────────────────────────────────────────────
function SetupScreen({
  onStart, mastery,
}: {
  onStart: (chapter: string, type: "all" | QuizType, count: number, questions: QuizQuestion[]) => void;
  mastery: Record<string, number>;
}) {
  const [chapter, setChapter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | QuizType>("all");
  const [count, setCount] = useState(20);

  const pool = (chapter === "all" ? ALL_QUIZ_QUESTIONS : (QUIZ_QUESTIONS_BY_CHAPTER[chapter] ?? []))
    .filter(q => typeFilter === "all" || q.type === typeFilter);

  const handleStart = () => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
    onStart(chapter, typeFilter, count, shuffled);
  };

  const overallMastery = Math.round(
    Object.values(mastery).reduce((a, b) => a + b, 0) / Object.keys(mastery).length
  );

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <FlaskConical className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Pro Quiz</h2>
        </div>
        <p className="text-slate-400 text-sm">
          {ALL_QUIZ_QUESTIONS.length} questions across 8 chapters — 5 Theory, 10 Calculation, 5 Edge-Case each.
          Full KaTeX step-by-step solution reveal. Progress saved automatically.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Config */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm">Quiz Settings</h3>

            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">Chapter</label>
              <select
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-600/40 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500/50"
              >
                <option value="all">All Chapters (Mixed)</option>
                {CHAPTERS.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    Ch {ch.number}: {ch.title} — {mastery[ch.id] ?? 0}% mastered
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">Question Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["all", "theory", "calculation", "edge"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all capitalize
                      ${typeFilter === t
                        ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                  >
                    {t === "all" ? "All Types" : t === "edge" ? "Edge Case" : t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">
                Questions: {Math.min(count, pool.length)} of {pool.length} available
              </label>
              <input
                type="range" min={5} max={Math.min(20, pool.length)} step={5}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-slate-600 text-xs mt-1">
                <span>5</span><span>10</span><span>15</span><span>20</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={pool.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-600/30 text-sm disabled:opacity-40"
            >
              <FlaskConical className="w-4 h-4" />
              Start {Math.min(count, pool.length)}-Question Quiz
            </button>
          </div>

          {/* Overall stats */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Your Progress</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${overallMastery}%` }} />
              </div>
              <span className="text-orange-400 font-bold text-sm">{overallMastery}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Questions", value: ALL_QUIZ_QUESTIONS.length },
                { label: "Chapters", value: 8 },
                { label: "Mastered", value: `${overallMastery}%` },
              ].map((s, i) => (
                <div key={i} className="bg-slate-800/40 rounded-xl p-2">
                  <p className="text-white font-bold text-base">{s.value}</p>
                  <p className="text-slate-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chapter mastery grid */}
        <div className="lg:col-span-2">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 h-full">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">Chapter Mastery</p>
            <div className="space-y-3">
              {CHAPTERS.map(ch => {
                const pct = mastery[ch.id] ?? 0;
                return (
                  <div key={ch.id} className="flex items-center gap-3">
                    <button
                      onClick={() => { setChapter(ch.id); setTypeFilter("all"); setCount(20); }}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm truncate font-medium">Ch {ch.number}: {ch.title}</span>
                        <span className={`text-xs font-bold ml-2 flex-shrink-0 ${pct >= 70 ? "text-green-400" : pct >= 40 ? "text-yellow-400" : "text-slate-500"}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className={`h-full rounded-full ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-slate-600"}`}
                        />
                      </div>
                    </button>
                    <button
                      onClick={() => { setChapter(ch.id); handleStart(); }}
                      className="flex-shrink-0 text-slate-600 hover:text-orange-400 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main QuizPage ─────────────────────────────────────────────────────────────
export default function QuizPage({ onMasteryChange }: { onMasteryChange?: (mastery: Record<string, number>) => void }) {
  const [stage, setStage] = useState<"setup" | "active" | "results">("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [mastery, setMastery] = useState<Record<string, number>>(getAllMastery());
  const [activeChapter, setActiveChapter] = useState("all");

  const refreshMastery = useCallback(() => {
    const m = getAllMastery();
    setMastery(m);
    onMasteryChange?.(m);
  }, [onMasteryChange]);

  const handleStart = useCallback((_chapter: string, _type: string, _count: number, selectedQs: QuizQuestion[]) => {
    setActiveChapter(_chapter);
    setQuestions(selectedQs);
    setAnswers(new Array(selectedQs.length).fill(null));
    setCurrentQ(0);
    setRevealed(false);
    setScore(0);
    setStage("active");
  }, []);

  const handleAnswer = (idx: number) => {
    if (revealed) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
    setRevealed(true);
    const q = questions[currentQ];
    const isCorrect = idx === q.correct;
    if (isCorrect) setScore(s => s + 1);
    recordAnswer(q.chapter, q.id, isCorrect);
    refreshMastery();
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(i => i + 1);
      setRevealed(false);
    } else {
      setStage("results");
    }
  };

  const handleReset = () => {
    setStage("setup");
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
    setRevealed(false);
    setScore(0);
  };

  const handleRetakeWrong = (wrongQs: QuizQuestion[]) => {
    const shuffled = [...wrongQs].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
    setCurrentQ(0);
    setRevealed(false);
    setScore(0);
    setStage("active");
  };

  // Load mastery on mount
  useEffect(() => { refreshMastery(); }, [refreshMastery]);

  if (stage === "setup") {
    return <SetupScreen onStart={handleStart} mastery={mastery} />;
  }

  if (stage === "results") {
    return (
      <ResultsScreen
        questions={questions}
        answers={answers}
        score={score}
        onReset={handleReset}
        onRetakeWrong={handleRetakeWrong}
      />
    );
  }

  // ── Active quiz ──────────────────────────────────────────────────────────────
  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;
  const progressAfter = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="h-full flex flex-col gap-4 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-white font-semibold text-sm">
              Question {currentQ + 1} <span className="text-slate-500">of {questions.length}</span>
            </p>
            <p className="text-slate-500 text-xs">Score: {score} correct so far</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TypeBadge type={q.type} />
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-300 font-bold text-sm">{score}</span>
          <button onClick={handleReset} className="text-slate-600 hover:text-slate-400 ml-2">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
          animate={{ width: `${revealed ? progressAfter : progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question dots */}
      <div className="flex gap-1 flex-wrap">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < currentQ ? (answers[i] === questions[i].correct ? "bg-green-500" : "bg-red-500") :
              i === currentQ ? "bg-orange-400 w-4" : "bg-slate-700"
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          className="flex-1 flex flex-col gap-4"
        >
          {/* Question card */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex gap-3 items-center mb-3">
              <TypeBadge type={q.type} />
              <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
                {CHAPTERS.find(c => c.id === q.chapter)?.title ?? q.chapter}
              </span>
            </div>
            <h3 className="text-white font-semibold text-base leading-relaxed">{q.question}</h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((option, i) => {
              let classes = "bg-white/[0.02] border-white/8 text-slate-300 hover:bg-white/[0.06] hover:border-white/20 hover:text-white";
              if (revealed) {
                if (i === q.correct) classes = "bg-green-500/15 border-green-500/50 text-green-200";
                else if (i === answers[currentQ] && i !== q.correct) classes = "bg-red-500/15 border-red-500/40 text-red-300";
                else classes = "bg-slate-800/30 border-slate-700/20 text-slate-600";
              }
              return (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={revealed}
                  whileHover={!revealed ? { x: 3 } : {}}
                  whileTap={!revealed ? { scale: 0.99 } : {}}
                  className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 disabled:cursor-default ${classes}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${revealed && i === q.correct ? "bg-green-500 text-white" :
                      revealed && i === answers[currentQ] && i !== q.correct ? "bg-red-500 text-white" :
                      "bg-slate-700/60 text-slate-400"}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm font-medium flex-1">{option}</span>
                  {revealed && i === q.correct && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                  {revealed && i === answers[currentQ] && i !== q.correct && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {/* Solution reveal */}
          <AnimatePresence>
            {revealed && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <SolutionReveal question={q} isCorrect={answers[currentQ] === q.correct} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {revealed && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30"
            >
              {currentQ < questions.length - 1 ? "Next Question →" : "View Results"}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
