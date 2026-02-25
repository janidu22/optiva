// ─── Enums ────────────────────────────────────────────────
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type HabitLogStatus = "DONE" | "MISSED" | "SKIPPED";
export type DrinkType = "BEER" | "WINE" | "SPIRITS" | "CUSTOM";

// ─── Pagination ───────────────────────────────────────────
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  drinkType?: DrinkType;
}
export type CheckpointPhase =
  | "FOUNDATION"
  | "CUT_1"
  | "BUILD"
  | "CUT_2"
  | "MAINTAIN";
export type CheckpointStatus = "UPCOMING" | "ACHIEVED" | "MISSED";
export type EvaluationStatus = "ON_TRACK" | "BEHIND" | "AHEAD";
export type FocusTag = "STRENGTH" | "CARDIO" | "ABS" | "MOBILITY" | "HABITS";

// ─── Auth ─────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// ─── Profile ──────────────────────────────────────────────
export interface UserProfileRequest {
  age?: number;
  heightCm?: number;
  startingWeightKg?: number;
  targetWeightKg?: number;
  timezone?: string;
  gender?: Gender;
}

export interface UserProfileResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  heightCm: number;
  startingWeightKg: number;
  targetWeightKg: number;
  timezone: string;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
}

// ─── Weight ───────────────────────────────────────────────
export interface WeightEntryRequest {
  date: string;
  weightKg: number;
  notes?: string;
}

export interface WeightEntryResponse {
  id: string;
  date: string;
  weightKg: number;
  notes: string;
  createdAt: string;
}

export interface CheckpointProgressItem {
  title: string;
  checkpointDate: string;
  targetWeight: number;
  actualWeight: number;
  status: string;
}

export interface WeightStatsResponse {
  currentWeight: number;
  currentWeightDate: string;
  startingWeight: number;
  totalChange: number;
  rollingAvg7Day: number;
  checkpointProgress: CheckpointProgressItem[];
}

