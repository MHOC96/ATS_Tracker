import { Annotation } from "@langchain/langgraph";

export const RecruitmentStateAnnotation = Annotation.Root({
  applicationId: Annotation<string>(),
  jobId: Annotation<string>(),
  candidateId: Annotation<string>(),
  driveFileId: Annotation<string>(),
  cvFileId: Annotation<string>(),
  cvMimeType: Annotation<string>(),
  incomingFolderId: Annotation<string>(),
  archiveFolderId: Annotation<string>(),
  manualReviewFolderId: Annotation<string>(),
  processingStartedAt: Annotation<number>(),
  extractionAttempt: Annotation<number>({
    reducer: (_prev, next) => next,
    default: () => 0,
  }),
  candidateData: Annotation<Record<string, unknown> | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  jobData: Annotation<Record<string, unknown> | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  scoringModel: Annotation<Record<string, unknown> | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  screeningResult: Annotation<Record<string, unknown> | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  scoreResult: Annotation<Record<string, unknown> | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  status: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "QUEUED",
  }),
  error: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  applyFormHints: Annotation<{ fullName?: string | null; email?: string | null } | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  extractionCorrectionHint: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
});

export type RecruitmentState = typeof RecruitmentStateAnnotation.State;
