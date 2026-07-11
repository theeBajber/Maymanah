'use client';

import { useState } from 'react';
import Mushaf from '@/components/Mushaf';
import useSWR from 'swr';
import {
  BookMarked,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  ListChecks,
  RotateCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PortalHeader } from '@/components/ui/portal';
import { useToast } from '@/components/ui/toast';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface SessionSummary {
  surahNumber: number;
  fromVerse: number;
  toVerse: number;
  errors?: { description?: string }[] | string[];
  accuracy: number;
  duration: number;
}

interface JournalEntry {
  id: string;
  surahNumber: number;
  fromVerse: number;
  toVerse: number;
  accuracy: number;
  duration: number;
  errors: unknown;
  createdAt: string;
}

function AccuracyRing({ pct, size = 28 }: { pct: number; size?: number }) {
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color =
    pct >= 90 ? 'stroke-success' : pct >= 70 ? 'stroke-primary' : pct >= 50 ? 'stroke-warning' : 'stroke-danger';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-bg-hover" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        className={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (pct / 100) * circ}
      />
    </svg>
  );
}

const surahNames = [
  '', 'Al-Fatiha', 'Al-Baqarah', 'Aal-e-Imran', 'An-Nisa', 'Al-Maidah',
  'Al-Anam', 'Al-Araf', 'Al-Anfal', 'At-Tawbah', 'Yunus',
  'Hud', 'Yusuf', 'Ar-Rad', 'Ibrahim', 'Al-Hijr', 'An-Nahl',
  'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha', 'Al-Anbiya',
  'Al-Hajj', 'Al-Muminun', 'An-Nur', 'Al-Furqan', 'Ash-Shuara',
  'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum', 'Luqman',
  'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir', 'Ya-Sin',
  'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir', 'Fussilat',
  'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
  'Al-Waqiah', 'Al-Hadid', 'Al-Mujadilah', 'Al-Hashr', 'Al-Mumtahanah',
  'As-Saff', 'Al-Jumua', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
  'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Maarij',
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah',
  'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Naziat', 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
  'At-Tariq', 'Al-Ala', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
  'Ash-Shams', 'Al-Layl', 'Ad-Duhaa', 'Ash-Sharh', 'At-Tin',
  'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat',
  'Al-Qariah', 'At-Takathur', 'Al-Asr', 'Al-Humazah', 'Al-Fil',
  'Quraysh', 'Al-Maun', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
  'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
];

