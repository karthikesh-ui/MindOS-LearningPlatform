import { useAsync } from '@/hooks/useAsync';
import { engineApi } from '@/services/engineApi';
import type {
  Flashcard,
  FlashcardStats,
  HintProgress,
  ThinkingHistoryEntry,
  ThinkingStats,
  Quiz,
  QuizSubmitResult,
  RevisionSchedule,
  AppNotification,
  WeakArea,
  Recommendation,
  MockInterview,
  AnalyticsData,
  GamificationData,
  LearningMemory,
} from '@/types/engine';

export function useFlashcards(dueOnly = false) {
  return useAsync<Flashcard[]>(() => engineApi.flashcards(dueOnly), [dueOnly]);
}

export function useFlashcardStats() {
  return useAsync<FlashcardStats>(() => engineApi.flashcardStats(), []);
}

export function useThinkingHistory() {
  return useAsync<ThinkingHistoryEntry[]>(() => engineApi.thinkingHistory(), []);
}

export function useThinkingStats() {
  return useAsync<ThinkingStats>(() => engineApi.thinkingStats(), []);
}

export function useHintProgress(problemTitle: string) {
  return useAsync<HintProgress>(() => engineApi.hintProgress(problemTitle), [problemTitle]);
}

export function useQuizzes(languageSlug?: string) {
  return useAsync<Quiz[]>(() => engineApi.quizzes(languageSlug), [languageSlug]);
}

export function useRevisionSchedule() {
  return useAsync<RevisionSchedule>(() => engineApi.revisionSchedule(), []);
}

export function useNotifications(unread = false) {
  return useAsync<AppNotification[]>(() => engineApi.notifications(unread), [unread]);
}

export function useWeakAreas() {
  return useAsync<WeakArea[]>(() => engineApi.weakAreas(), []);
}

export function useRecommendations(accepted = false) {
  return useAsync<Recommendation[]>(() => engineApi.recommendations(accepted), [accepted]);
}

export function useInterviews() {
  return useAsync<MockInterview[]>(() => engineApi.interviews(), []);
}

export function useAnalytics() {
  return useAsync<AnalyticsData>(() => engineApi.analytics(), []);
}

export function useGamification() {
  return useAsync<GamificationData>(() => engineApi.gamification(), []);
}

export function useLearningMemory() {
  return useAsync<LearningMemory>(() => engineApi.learningMemory(), []);
}

export type { QuizSubmitResult };
