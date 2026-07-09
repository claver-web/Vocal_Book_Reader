'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bookmark, Volume2, ArrowRight, Layers } from 'lucide-react';
import { FontFamilyOption } from '@/hooks/useVocalReader';

interface KaraokeDisplayProps {
  sentences: string[];
  currentSentenceIndex: number;
  currentWordIndex: number;
  onSentenceClick: (index: number) => void;
  onWordClick?: (sentenceIdx: number, wordIdx: number) => void;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: FontFamilyOption;
  highContrast: boolean;
  isPlaying: boolean;
  pageNumber: number;
  totalPages: number;
}

const KaraokeDisplay: React.FC<KaraokeDisplayProps> = React.memo(({
  sentences,
  currentSentenceIndex,
  currentWordIndex,
  onSentenceClick,
  onWordClick,
  fontSize,
  fontFamily,
  highContrast,
  isPlaying,
  pageNumber,
  totalPages,
}) => {
  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm sm:text-base md:text-lg leading-relaxed';
      case 'md':
        return 'text-base sm:text-lg md:text-xl leading-relaxed';
      case 'lg':
        return 'text-lg sm:text-xl md:text-2xl leading-loose';
      case 'xl':
        return 'text-xl sm:text-2xl md:text-3xl leading-loose';
    }
  };

  const getFontFamilyClasses = () => {
    switch (fontFamily) {
      case 'sans':
        return 'font-sans';
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono tracking-tight';
      case 'dyslexic':
        return 'font-sans tracking-[0.1em] word-spacing-[0.25em] leading-[2.4] font-medium';
    }
  };

  if (sentences.length === 0) {
    return (
      <div
        className={`flex-1 flex items-center justify-center p-12 text-center ${
          highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-[#050b14] via-[#0a1428] to-[#050b14] text-slate-500'
        }`}
      >
        <div className="space-y-3 max-w-sm">
          <p className="text-lg font-bold text-slate-400">No readable text found on this page.</p>
          <p className="text-xs">This page might be a blank cover, image-only scanned page, or decorative divider.</p>
        </div>
      </div>
    );
  }

  // Use ref callback array to smoothly scroll active sentence to vertical center like karaoke lyrics
  const sentenceRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    const activeEl = sentenceRefs.current[currentSentenceIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSentenceIndex, pageNumber]);

  return (
    <div
      className={`flex-1 overflow-y-auto relative flex flex-col justify-between ${
        highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-[#050b14] via-[#0a1428] to-[#050b14]'
      }`}
    >
      {/* Sleek top reading progress indicator */}
      <div
        className={`sticky top-0 z-20 w-full px-6 py-3 flex items-center justify-between text-xs font-bold border-b ${
          highContrast ? 'bg-black border-white text-white' : 'bg-[#050b14]/85 backdrop-blur-md border-slate-800/80 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            {isPlaying && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${highContrast ? 'bg-yellow-300' : 'bg-amber-400'}`} />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isPlaying
                  ? highContrast
                    ? 'bg-yellow-300'
                    : 'bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                  : 'bg-slate-600'
              }`}
            />
          </span>
          <span className={isPlaying ? (highContrast ? 'text-yellow-300 font-black tracking-wide uppercase' : 'text-amber-400 font-black tracking-wide uppercase') : 'text-slate-400 font-medium'}>
            {isPlaying ? 'Live Karaoke Narration Active' : 'Reader Paused'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-300 font-mono hidden sm:inline">
            Sentence <strong className={highContrast ? 'text-yellow-300 font-black' : 'text-amber-400 font-bold'}>{currentSentenceIndex + 1}</strong> / {sentences.length}
          </span>
          <span
            className={`px-3 py-1 rounded-full border font-bold flex items-center gap-1.5 shadow-sm ${
              highContrast ? 'bg-black border-white text-yellow-300' : 'bg-[#0a1324] border-amber-500/30 text-amber-300'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${highContrast ? 'text-yellow-300' : 'text-amber-400'}`} />
            <span>
              Page {pageNumber} / {totalPages}
            </span>
          </span>
        </div>
      </div>

      {/* Main Centered Reading Panel - Full Karaoke Teleprompter Stream */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-40 md:py-60 w-full my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`page-${pageNumber}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`space-y-6 sm:space-y-8 ${getFontSizeClasses()} ${getFontFamilyClasses()}`}
          >
            {sentences.map((sentence, sIdx) => {
              const isActive = sIdx === currentSentenceIndex;
              const isPastSentence = sIdx < currentSentenceIndex;

              return (
                <div
                  key={`${pageNumber}-${sIdx}`}
                  ref={(el) => {
                    sentenceRefs.current[sIdx] = el;
                  }}
                  className={`py-3.5 px-4 transition-all duration-500 rounded-2xl select-text ${
                    isActive
                      ? highContrast
                        ? 'text-white font-black text-xl sm:text-2xl md:text-3xl tracking-wide scale-[1.02] bg-white/10 border-l-4 border-yellow-300 pl-6 shadow-xl'
                        : 'text-white font-black text-xl sm:text-2xl md:text-3xl tracking-wide scale-[1.02] bg-gradient-to-r from-amber-500/15 via-slate-900/40 to-transparent border-l-4 border-amber-400 pl-6 shadow-2xl shadow-amber-950/30'
                      : isPastSentence
                      ? 'text-slate-600 font-normal opacity-40 blur-[0.5px]'
                      : 'text-slate-400 font-normal opacity-70 hover:opacity-90'
                  }`}
                >
                  <p className="leading-relaxed">{sentence}</p>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom context indicator */}
      <div
        className={`p-4 text-center text-xs font-medium border-t ${
          highContrast ? 'bg-black text-white border-white' : 'bg-[#050b14]/60 text-slate-500 border-slate-900/80'
        }`}
      >
        Continuous Karaoke Lyrics Stream • Scrolling bottom-to-top automatically • Keyboard Accessible
      </div>
    </div>
  );
});

KaraokeDisplay.displayName = 'KaraokeDisplay';
export default KaraokeDisplay;
