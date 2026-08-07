'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Layers, Volume2, Gauge, Zap, ArrowRight, SlidersHorizontal, Play, Pause, Rewind, FastForward } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import PDFUploader from '@/components/PDFUploader';
import SidebarControls from '@/components/SidebarControls';
import KaraokeDisplay from '@/components/KaraokeDisplay';
import SplashScreen from '@/components/SplashScreen';
import LibraryGrid from '@/components/LibraryGrid';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navbar from '@/components/Navbar';
import { useVocalReader } from '@/hooks/useVocalReader';
import { PDFDocumentData } from '@/types';
import { getLibraryMetadata, loadBookFromLibrary, removeBookFromLibrary, LibraryBookMetadata } from '@/lib/storage';

export default function Home() {
  const [document, setDocument] = useState<PDFDocumentData | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBookMetadata[]>([]);
  const reader = useVocalReader(document);
  const { userId } = useAuth();

  // Load library metadata on mount
  const refreshLibrary = async () => {
    const localBooks = getLibraryMetadata();
    if (userId) {
      try {
        const res = await fetch('/api/books');
        const data = await res.json();
        if (data.files && Array.isArray(data.files)) {
          const cloudFiles = data.files.map((f: any) => ({
            id: f.fileId,
            name: f.name,
            size: f.size,
            pageCount: 0,
            lastPage: 1,
            lastSentenceIndex: 0,
            lastWordIndex: 0,
            progressPercentage: 0,
            lastReadAt: new Date(f.createdAt).getTime(),
            url: f.url
          }));
          const merged = [...localBooks];
          cloudFiles.forEach((cf: any) => {
            if (!merged.find(b => b.name === cf.name)) {
              merged.push(cf);
            }
          });
          setLibraryBooks(merged.sort((a, b) => b.lastReadAt - a.lastReadAt));
        } else {
          setLibraryBooks(localBooks);
        }
      } catch (e) {
        setLibraryBooks(localBooks);
      }
    } else {
      setLibraryBooks(localBooks);
    }
  };

  useEffect(() => {
    refreshLibrary();
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleDocumentLoaded = (data: PDFDocumentData) => {
    setDocument(data);
    setTimeout(refreshLibrary, 500);
  };

  const handleUploadNew = () => {
    if (reader.isPlaying) reader.togglePlay();
    setDocument(null);
    setIsMobileOpen(false);
    refreshLibrary();
  };

  const handleResumeBook = async (meta: LibraryBookMetadata) => {
    let docData = await loadBookFromLibrary(meta.name);
    
    // If it's a cloud book and not in local IndexedDB
    if (!docData && meta.url) {
      try {
        const response = await fetch(meta.url);
        const blob = await response.blob();
        const file = new File([blob], meta.name, { type: 'application/pdf' });
        // Assuming extractTextFromPDF is imported in this file. Wait, it's NOT imported in page.tsx.
        // Let's import it at the top or dynamically import it.
        const { extractTextFromPDF } = await import('@/lib/pdfParser');
        docData = await extractTextFromPDF(file, meta.name, blob.size);
      } catch (e) {
        console.error('Error downloading and parsing cloud PDF:', e);
      }
    }

    if (docData) {
      setDocument(docData);
      setTimeout(() => {
        reader.resumePosition(meta.lastPage || 1, meta.lastSentenceIndex || 0, meta.lastWordIndex || 0);
      }, 100);
    } else {
      alert(`Could not load full document data for "${meta.name}". Please re-upload the PDF file to resume.`);
    }
  };

  const handleRemoveBook = async (name: string) => {
    await removeBookFromLibrary(name);
    refreshLibrary();
  };

  return (
    <main
      className={`flex-1 flex flex-col h-screen overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950 text-white relative ${
        reader.highContrast ? 'bg-black' : 'bg-[#050b14]'
      }`}
    >
      <Navbar />

      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <ErrorBoundary fallbackTitle="Error loading or reading this document" onReset={handleUploadNew}>
        <AnimatePresence mode="wait">
          {!document ? (
            /* Landing & Upload Screen */
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className={`flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 md:p-12 relative ${
                reader.highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-[#050b14] via-[#081120] to-[#050b14]'
              }`}
            >
              {/* Background glowing gradient orbs */}
              {!reader.highContrast && (
                <>
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
                </>
              )}

              <div className="w-full max-w-5xl mx-auto space-y-12 relative z-10 my-auto py-8">
                {/* Hero Banner */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg ${
                      reader.highContrast ? 'bg-black border-2 border-yellow-300 text-yellow-300' : 'bg-[#0a1324] border border-amber-500/40 text-amber-400 shadow-amber-950/40'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse fill-current" />
                    <span>Next-Gen Audiobook & Speed Reader</span>
                  </motion.div>

                  <motion.h1
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight"
                  >
                    Transform Any PDF Into An{' '}
                    <span className={reader.highContrast ? 'text-yellow-300' : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent'}>
                      Interactive Vocal Book
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto font-normal"
                  >
                    Enjoy multi-column research papers, ebooks, and documents with intelligent reading order preservation, word-by-word karaoke highlighting, and natural TTS voice synthesis.
                  </motion.p>
                </div>

                {/* Upload Zone */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <PDFUploader onDocumentLoaded={handleDocumentLoaded} onMultipleUploadsComplete={refreshLibrary} />
                </motion.div>

                {/* Library History Grid (Step 11 & 13) */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <LibraryGrid books={libraryBooks} onResume={handleResumeBook} onRemove={handleRemoveBook} />
                </motion.div>

                {/* Feature Highlight Cards */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t ${reader.highContrast ? 'border-white/40' : 'border-slate-800/80'}`}
                >
                  <div className={`p-5 rounded-2xl space-y-2.5 shadow-lg border transition-colors ${reader.highContrast ? 'bg-black border-white' : 'bg-[#0a1324]/60 border-slate-800/80 backdrop-blur-xl hover:border-amber-500/40'}`}>
                    <div className={`p-2.5 w-max rounded-xl border shadow-sm ${reader.highContrast ? 'bg-black border-yellow-300 text-yellow-300' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm">Multi-Column Aware</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Automatically detects two-column research articles and reads them in natural top-to-bottom column flow.
                    </p>
                  </div>

                  <div className={`p-5 rounded-2xl space-y-2.5 shadow-lg border transition-colors ${reader.highContrast ? 'bg-black border-white' : 'bg-[#0a1324]/60 border-slate-800/80 backdrop-blur-xl hover:border-amber-500/40'}`}>
                    <div className={`p-2.5 w-max rounded-xl border shadow-sm ${reader.highContrast ? 'bg-black border-yellow-300 text-yellow-300' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm">Karaoke Speed Highlighting</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Boost your reading comprehension and speed from 100 up to 500 WPM with dynamic visual word tracking.
                    </p>
                  </div>

                  <div className={`p-5 rounded-2xl space-y-2.5 shadow-lg border transition-colors ${reader.highContrast ? 'bg-black border-white' : 'bg-[#0a1324]/60 border-slate-800/80 backdrop-blur-xl hover:border-amber-500/40'}`}>
                    <div className={`p-2.5 w-max rounded-xl border shadow-sm ${reader.highContrast ? 'bg-black border-yellow-300 text-yellow-300' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm">Natural TTS Narration</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Listen hands-free while cooking or commuting with integrated Web Speech synthesis and custom voice selection.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* Split Layout Reader Screen */
            <motion.div
              key="reader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex-1 flex flex-col lg:flex-row h-screen overflow-hidden relative ${
                reader.highContrast ? 'bg-black text-white' : ''
              }`}
            >
              {/* Sidebar Controls (Desktop Sidebar + Mobile Drawer) */}
              <SidebarControls
                document={document}
                isPlaying={reader.isPlaying}
                onTogglePlay={reader.togglePlay}
                onRestart={reader.restartDocument}
                onSkipTime={reader.skipTime}
                currentPage={reader.currentPage}
                onPageChange={reader.setCurrentPage}
                wpm={reader.wpm}
                onWpmChange={reader.setWpm}
                fontSize={reader.fontSize}
                onFontSizeChange={reader.setFontSize}
                fontFamily={reader.fontFamily}
                onFontFamilyChange={reader.setFontFamily}
                highContrast={reader.highContrast}
                onToggleHighContrast={() => reader.setHighContrast(!reader.highContrast)}
                isVoiceEnabled={reader.isVoiceEnabled}
                onToggleVoice={() => reader.setIsVoiceEnabled(!reader.isVoiceEnabled)}
                availableVoices={reader.availableVoices}
                selectedVoice={reader.selectedVoice}
                onVoiceSelect={(voice) => reader.setSelectedVoice(voice)}
                onPrevSentence={() => reader.setCurrentSentenceIndex(Math.max(0, reader.currentSentenceIndex - 1))}
                onNextSentence={() => reader.setCurrentSentenceIndex(reader.currentSentenceIndex + 1)}
                onUploadNew={handleUploadNew}
                stats={reader.stats}
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
              />

              {/* Main Karaoke Reader Area */}
              <div className="flex-1 lg:ml-96 flex flex-col h-screen overflow-hidden relative">
                <KaraokeDisplay
                  sentences={reader.sentences}
                  currentSentenceIndex={reader.currentSentenceIndex}
                  currentWordIndex={reader.currentWordIndex}
                  onSentenceClick={reader.setCurrentSentenceIndex}
                  onWordClick={(sIdx, wIdx) => {
                    reader.setCurrentSentenceIndex(sIdx);
                    reader.setCurrentWordIndex(wIdx);
                  }}
                  fontSize={reader.fontSize}
                  fontFamily={reader.fontFamily}
                  highContrast={reader.highContrast}
                  isPlaying={reader.isPlaying}
                  pageNumber={reader.currentPage}
                  totalPages={document.pageCount}
                />

                {/* Mobile Floating Bottom Action Bar */}
                <div
                  className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-4 text-white border ${
                    reader.highContrast ? 'bg-black border-white' : 'bg-[#0a1324]/95 backdrop-blur-2xl border-amber-500/40'
                  }`}
                >
                  <button
                    onClick={() => reader.skipTime(-10)}
                    tabIndex={0}
                    className="p-2 min-w-[44px] min-h-[44px] rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-all flex items-center justify-center border border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    title="Rewind 10s"
                  >
                    <Rewind className="w-5 h-5" />
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={reader.togglePlay}
                    tabIndex={0}
                    className={`p-3 min-w-[52px] min-h-[52px] rounded-full font-bold shadow-lg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      reader.isPlaying
                        ? reader.highContrast
                          ? 'bg-yellow-300 text-black border-2 border-white'
                          : 'bg-gradient-to-tr from-red-500 to-orange-500 text-white shadow-orange-500/30'
                        : reader.highContrast
                        ? 'bg-white text-black border-2 border-yellow-300'
                        : 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/30 font-black'
                    }`}
                  >
                    {reader.isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                  </motion.button>

                  <button
                    onClick={() => reader.skipTime(10)}
                    tabIndex={0}
                    className="p-2 min-w-[44px] min-h-[44px] rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-all flex items-center justify-center border border-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    title="Forward 10s"
                  >
                    <FastForward className="w-5 h-5" />
                  </button>

                  <div className="h-6 w-px bg-slate-700/80 mx-1" />

                  <button
                    onClick={() => setIsMobileOpen(true)}
                    tabIndex={0}
                    className={`p-2 min-w-[44px] min-h-[44px] rounded-full transition-all flex items-center justify-center border font-bold gap-1.5 px-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      reader.highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/40'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="text-xs">Controls</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </main>
  );
}