export default function RevisionPage() {
  const { toast } = useToast();
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: notesData } = useSWR('/api/user/notes', fetcher);
  const { data: journalData } = useSWR('/api/revision/journal', fetcher);

  const journalEntries: JournalEntry[] = journalData?.entries ?? [];

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
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        variant: 'error',
        title: 'Failed to save your revision session',
        description: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const surahName = sessionSummary ? surahNames[sessionSummary.surahNumber] ?? `Surah ${sessionSummary.surahNumber}` : '';
  const avgAccuracy = journalEntries.length > 0
    ? Math.round(journalEntries.reduce((s, e) => s + e.accuracy, 0) / journalEntries.length)
    : 0;

  return (
    <div className="stagger-fade p-6 max-w-5xl mx-auto space-y-6">
      <PortalHeader
        title="Quran Revision"
        subtitle={
          journalEntries.length > 0
            ? `${journalEntries.length} session${journalEntries.length > 1 ? 's' : ''} completed`
            : 'Practice your memorization with AI-powered revision'
        }
        action={
          journalEntries.length > 0 ? (
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border shadow-raise">
              <AccuracyRing pct={avgAccuracy} size={24} />
              <div>
                <p className="text-sm font-bold text-text-primary leading-none">{avgAccuracy}%</p>
                <p className="text-[10px] text-text-muted uppercase tracking-[0.08em] font-semibold">Avg Accuracy</p>
              </div>
            </div>
          ) : undefined
        }
      />

      <Mushaf
        mode="revision"
        studentNotes={notesData?.notes ?? []}
        onSessionEnd={handleSessionEnd}
      />

      {sessionSummary && (
        <div className="rounded-2xl border border-border bg-bg-elevated shadow-raise overflow-hidden">
          <div className="bg-gradient-to-r from-success/10 to-success/5 px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="text-success size-5" />
              </div>
              <div>
                <h2 className="font-bold text-text-primary text-lg">Session Complete</h2>
                <p className="text-xs text-text-secondary">
                  {surahName} &middot; Verses {sessionSummary.fromVerse}&ndash;{sessionSummary.toVerse}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-hover">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BookMarked className="text-primary size-4" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-text-primary">Surah {sessionSummary.surahNumber}</p>
                <p className="text-[11px] text-text-muted font-medium truncate max-w-full">{surahName}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-hover">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowLeftRight className="text-primary size-4" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-text-primary">{sessionSummary.fromVerse}&ndash;{sessionSummary.toVerse}</p>
                <p className="text-[11px] text-text-muted font-medium">Verses</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-hover">
              <div className="relative size-10 flex items-center justify-center">
                <AccuracyRing pct={sessionSummary.accuracy} size={40} />
                <span className="absolute text-xs font-bold text-text-primary">{Math.round(sessionSummary.accuracy)}%</span>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-text-muted font-medium">Accuracy</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-hover">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="text-primary size-4" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-text-primary">
                  {Math.floor(sessionSummary.duration / 60)}m {sessionSummary.duration % 60}s
                </p>
                <p className="text-[11px] text-text-muted font-medium">Duration</p>
              </div>
            </div>
          </div>

          {sessionSummary.errors && sessionSummary.errors.length > 0 && (
            <div className="px-6 pb-6">
              <div className="rounded-xl border border-danger/20 bg-danger/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="text-danger size-4" />
                  <h3 className="font-semibold text-danger text-sm">Focus Areas ({sessionSummary.errors.length})</h3>
                </div>
                <ul className="space-y-1.5">
                  {sessionSummary.errors.map((error, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-text-primary">
                      <span className="size-1.5 rounded-full bg-danger/50 mt-2 shrink-0" />
                      <span>{typeof error === "string" ? error : error.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="px-6 pb-6">
            <button
              onClick={() => setSessionSummary(null)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl py-2.5 px-5 bg-success text-text-inverse font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.97] hover:shadow-glow-brass"
            >
              <RotateCw className="size-3.5" />
              {isSubmitting ? 'Saving...' : 'Start New Session'}
            </button>
          </div>
        </div>
      )}

      {journalEntries.length > 0 && (
        <div className="rounded-2xl border border-border bg-bg-elevated shadow-raise overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-bg-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="text-primary size-4" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-text-primary text-sm">Revision History</h3>
                <p className="text-xs text-text-secondary">{journalEntries.length} past sessions</p>
              </div>
            </div>
            {showHistory ? (
              <ChevronUp className="size-4 text-text-muted transition-transform" />
            ) : (
              <ChevronDown className="size-4 text-text-muted transition-transform" />
            )}
          </button>

          {showHistory && (
            <div className="px-6 pb-4 space-y-2">
              {journalEntries.slice(0, 10).map((entry) => {
                const entrySurah = surahNames[entry.surahNumber] ?? `Surah ${entry.surahNumber}`;
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-hover hover:bg-primary/5 transition-colors"
                  >
                    <AccuracyRing pct={entry.accuracy} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {entrySurah} &middot; {entry.fromVerse}&ndash;{entry.toVerse}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        entry.accuracy >= 90 ? 'text-success' : entry.accuracy >= 70 ? 'text-primary' : 'text-warning'
                      }`}>
                        {Math.round(entry.accuracy)}%
                      </p>
                      <p className="text-[10px] text-text-muted">{Math.floor(entry.duration / 60)}m {entry.duration % 60}s</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
