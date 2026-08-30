/**
 * Mirrors the backend contract in docs/api/backend-contract.md exactly.
 * Field names and enum values are the API's, never renamed for taste.
 */

export type PlatformRole = "SUPERADMIN" | "MEMBER";
export type OrgRole = "TEACHER" | "STUDENT";
export type MembershipStatus = "ACTIVE" | "SUSPENDED";
export type Permission =
  | "MANAGE_MEMBERS"
  | "MANAGE_QUIZZES"
  | "VIEW_RESULTS"
  | "MANAGE_ORGANIZATION";
export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
export type ContentFormat = "PLAIN" | "LATEX_MIXED";
export type Language = "EN" | "BN" | "MIXED";
export type QuizStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type QuestionType = "SINGLE_CHOICE" | "MULTI_CHOICE" | "TRUE_FALSE";
export type ScoringPolicy = "BEST" | "FIRST" | "LATEST";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED";
export type SubmissionCause =
  | "MANUAL"
  | "TIMER_EXPIRED"
  | "DISCONNECTED"
  | "PROCTOR_VIOLATION"
  | "QUIZ_CLOSED"
  | "ADMIN_CLOSED";
export type ProctorEventType =
  | "TAB_HIDDEN"
  | "WINDOW_BLUR"
  | "FULLSCREEN_EXIT"
  | "COPY"
  | "PASTE"
  | "RECONNECT"
  | "DEVICE_CHANGED";
export type BatchInviteOutcome =
  | "INVITED"
  | "ALREADY_MEMBER"
  | "ALREADY_INVITED";

export const PERMISSIONS: Permission[] = [
  "MANAGE_MEMBERS",
  "MANAGE_QUIZZES",
  "VIEW_RESULTS",
  "MANAGE_ORGANIZATION",
];

/* ------------------------------------------------------------------ auth */

export interface UserSummary {
  id: string;
  email: string;
  platformRole: PlatformRole;
  singleDeviceEnforced: boolean;
}

export interface MembershipSummary {
  organizationId: string;
  organizationName: string;
  /** Platform-level switch, controlled only by the superadmin — separate from this membership's own `status`. */
  organizationIsActive: boolean;
  role: OrgRole;
  isOrgOwner: boolean;
  status: MembershipStatus;
  permissions: Permission[];
}

export interface OrgContext {
  id: string;
  role: OrgRole;
  isOrgOwner: boolean;
  permissions: Permission[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}

export interface AuthTokens extends TokenPair {
  user: UserSummary;
  memberships: MembershipSummary[];
  org: OrgContext | null;
}

export interface MeResponse {
  user: UserSummary;
  memberships: MembershipSummary[];
  org: OrgContext | null;
}

export interface SelectOrganizationResponse {
  accessToken: string;
  accessTokenExpiresIn: number;
  org: OrgContext;
}

export interface ActiveDevice {
  label: string | null;
  lastSeenAt: string;
}

/* --------------------------------------------------------- organizations */

export interface Organization {
  id: string;
  name: string;
  joinCode: string;
  /** Platform-level switch (superadmin-controlled). False blocks every member from acting in it. */
  isActive: boolean;
  createdAt: string;
  teacherCount: number;
  studentCount: number;
}

export interface PlatformStats {
  organizationsTotal: number;
  organizationsActive: number;
  organizationsSuspended: number;
  usersTotal: number;
  membershipsByRole: { role: OrgRole; count: number }[];
}

export interface Member {
  id: string;
  userId: string;
  email: string;
  role: OrgRole;
  isOrgOwner: boolean;
  status: MembershipStatus;
  permissions: Permission[];
  joinedAt: string;
}

export interface Invite {
  id: string;
  email: string;
  role: OrgRole;
  status: InviteStatus;
  isOrgOwner: boolean;
  permissions: Permission[];
  expiresAt: string;
  createdAt: string;
}

export interface InvitePreview {
  organizationName: string;
  email: string;
  role: OrgRole;
  isOrgOwner: boolean;
  expiresAt: string;
  accountExists: boolean;
}

export interface BatchInviteResult {
  email: string;
  status: BatchInviteOutcome;
  inviteId: string | null;
}

export interface BatchInviteResponse {
  created: number;
  skipped: number;
  results: BatchInviteResult[];
}

/* ---------------------------------------------------------------- quizzes */

export interface Quiz {
  id: string;
  organizationId: string;
  createdById: string;
  createdByEmail: string;
  title: string;
  description: string | null;
  language: Language;
  subject: string | null;
  status: QuizStatus;
  durationSeconds: number;
  opensAt: string | null;
  closesAt: string | null;
  maxAttempts: number;
  scoringPolicy: ScoringPolicy;
  lateStartCutoff: boolean;
  shuffleQuestions: boolean;
  maxFocusViolations: number | null;
  leaderboardVisibleToStudents: boolean;
  totalPoints: number;
  questionCount: number;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
}

export interface AnswerKeyOption {
  id: string;
  text: string;
  isCorrect: boolean;
  position: number;
}

export interface AnswerKeyQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  contentFormat: ContentFormat;
  points: number;
  position: number;
  options: AnswerKeyOption[];
}

