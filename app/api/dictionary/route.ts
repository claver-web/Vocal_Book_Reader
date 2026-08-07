import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const { word } = await request.json();

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    // Placeholder translation
    // Later, you can connect an actual API like Google Translate or a Dictionary API here
    const hindiMeaning = `${word} का अर्थ (Placeholder)`; 

    // If user is logged in, save the word to their account
    if (userId) {
      await prisma.savedWord.create({
        data: {
          word: word.toLowerCase(),
          meaning: hindiMeaning,
          userId,
        }
      });
    }

    return NextResponse.json({ word, meaning: hindiMeaning });
  } catch (error) {
    console.error('Dictionary API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch meaning' }, { status: 500 });
  }
}
