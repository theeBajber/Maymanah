'use client';

import { useState } from 'react';
import { TopNav } from '@/components/ui/PortalNav';
import Mushaf from '@/components/Mushaf';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface SessionSummary {
  surahNumber: number;
  fromVerse: number;
  toVerse: number;
  errors?: { description?: string }[] | string[];
  accuracy: number;
  duration: number;
}

export default function RevisionPage() {
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch student's open ustadh notes
  const { data: notesData } = useSWR('/api/user/notes', fetcher);

  const handleSessionEnd = async (summary: SessionSummary) => {
    setSessionSummary(summary);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/revision/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      console.log('Session saved successfully');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save your revision session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full pt-16">
      <TopNav />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-text-primary">Quran Revision</h1>
          
          {/* Revision Component */}
          <Mushaf
            mode="revision"
            studentNotes={notesData?.notes ?? []}
            onSessionEnd={handleSessionEnd}
          />

          {/* Session Summary Card */}
          {sessionSummary && (
            <div className="mt-8 bg-success-muted border border-success rounded-lg p-6">
              <h2 className="text-2xl font-bold text-success mb-4">Session Summary</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-text-secondary">Surah</p>
                  <p className="text-lg font-semibold text-success">{sessionSummary.surahNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Verses</p>
                  <p className="text-lg font-semibold text-success">
                    {sessionSummary.fromVerse} - {sessionSummary.toVerse}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Accuracy</p>
                  <p className="text-lg font-semibold text-success">{sessionSummary.accuracy.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Duration</p>
                  <p className="text-lg font-semibold text-success">
                    {Math.floor(sessionSummary.duration / 60)}m {sessionSummary.duration % 60}s
                  </p>
                </div>
              </div>

              {sessionSummary.errors && sessionSummary.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-success mb-2">Errors Found</h3>
                  <ul className="space-y-1 text-sm text-text-primary">
                    {sessionSummary.errors.map((error, idx) => (
                      <li key={idx}>• {typeof error === "string" ? error : error.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setSessionSummary(null)}
                className="mt-4 px-4 py-2 bg-success text-text-inverse rounded-lg hover:opacity-90 transition-opacity"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Start New Session'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
