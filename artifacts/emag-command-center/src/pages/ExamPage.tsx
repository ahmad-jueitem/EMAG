import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Trophy, AlertCircle, CheckCircle, XCircle, RotateCcw, Play, BookOpen } from "lucide-react";
import KatexRenderer from "@/components/KatexRenderer";
import { QUIZ_QUESTIONS, CHAPTERS } from "@/data/formulas";

const EXAM_DURATION = 20 * 60; // 20 minutes in seconds

interface ExamQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  chapter: string;
  chapterRef: string;
}

const PDF_REFERENCES: Record<string, string> = {
  ch1: "Vector Algebra & Coordinate Systems — Chapters 1-2 of lecture notes",
  ch2: "Electrostatic Fields — Coulomb's Law, Gauss's Law sections",
  ch3: "Electric Fields in Material Space — Dielectric boundary conditions",
  ch4: "Magnetostatic Fields — Ampere's Law, Biot-Savart sections",
  ch5: "Magnetic Forces, Materials & Devices — Lorentz force, inductance",
  ch6: "Maxwell's Equations — Faraday's law, displacement current",
  ch7: "Electromagnetic Wave Propagation — Skin depth, Poynting vector",
  ch8: "Transmission Lines — VSWR, reflection coefficient, matching",
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getGrade(score: number, total: number) {
  const pct = (score / total) * 100;
  if (pct >= 90) return { label: "A+  Excellent", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", emoji: "🏆" };
  if (pct >= 80) return { label: "A  Great Work", color: "text-green-300", bg: "bg-green-500/10 border-green-500/20", emoji: "⚡" };
  if (pct >= 70) return { label: "B  Good", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", emoji: "📘" };
  if (pct >= 60) return { label: "C  Needs Work", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", emoji: "📚" };
  return { label: "F  Review Required", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", emoji: "🔄" };
}

type Stage = "setup" | "active" | "review";

export default function ExamPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [timedOut, setTimedOut] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewQuestion, setReviewQuestion] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExam = () => {
    const allQ = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    const selected = allQ.slice(0, Math.min(20, allQ.length)).map(q => ({
      ...q,
      chapterRef: PDF_REFERENCES[q.chapter] || q.chapter,
    }));
    setQuestions(selected);
    setAnswers(new Array(selected.length).fill(null));
    setCurrentQ(0);
    setTimeLeft(EXAM_DURATION);
    setTimedOut(false);
    setShowReview(false);
    setReviewQuestion(null);
    setStage("active");

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimedOut(true);
          setStage("review");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const submitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage("review");
  };

  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage("setup");
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const answered = answers.filter(a => a !== null).length;
  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
  const timeWarning = timeLeft < 180;
  const timeDanger = timeLeft < 60;

  // ── Setup screen ────────────────────────────────────────────────────────────
  if (stage === "setup") {
    return (
      <div className="h-full flex flex-col gap-6 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Timer className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Exam Mode</h2>
          </div>
          <p className="text-slate-400 text-sm">Timed 20-minute mock exam simulating real test conditions.</p>
        </motion.div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg space-y-5">
            {/* Exam brief */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">Electromagnetics I — Mock Exam</h3>
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { label: "Duration", value: "20 minutes" },
                  { label: "Questions", value: `Up to ${Math.min(20, QUIZ_QUESTIONS.length)}` },
                  { label: "Topics", value: "All Chapters" },
                  { label: "Format", value: "Multiple Choice" },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-900/50 rounded-xl p-3">
                    <p className="text-slate-500 text-xs">{item.label}</p>
                    <p className="text-white font-semibold text-sm mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-amber-300 text-xs leading-relaxed">
                  Once started, the timer cannot be paused. After time expires or you submit, you'll see a full score report with explanations and PDF references for each question.
                </p>
              </div>
            </div>

            <button
              onClick={startExam}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-red-600/30 text-base"
            >
              <Play className="w-5 h-5" />
              Start 20-Minute Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Review screen ──────────────────────────────────────────────────────────
  if (stage === "review") {
    const grade = getGrade(score, questions.length);
    const wrongIndices = questions.map((_, i) => i).filter(i => answers[i] !== questions[i].correct);

    return (
      <div className="h-full flex flex-col gap-5 p-6 overflow-auto">
        {/* Score Header */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className={`rounded-2xl border p-6 ${grade.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{timedOut ? "Time expired — " : "Exam complete — "}{grade.emoji} {grade.label}</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className={`text-5xl font-black font-mono ${grade.color}`}>{score}</span>
                  <span className="text-slate-500 text-2xl font-bold mb-1">/ {questions.length}</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">{Math.round((score / questions.length) * 100)}% correct · {answered} answered</p>
              </div>
              <div className="text-right">
                <Trophy className="w-12 h-12 text-yellow-400/40 ml-auto" />
                <button
                  onClick={reset}
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Retake
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chapter breakdown */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Performance by Chapter</p>
          <div className="space-y-2">
            {CHAPTERS.map(ch => {
              const chQs = questions.filter(q => q.chapter === ch.id);
              if (chQs.length === 0) return null;
              const chScore = chQs.filter((q, qi) => answers[questions.indexOf(q)] === q.correct).length;
              const pct = Math.round((chScore / chQs.length) * 100);
              return (
                <div key={ch.id} className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs w-24 flex-shrink-0">Ch {ch.number}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono w-10 text-right ${pct >= 70 ? "text-green-400" : pct >= 40 ? "text-yellow-400" : "text-red-400"}`}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Questions review */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-slate-300 font-semibold">Review Mistakes</h3>
            <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">{wrongIndices.length} wrong</span>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correct;
              const isOpen = reviewQuestion === i;
              return (
                <div
                  key={i}
                  className={`bg-white/[0.02] backdrop-blur-md border rounded-2xl overflow-hidden transition-all
                    ${isCorrect ? "border-green-500/20" : "border-red-500/25"}`}
                >
                  <button
                    className="w-full flex items-start gap-3 p-4 text-left"
                    onClick={() => setReviewQuestion(isOpen ? null : i)}
                  >
                    {isCorrect
                      ? <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-sm font-medium line-clamp-2">{q.question}</p>
                      {!isCorrect && (
                        <p className="text-red-400 text-xs mt-1">Your answer: {answers[i] !== null ? q.options[answers[i]!] : "Not answered"}</p>
                      )}
                    </div>
                    <span className="text-slate-600 text-xs flex-shrink-0">{isOpen ? "▲" : "▼"}</span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5"
                      >
                        <div className="p-4 space-y-3">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                            <p className="text-green-400 text-xs font-semibold mb-1">Correct Answer</p>
                            <p className="text-slate-200 text-sm">{q.options[q.correct]}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded-xl p-3">
                            <p className="text-slate-400 text-xs font-semibold mb-1">Explanation</p>
                            <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
                          </div>
                          <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                            <BookOpen className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-blue-400 text-xs font-semibold">PDF Reference</p>
                              <p className="text-slate-300 text-xs mt-0.5">{q.chapterRef}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Active exam ─────────────────────────────────────────────────────────────
  const q = questions[currentQ];

  return (
    <div className="h-full flex flex-col gap-4 p-6 overflow-auto">
      {/* Timer + Progress bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg transition-all
          ${timeDanger
            ? "bg-red-500/20 border-red-500/50 text-red-300 animate-pulse"
            : timeWarning
              ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
              : "bg-slate-800/60 border-slate-700/50 text-slate-200"}`}
        >
          <Timer className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>

        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-all ${timeDanger ? "bg-red-500" : timeWarning ? "bg-amber-500" : "bg-blue-500"}`}
            animate={{ width: `${(timeLeft / EXAM_DURATION) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>{answered}/{questions.length} answered</span>
          <span className="text-slate-600">|</span>
          <span>{currentQ + 1}/{questions.length}</span>
        </div>
      </div>

      {/* Question progress dots */}
      <div className="flex gap-1 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`w-6 h-6 rounded text-xs font-bold transition-all
              ${i === currentQ ? "bg-blue-600 text-white" :
                answers[i] !== null ? "bg-green-600/40 text-green-300" : "bg-slate-800 text-slate-600 hover:bg-slate-700"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col gap-4"
        >
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                Q{currentQ + 1} · {CHAPTERS.find(c => c.id === q.chapter)?.title}
              </span>
            </div>
            <h3 className="text-white font-semibold text-base leading-relaxed">{q.question}</h3>
          </div>

          <div className="space-y-2">
            {q.options.map((option, i) => (
              <motion.button
                key={i}
                onClick={() => handleAnswer(i)}
                whileHover={{ x: 3 }}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all
                  ${answers[currentQ] === i
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-200"
                    : "bg-white/[0.02] border-white/8 text-slate-300 hover:border-white/20 hover:text-white"
                  }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${answers[currentQ] === i ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm font-medium">{option}</span>
              </motion.button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-auto">
            <button
              onClick={() => setCurrentQ(i => Math.max(0, i - 1))}
              disabled={currentQ === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white disabled:opacity-30 text-sm font-medium transition-all"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentQ(i => Math.min(questions.length - 1, i + 1))}
              disabled={currentQ === questions.length - 1}
              className="flex-1 py-2 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white disabled:opacity-30 text-sm font-medium transition-all"
            >
              Next →
            </button>
            <button
              onClick={submitExam}
              className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-all shadow-lg shadow-green-600/30"
            >
              Submit
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
