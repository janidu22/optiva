import { apiClient } from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  UserProfileRequest,
  UserProfileResponse,
  WeightEntryRequest,
  WeightEntryResponse,
  WeightStatsResponse,
  MealPlanRequest,
  MealPlanResponse,
  WorkoutPlanRequest,
  WorkoutPlanResponse,
  HabitRequest,
  HabitResponse,
  HabitLogRequest,
  HabitLogResponse,
  HabitAnalyticsResponse,
  JournalEntryRequest,
  JournalEntryResponse,
  SmokingLogRequest,
  SmokingLogResponse,
  SmokingAnalyticsResponse,
  AlcoholLogRequest,
  AlcoholLogResponse,
  AlcoholAnalyticsResponse,
  CalendarResponse,
  ProgramRequest,
  ProgramResponse,
  CheckpointUpdateRequest,
  CheckpointResponse,
  ProgressEntryRequest,
  ProgressEntryResponse,
  CheckpointEvaluationResponse,
  PageResponse,
  PaginationParams,
} from "@/types";

function buildPagedParams(params: PaginationParams = {}): string {
  const p = new URLSearchParams();
  if (params.page !== undefined) p.set("page", String(params.page));
  if (params.size !== undefined) p.set("size", String(params.size));
  if (params.sortBy) p.set("sortBy", params.sortBy);
  if (params.sortDir) p.set("sortDir", params.sortDir);
  if (params.dateFrom) p.set("dateFrom", params.dateFrom);
  if (params.dateTo) p.set("dateTo", params.dateTo);
  if (params.search) p.set("search", params.search);
  if (params.drinkType) p.set("drinkType", params.drinkType);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", data).then((r) => r.data),
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", data).then((r) => r.data),
  refresh: (data: RefreshTokenRequest) =>
    apiClient.post<AuthResponse>("/auth/refresh", data).then((r) => r.data),
  logout: (data: RefreshTokenRequest) =>
    apiClient.post("/auth/logout", data).then((r) => r.data),
  logoutAll: () => apiClient.post("/auth/logout-all").then((r) => r.data),
};

// ─── Profile ──────────────────────────────────────────────
export const profileApi = {
  get: () => apiClient.get<UserProfileResponse>("/profile").then((r) => r.data),
  update: (data: UserProfileRequest) =>
    apiClient.put<UserProfileResponse>("/profile", data).then((r) => r.data),
};

