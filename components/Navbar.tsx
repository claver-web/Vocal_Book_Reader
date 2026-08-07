'use client';

import React, { useState } from 'react';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import { BookA, Sparkles } from 'lucide-react';
import VocabularyList from './VocabularyList';

export default function Navbar() {
  const { userId } = useAuth();
  const [isVocabOpen, setIsVocabOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full px-6 py-4 bg-[#050b14]/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tight text-white hidden sm:block">VocalReader</span>
        </div>

        <div className="flex items-center gap-4">
          {userId ? (
            <>
              <button
                onClick={() => setIsVocabOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all text-sm font-bold text-slate-200 hover:text-amber-400"
              >
                <BookA className="w-4 h-4" />
                <span className="hidden sm:inline">My Vocabulary</span>
              </button>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border-2 border-amber-500 shadow-lg"
                  }
                }}
              />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-full shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform text-sm">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </nav>

      <VocabularyList isOpen={isVocabOpen} onClose={() => setIsVocabOpen(false)} />
    </>
  );
}
