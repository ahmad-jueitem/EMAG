import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";
import { QUIZ_QUESTIONS, CHAPTERS } from "@/data/formulas";

export default function QuizPage() {
  const [filterChapter, setFilterChapter] = useState("all");
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<typeof QUIZ_QUESTIONS>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);

  const startQuiz = () => {
    const pool = filterChapter === "all"
      ? QUIZ_QUESTIONS
      : QUIZ_QUESTIONS.filter(q => q.chapter === filterChapter);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(10, pool.length));
    setQuestions(shuffled);
    setCurrentQ(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);
    setStarted(true);
  };

  const handleAnswer = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (idx === questions[currentQ].correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(i => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setStarted(false);
    setFinished(false);
    setSelected(null);
    setRevealed(false);
    setScore(0);
  };

  const getGrade = (s: number, t: number) => {
    const pct = (s / t) * 100;
    if (pct >= 90) return { label: "Excellent!", color: "text-green-400", emoji: "🏆" };
    if (pct >= 75) return { label: "Good Work!", color: "text-blue-400", emoji: "⚡" };
    if (pct >= 60) return { label: "Keep Studying", color: "text-yellow-400", emoji: "📚" };
    return { label: "Needs Review", color: "text-red-400", emoji: "🔄" };
  };

  if (!started) {
    return (
      <div className="h-full flex flex-col gap-6 p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <FlaskConical className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Auto-Quiz</h2>
          </div>
          <p className="text-slate-400 text-sm">Test your electromagnetics knowledge with auto-generated questions.</p>
        </motion.div>

        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="w-full max-w-md space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-semibold">Quiz Settings</h3>
              <div>
                <label className="text-slate-400 text-sm font-medium block mb-2">Select Topic</label>
                <select
                  value={filterChapter}
                  onChange={e => setFilterChapter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600/50 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500/50"
                >
                  <option value="all">All Chapters (Mixed)</option>
                  {CHAPTERS.map(ch => (
                    <option key={ch.id} value={ch.id}>Ch {ch.number}: {ch.title}</option>
                  ))}
                </select>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3 text-sm text-slate-400">
                <p>Questions available: <span className="text-white font-medium">{filterChapter === "all" ? QUIZ_QUESTIONS.length : QUIZ_QUESTIONS.filter(q => q.chapter === filterChapter).length}</span></p>
                <p className="mt-1">You'll be given up to 10 randomly selected questions with detailed explanations.</p>
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/30 text-base"
            >
              <FlaskConical className="w-5 h-5" />
              Start Quiz
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            {[
              { label: "Total Questions", value: QUIZ_QUESTIONS.length },
              { label: "Chapters Covered", value: CHAPTERS.length },
              { label: "Topics", value: 12 },
            ].map((s, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const grade = getGrade(score, questions.length);
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 gap-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center space-y-4"
        >
          <div className="text-6xl">{grade.emoji}</div>
          <h2 className="text-3xl font-bold text-white">{grade.label}</h2>
          <p className={`text-5xl font-mono font-bold ${grade.color}`}>{score}/{questions.length}</p>
          <p className="text-slate-400">{Math.round((score / questions.length) * 100)}% correct</p>
        </motion.div>

        <div className="w-full max-w-md space-y-3">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            return (
              <div key={i} className={`bg-slate-800/60 border rounded-xl p-4 ${isCorrect ? "border-green-500/30" : "border-red-500/30"}`}>
                <div className="flex items-start gap-2">
                  {isCorrect ? <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-slate-300 text-sm font-medium">{q.question}</p>
                    {!isCorrect && (
                      <p className="text-red-400 text-xs mt-1">Your answer: {q.options[answers[i] ?? 0]}</p>
                    )}
                    <p className={`text-xs mt-1 ${isCorrect ? "text-green-400" : "text-slate-400"}`}>
                      Correct: {q.options[q.correct]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={resetQuiz}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-xl transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Take Another Quiz
        </button>
      </div>
    );
  }

  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-bold text-white">Quiz</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{currentQ + 1} / {questions.length}</span>
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-300 font-medium">{score}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="flex-1 flex flex-col gap-5"
        >
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <span className="text-xs text-orange-400 font-semibold bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
              Question {currentQ + 1}
            </span>
            <h3 className="text-white font-semibold text-lg mt-3 leading-relaxed">{q.question}</h3>
          </div>

          <div className="space-y-3">
            {q.options.map((option, i) => {
              let style = "bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600/60";
              if (revealed) {
                if (i === q.correct) style = "bg-green-500/15 border-green-500/50 text-green-300";
                else if (i === selected && i !== q.correct) style = "bg-red-500/15 border-red-500/50 text-red-300";
                else style = "bg-slate-800/40 border-slate-700/30 text-slate-500";
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={revealed}
                  whileHover={!revealed ? { x: 4 } : {}}
                  className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all disabled:cursor-not-allowed ${style}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${revealed && i === q.correct ? "bg-green-500 text-white" :
                      revealed && i === selected ? "bg-red-500 text-white" : "bg-slate-700 text-slate-400"}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm font-medium">{option}</span>
                  {revealed && i === q.correct && <CheckCircle className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />}
                  {revealed && i === selected && i !== q.correct && <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-5 border ${selected === q.correct ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20"}`}
              >
                <p className={`text-sm font-semibold mb-2 ${selected === q.correct ? "text-green-400" : "text-amber-400"}`}>
                  {selected === q.correct ? "Correct!" : "Explanation:"}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {revealed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/30 text-sm"
            >
              {currentQ < questions.length - 1 ? "Next Question →" : "See Results"}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