// ─── Meal Planning ────────────────────────────────────────
export interface MealItemRequest {
  name: string;
  portion?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export interface MealRequest {
  mealType: MealType;
  items?: MealItemRequest[];
}

export interface MealPlanDayRequest {
  dayOfWeek: number;
  meals?: MealRequest[];
}

export interface MealPlanRequest {
  weekStartDate: string;
  days?: MealPlanDayRequest[];
}

export interface MealItemResponse {
  id: string;
  name: string;
  portion: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealResponse {
  id: string;
  mealType: MealType;
  items: MealItemResponse[];
}

export interface MealPlanDayResponse {
  id: string;
  dayOfWeek: number;
  meals: MealResponse[];
}

export interface MealPlanResponse {
  id: string;
  weekStartDate: string;
  days: MealPlanDayResponse[];
  createdAt: string;
  updatedAt: string;
}

// ─── Workout Planning ─────────────────────────────────────
export interface ExerciseRequest {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  weight?: number;
  orderIndex: number;
}

export interface WorkoutSessionRequest {
  name: string;
  orderIndex: number;
  exercises?: ExerciseRequest[];
}

export interface WorkoutDayRequest {
  dayOfWeek: number;
  sessions?: WorkoutSessionRequest[];
}

export interface WorkoutPlanRequest {
  weekStartDate: string;
  days?: WorkoutDayRequest[];
}

export interface ExerciseResponse {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration: number;
  weight: number;
  orderIndex: number;
}

export interface WorkoutSessionResponse {
  id: string;
  name: string;
  orderIndex: number;
  exercises: ExerciseResponse[];
}

export interface WorkoutDayResponse {
  id: string;
  dayOfWeek: number;
  sessions: WorkoutSessionResponse[];
}

export interface WorkoutPlanResponse {
  id: string;
  weekStartDate: string;
  days: WorkoutDayResponse[];
  createdAt: string;
  updatedAt: string;
}

// ─── Habits ───────────────────────────────────────────────
export interface HabitRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface HabitResponse {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLogRequest {
  date: string;
  status: HabitLogStatus;
  notes?: string;
}

export interface HabitLogResponse {
  id: string;
  habitId: string;
  date: string;
  status: HabitLogStatus;
  notes: string;
  createdAt: string;
}

export interface HabitAnalyticsResponse {
  habitName: string;
  currentStreak: number;
  adherence7Day: number;
  adherence30Day: number;
  totalDone: number;
  totalMissed: number;
  totalSkipped: number;
}

// ─── Journal ──────────────────────────────────────────────
export interface JournalEntryRequest {
  date: string;
  ateNotes?: string;
  tags?: string;
  mood?: number;
  emotions?: string;
  notes?: string;
  energy?: number;
  sleepHours?: number;
  stress?: number;
}

export interface JournalEntryResponse {
  id: string;
  date: string;
  ateNotes: string;
  tags: string;
  mood: number;
  emotions: string;
  notes: string;
  energy: number;
  sleepHours: number;
  stress: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Smoking ──────────────────────────────────────────────
export interface SmokingLogRequest {
  date: string;
  cigarettesCount?: number;
  smokeFree: boolean;
  cravings?: number;
  notes?: string;
}

export interface SmokingLogResponse {
  id: string;
  date: string;
  cigarettesCount: number;
  smokeFree: boolean;
  cravings: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmokingTrendPoint {
  date: string;
  cigarettesCount: number;
  smokeFree: boolean;
  cravings: number;
}

export interface SmokingAnalyticsResponse {
  smokeFreeStreak: number;
  weeklyAvgCigarettes: number;
  trendPoints: SmokingTrendPoint[];
}

// ─── Alcohol ──────────────────────────────────────────────
export interface AlcoholLogRequest {
  date: string;
  drinkType: DrinkType;
  customName?: string;
  units: number;
  volumeMl?: number;
  notes?: string;
}

export interface AlcoholLogResponse {
  id: string;
  date: string;
  drinkType: DrinkType;
  customName: string;
  units: number;
  volumeMl: number;
  notes: string;
  createdAt: string;
}

export interface AlcoholMonthlyTrend {
  month: string;
  totalUnits: number;
  drinkingDays: number;
}

export interface AlcoholAnalyticsResponse {
  unitsThisWeek: number;
  alcoholFreeStreak: number;
  monthlyTrend: AlcoholMonthlyTrend[];
}

// ─── Calendar ─────────────────────────────────────────────
export interface CalendarDayResponse {
  date: string;
  hasWeight: boolean;
  hasJournal: boolean;
  hasMealPlan: boolean;
  hasWorkoutPlan: boolean;
  habitDoneCount: number;
  habitTotalCount: number;
  hasSmokingLog: boolean;
  hasAlcoholLog: boolean;
}

export interface CalendarTotals {
  daysWithWeight: number;
  daysWithJournal: number;
  daysWithMealPlan: number;
  daysWithWorkoutPlan: number;
  totalHabitsDone: number;
  totalHabitsLogged: number;
  daysWithSmokingLog: number;
  daysWithAlcoholLog: number;
}

export interface CalendarResponse {
  days: CalendarDayResponse[];
  totals: CalendarTotals;
}

// ─── Program & Checkpoints ────────────────────────────────
export interface TargetMetricsDto {
  targetWeightChangeKg?: number;
  targetWaistChangeCm?: number;
  trainingDaysPerWeek?: number;
  stepsAverage?: number;
  dietComplianceTarget?: number;
}

export interface ProgramRequest {
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface CheckpointResponse {
  id: string;
  programId: string;
  checkpointDate: string;
  title: string;
  phase: CheckpointPhase;
  focusTags: FocusTag[];
  targetMetrics: TargetMetricsDto;
  targetWeightKg: number;
  notes: string;
  status: CheckpointStatus;
}

export interface ProgramResponse {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  notes: string;
  checkpoints: CheckpointResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckpointUpdateRequest {
  phase?: CheckpointPhase;
  focusTags?: FocusTag[];
  targetMetrics?: TargetMetricsDto;
  targetWeightKg?: number;
  notes?: string;
  status?: CheckpointStatus;
}

export interface ProgressEntryRequest {
  date: string;
  weightKg?: number;
  waistCm?: number;
  stepsAvg?: number;
  workoutsCompleted?: number;
  dietComplianceScore?: number;
  notes?: string;
  photos?: string[];
}

export interface ProgressEntryResponse {
  id: string;
  programId: string;
  date: string;
  weightKg: number;
  waistCm: number;
  stepsAvg: number;
  workoutsCompleted: number;
  dietComplianceScore: number;
  notes: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckpointEvaluationResponse {
  checkpointId: string;
  checkpointTitle: string;
  checkpointDate: string;
  status: EvaluationStatus;
  summary: string;
  entriesAnalyzed: number;
  avgWeightChangeKg: number;
  targetWeightChangeKg: number;
  avgWaistChangeCm: number;
  targetWaistChangeCm: number;
  avgWorkoutsPerWeek: number;
  targetTrainingDaysPerWeek: number;
  avgStepsAvg: number;
  targetStepsAverage: number;
  avgDietCompliance: number;
  targetDietCompliance: number;
}