// ─── Weight ───────────────────────────────────────────────
export const weightApi = {
  create: (data: WeightEntryRequest) =>
    apiClient.post<WeightEntryResponse>("/weight", data).then((r) => r.data),
  getAll: () =>
    apiClient.get<WeightEntryResponse[]>("/weight").then((r) => r.data),
  getAllPaged: (params?: PaginationParams) =>
    apiClient
      .get<
        PageResponse<WeightEntryResponse>
      >(`/weight/paged${buildPagedParams(params)}`)
      .then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<WeightEntryResponse>(`/weight/${id}`).then((r) => r.data),
  update: (id: string, data: WeightEntryRequest) =>
    apiClient
      .put<WeightEntryResponse>(`/weight/${id}`, data)
      .then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/weight/${id}`).then((r) => r.data),
  getStats: () =>
    apiClient.get<WeightStatsResponse>("/weight/stats").then((r) => r.data),
};

// ─── Meal Plans ───────────────────────────────────────────
export const mealPlanApi = {
  create: (data: MealPlanRequest) =>
    apiClient.post<MealPlanResponse>("/meal-plans", data).then((r) => r.data),
  getAll: () =>
    apiClient.get<MealPlanResponse[]>("/meal-plans").then((r) => r.data),
  getAllPaged: (params?: PaginationParams) =>
    apiClient
      .get<
        PageResponse<MealPlanResponse>
      >(`/meal-plans/paged${buildPagedParams(params)}`)
      .then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<MealPlanResponse>(`/meal-plans/${id}`).then((r) => r.data),
  update: (id: string, data: MealPlanRequest) =>
    apiClient
      .put<MealPlanResponse>(`/meal-plans/${id}`, data)
      .then((r) => r.data),
  delete: (id: string) =>
    apiClient.delete(`/meal-plans/${id}`).then((r) => r.data),
  copyLastWeek: (weekStartDate: string) =>
    apiClient
      .post<MealPlanResponse>(
        `/meal-plans/copy-last-week?weekStartDate=${weekStartDate}`,
      )
      .then((r) => r.data),
};

// ─── Workout Plans ────────────────────────────────────────
export const workoutPlanApi = {
  create: (data: WorkoutPlanRequest) =>
    apiClient
      .post<WorkoutPlanResponse>("/workout-plans", data)
      .then((r) => r.data),
  getAll: () =>
    apiClient.get<WorkoutPlanResponse[]>("/workout-plans").then((r) => r.data),
  getAllPaged: (params?: PaginationParams) =>
    apiClient
      .get<
        PageResponse<WorkoutPlanResponse>
      >(`/workout-plans/paged${buildPagedParams(params)}`)
      .then((r) => r.data),
  getById: (id: string) =>
    apiClient
      .get<WorkoutPlanResponse>(`/workout-plans/${id}`)
      .then((r) => r.data),
  update: (id: string, data: WorkoutPlanRequest) =>
    apiClient
      .put<WorkoutPlanResponse>(`/workout-plans/${id}`, data)
      .then((r) => r.data),
  delete: (id: string) =>
    apiClient.delete(`/workout-plans/${id}`).then((r) => r.data),
};

// ─── Habits ───────────────────────────────────────────────
export const habitApi = {
  create: (data: HabitRequest) =>
    apiClient.post<HabitResponse>("/habits", data).then((r) => r.data),
  getAll: () => apiClient.get<HabitResponse[]>("/habits").then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<HabitResponse>(`/habits/${id}`).then((r) => r.data),
  update: (id: string, data: HabitRequest) =>
    apiClient.put<HabitResponse>(`/habits/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/habits/${id}`).then((r) => r.data),
  logHabit: (habitId: string, data: HabitLogRequest) =>
    apiClient
      .post<HabitLogResponse>(`/habits/${habitId}/logs`, data)
      .then((r) => r.data),
  getLogs: (habitId: string) =>
    apiClient
      .get<HabitLogResponse[]>(`/habits/${habitId}/logs`)
      .then((r) => r.data),
  getAnalytics: (habitId: string) =>
    apiClient
      .get<HabitAnalyticsResponse>(`/habits/${habitId}/analytics`)
      .then((r) => r.data),
};

// ─── Journal ──────────────────────────────────────────────
export const journalApi = {
  create: (data: JournalEntryRequest) =>
    apiClient.post<JournalEntryResponse>("/journal", data).then((r) => r.data),
  getAll: () =>
    apiClient.get<JournalEntryResponse[]>("/journal").then((r) => r.data),
  getAllPaged: (params?: PaginationParams) =>
    apiClient
      .get<
        PageResponse<JournalEntryResponse>
      >(`/journal/paged${buildPagedParams(params)}`)
      .then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<JournalEntryResponse>(`/journal/${id}`).then((r) => r.data),
  update: (id: string, data: JournalEntryRequest) =>
    apiClient
      .put<JournalEntryResponse>(`/journal/${id}`, data)
      .then((r) => r.data),
  delete: (id: string) =>
    apiClient.delete(`/journal/${id}`).then((r) => r.data),
};

// ─── Smoking ──────────────────────────────────────────────
export const smokingApi = {
  create: (data: SmokingLogRequest) =>
    apiClient.post<SmokingLogResponse>("/smoking", data).then((r) => r.data),
  getAll: () =>
    apiClient.get<SmokingLogResponse[]>("/smoking").then((r) => r.data),
  getAllPaged: (params?: PaginationParams) =>
    apiClient
      .get<
        PageResponse<SmokingLogResponse>
      >(`/smoking/paged${buildPagedParams(params)}`)
      .then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<SmokingLogResponse>(`/smoking/${id}`).then((r) => r.data),
  update: (id: string, data: SmokingLogRequest) =>
    apiClient
      .put<SmokingLogResponse>(`/smoking/${id}`, data)
      .then((r) => r.data),
  delete: (id: string) =>
    apiClient.delete(`/smoking/${id}`).then((r) => r.data),
  getAnalytics: () =>
    apiClient
      .get<SmokingAnalyticsResponse>("/smoking/analytics")
      .then((r) => r.data),
};

// ─── Alcohol ──────────────────────────────────────────────
export const alcoholApi = {
  create: (data: AlcoholLogRequest) =>
    apiClient.post<AlcoholLogResponse>("/alcohol", data).then((r) => r.data),
  getAll: () =>
    apiClient.get<AlcoholLogResponse[]>("/alcohol").then((r) => r.data),
  getAllPaged: (params?: PaginationParams) =>
    apiClient
      .get<
        PageResponse<AlcoholLogResponse>
      >(`/alcohol/paged${buildPagedParams(params)}`)
      .then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<AlcoholLogResponse>(`/alcohol/${id}`).then((r) => r.data),
  update: (id: string, data: AlcoholLogRequest) =>
    apiClient
      .put<AlcoholLogResponse>(`/alcohol/${id}`, data)
      .then((r) => r.data),
  delete: (id: string) =>
    apiClient.delete(`/alcohol/${id}`).then((r) => r.data),
  getAnalytics: () =>
    apiClient
      .get<AlcoholAnalyticsResponse>("/alcohol/analytics")
      .then((r) => r.data),
};

// ─── Calendar ─────────────────────────────────────────────
export const calendarApi = {
  get: (from: string, to: string) =>
    apiClient
      .get<CalendarResponse>(`/calendar?from=${from}&to=${to}`)
      .then((r) => r.data),
};

// ─── Programs ─────────────────────────────────────────────
export const programApi = {
  create: (data: ProgramRequest) =>
    apiClient.post<ProgramResponse>("/programs", data).then((r) => r.data),
  getAll: () =>
    apiClient.get<ProgramResponse[]>("/programs").then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<ProgramResponse>(`/programs/${id}`).then((r) => r.data),
  update: (id: string, data: ProgramRequest) =>
    apiClient.put<ProgramResponse>(`/programs/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    apiClient.delete(`/programs/${id}`).then((r) => r.data),
  updateCheckpoint: (
    programId: string,
    checkpointId: string,
    data: CheckpointUpdateRequest,
  ) =>
    apiClient
      .patch<CheckpointResponse>(
        `/programs/${programId}/checkpoints/${checkpointId}`,
        data,
      )
      .then((r) => r.data),
  regenerateCheckpoints: (programId: string) =>
    apiClient
      .post<
        CheckpointResponse[]
      >(`/programs/${programId}/checkpoints/regenerate`)
      .then((r) => r.data),
  evaluateCheckpoint: (programId: string, checkpointId: string) =>
    apiClient
      .post<CheckpointEvaluationResponse>(
        `/programs/${programId}/checkpoints/${checkpointId}/evaluate`,
      )
      .then((r) => r.data),
  logProgress: (programId: string, data: ProgressEntryRequest) =>
    apiClient
      .post<ProgressEntryResponse>(`/programs/${programId}/progress`, data)
      .then((r) => r.data),
  getProgress: (programId: string, from?: string, to?: string) => {
    let url = `/programs/${programId}/progress`;
    if (from && to) url += `?from=${from}&to=${to}`;
    return apiClient.get<ProgressEntryResponse[]>(url).then((r) => r.data);
  },
  deleteProgress: (programId: string, entryId: string) =>
    apiClient
      .delete(`/programs/${programId}/progress/${entryId}`)
      .then((r) => r.data),
};