/** Student-facing. Structurally has no correctness flag — see ADR-0011. */
export interface ExamOption {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  contentFormat: ContentFormat;
  points: number;
  options: ExamOption[];
}

export interface QuizLink {
  id: string;
  quizId: string;
  label: string | null;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: string;
  /** Server-computed: folds in the quiz's own status/opensAt/closesAt, not
   * just this link's own expiresAt/maxUses — the one true "is this live." */
  acceptingAttempts: boolean;
  /** Returned once, at creation. Never retrievable again. */
  token: string | null;
  url: string | null;
}

export interface QuizLinkPreview {
  quizTitle: string;
  quizDescription: string | null;
  organizationName: string;
  language: Language;
  subject: string | null;
  durationSeconds: number;
  questionCount: number;
  totalPoints: number;
  opensAt: string | null;
  closesAt: string | null;
  maxAttempts: number;
  acceptingAttempts: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  email: string;
  attemptId: string;
  score: number;
  maxScore: number;
  durationMs: number;
  submittedAt: string;
}

export interface Leaderboard {
  quizId: string;
  scoringPolicy: ScoringPolicy;
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

/* --------------------------------------------------------------- attempts */

export interface Attempt {
  id: string;
  quizId: string;
  quizTitle: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  deadlineAt: string;
  serverTime: string;
  remainingMs: number;
  submittedAt: string | null;
  submissionCause: SubmissionCause | null;
  score: number | null;
  maxScore: number;
  focusViolations: number;
  maxFocusViolations: number | null;
}

export interface SavedAnswer {
  questionId: string;
  selectedOptionIds: string[];
}

export interface ExamState {
  attempt: Attempt;
  questions: ExamQuestion[];
  answers: SavedAnswer[];
}

export interface HeartbeatResponse {
  status: AttemptStatus;
  serverTime: string;
  deadlineAt: string;
  remainingMs: number;
  submissionCause: SubmissionCause | null;
}

export interface GradedAnswer {
  questionId: string;
  selectedOptionIds: string[];
  isCorrect: boolean | null;
  pointsAwarded: number | null;
}

export interface ProctorEvent {
  type: ProctorEventType;
  occurredAt: string;
}

export interface AttemptDetail {
  attempt: Attempt;
  studentEmail: string;
  answers: GradedAnswer[];
  events: ProctorEvent[];
}

/** A student's own attempt, with the answer key — only once the quiz has closed. */
export interface AttemptReview {
  attempt: Attempt;
  questions: AnswerKeyQuestion[];
  answers: GradedAnswer[];
}

/* ------------------------------------------------------------- dashboards */

export interface QuizOverview {
  quizId: string;
  title: string;
  status: QuizStatus;
  totalPoints: number;
  attempts: number;
  students: number;
  averageScore: number | null;
}

export interface TeacherDashboard {
  quizCount: number;
  publishedCount: number;
  draftCount: number;
  totalAttempts: number;
  quizzes: QuizOverview[];
}

export interface ScoreBucket {
  bucket: number;
  count: number;
}

export interface QuestionDifficulty {
  questionId: string;
  position: number;
  prompt: string;
  answered: number;
  correct: number;
  correctRate: number;
}

export interface SubmissionCauseCount {
  cause: SubmissionCause;
  count: number;
}

export interface QuizDashboard {
  quiz: QuizOverview;
  invitedStudents: number;
  completionRate: number;
  scoreDistribution: ScoreBucket[];
  questionDifficulty: QuestionDifficulty[];
  submissionCauses: SubmissionCauseCount[];
}

export interface TeacherStats {
  teacherId: string;
  email: string;
  quizCount: number;
  publishedCount: number;
  totalAttempts: number;
}

export interface OrganizationDashboard {
  organizationId: string;
  organizationName: string;
  teacherCount: number;
  studentCount: number;
  quizCount: number;
  publishedQuizCount: number;
  attemptsInPeriod: number;
  recentQuizzes: QuizOverview[];
  teacherStats: TeacherStats[];
}

export interface StudentProgressEntry {
  organizationId: string;
  organizationName: string;
  quizId: string;
  quizTitle: string;
  attempts: number;
  bestScore: number | null;
  maxScore: number;
  lastAttemptAt: string | null;
  /** For deciding whether the answer key is reviewable yet. */
  quizStatus: QuizStatus;
  closesAt: string | null;
  /** The latest submitted attempt's id, to link a review to — null if none submitted. */
  lastSubmittedAttemptId: string | null;
}

export interface StudentDashboard {
  organizationCount: number;
  quizzesAttempted: number;
  attemptsSubmitted: number;
  progress: StudentProgressEntry[];
}

/**
 * The live backend's actual list-endpoint responses use this envelope —
 * confirmed against a real running session, even though the generated
 * Swagger schema for at least one of them (`GET /organizations`) claims a
 * bare array. Runtime behavior wins; see docs/BUILD-PROGRESS.md.
 */
export interface Paginated<T> {
  items: T[];
  total: number;
}

