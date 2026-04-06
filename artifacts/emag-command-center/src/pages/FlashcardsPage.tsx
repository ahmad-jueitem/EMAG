import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronLeft, ChevronRight, RotateCcw, Shuffle, CheckCircle, XCircle } from "lucide-react";
import KatexRenderer from "@/components/KatexRenderer";
import { FLASHCARDS, CHAPTERS } from "@/data/formulas";

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const [filterChapter, setFilterChapter] = useState("all");
  const [shuffled, setShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState<number[]>(FLASHCARDS.map((_, i) => i));

  const filteredIndices = filterChapter === "all"
    ? cardOrder
    : cardOrder.filter(i => FLASHCARDS[i].chapter === filterChapter);

  const card = FLASHCARDS[filteredIndices[currentIndex] ?? 0];
  const total = filteredIndices.length;

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setDirection(1);
      setFlipped(false);
      setTimeout(() => setCurrentIndex(i => i + 1), 50);
    }
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setFlipped(false);
      setTimeout(() => setCurrentIndex(i => i - 1), 50);
    }
  }, [currentIndex]);

  const handleShuffle = () => {
    const arr = [...filteredIndices];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setCardOrder(arr);
    setCurrentIndex(0);
    setFlipped(false);
    setShuffled(true);
  };

  const handleReset = () => {
    setCardOrder(FLASHCARDS.map((_, i) => i));
    setCurrentIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
    setShuffled(false);
  };

  const markKnown = () => {
    const realIdx = filteredIndices[currentIndex];
    setKnown(prev => new Set([...prev, realIdx]));
    setUnknown(prev => { const s = new Set(prev); s.delete(realIdx); return s; });
    goNext();
  };

  const markUnknown = () => {
    const realIdx = filteredIndices[currentIndex];
    setUnknown(prev => new Set([...prev, realIdx]));
    setKnown(prev => { const s = new Set(prev); s.delete(realIdx); return s; });
    goNext();
  };

  const chapterName = (id: string) => CHAPTERS.find(c => c.id === id)?.title || id;

  const knownCount = [...known].filter(i => filteredIndices.includes(i)).length;
  const unknownCount = [...unknown].filter(i => filteredIndices.includes(i)).length;
  const progress = total > 0 ? ((knownCount + unknownCount) / total) * 100 : 0;

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Brain className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold text-white">Flashcards</h2>
        </div>
        <p className="text-slate-400 text-sm">Master every law and theorem through active recall.</p>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterChapter}
          onChange={e => { setFilterChapter(e.target.value); setCurrentIndex(0); setFlipped(false); }}
          className="bg-slate-800 border border-slate-700/50 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500/50"
        >
          <option value="all">All Chapters</option>
          {CHAPTERS.map(ch => (
            <option key={ch.id} value={ch.id}>Ch {ch.number}: {ch.title}</option>
          ))}
        </select>
        <button
          onClick={handleShuffle}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
            ${shuffled ? "bg-violet-600/30 border border-violet-500/40 text-violet-300" : "bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700"}`}
        >
          <Shuffle className="w-4 h-4" /> Shuffle
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>

        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-green-400"><CheckCircle className="w-4 h-4" /> {knownCount}</span>
          <span className="flex items-center gap-1.5 text-red-400"><XCircle className="w-4 h-4" /> {unknownCount}</span>
          <span className="text-slate-500">{currentIndex + 1} / {total}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card */}
      {card && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <motion.div
            key={`${filteredIndices[currentIndex]}-${flipped}`}
            initial={{ rotateY: direction * 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -direction * 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFlipped(f => !f)}
            className="w-full max-w-2xl cursor-pointer"
            style={{ perspective: 1000 }}
          >
            <div className={`
              relative bg-slate-800/80 border rounded-3xl p-8 min-h-64 flex flex-col items-center justify-center text-center
              transition-all hover:shadow-xl
              ${flipped ? "border-violet-500/40 bg-violet-900/10" : "border-slate-700/50 hover:border-slate-600/60"}
            `}>
              {/* Chapter badge */}
              <div className="absolute top-4 left-4">
                <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
                  {chapterName(card.chapter)}
                </span>
              </div>

              {/* Flip indicator */}
              <div className="absolute top-4 right-4">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${flipped ? "bg-violet-500/20 text-violet-300" : "bg-slate-700/60 text-slate-400"}`}>
                  {flipped ? "Definition" : "Term"}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {!flipped ? (
                  <motion.div
                    key="front"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-white text-2xl font-bold">{card.term}</h3>
                    <div className="bg-slate-900/60 rounded-xl px-6 py-3 border border-slate-700/30">
                      <KatexRenderer latex={card.formula} display className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm">Click to reveal definition</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-violet-300 text-lg font-bold">{card.term}</h3>
                    <p className="text-slate-200 text-base leading-relaxed max-w-lg">{card.definition}</p>
                    <div className="bg-slate-900/60 rounded-xl px-6 py-3 border border-violet-500/20">
                      <KatexRenderer latex={card.formula} display className="text-slate-300" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={markUnknown}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
            >
              <XCircle className="w-4 h-4" /> Need Practice
            </button>
            <div className="flex gap-2">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex === total - 1}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={markKnown}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" /> Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
