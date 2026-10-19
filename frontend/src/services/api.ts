import {
  User,
  UserProfile,
  ConsentRecord,
  FoodEntry,
  FoodSearchItem,
  DailyNutritionSummary,
  WeeklyNutritionSummary,
  SymptomLog,
  ExerciseLog,
  WaterLog,
  MealPlan,
  GroceryItem,
  FoodPatternInsight,
  FoodAlternative,
  ExercisePlanItem,
  DashboardData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('nutriai_token');
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('nutriai_token');
    }
    let errorDetail = 'Request failed';
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errData.message || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; display_name?: string }) =>
    request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>('/auth/me'),

  logout: () => {
    localStorage.removeItem('nutriai_token');
    return Promise.resolve();
  },

  deleteAccount: () =>
    request<{ message: string }>('/auth/account', {
      method: 'DELETE',
    }),

  // Profile
  getProfile: () => request<UserProfile>('/profile/'),

  updateProfile: (data: Partial<UserProfile>) =>
    request<UserProfile>('/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getConsent: () => request<ConsentRecord>('/profile/consent'),

  updateConsent: (data: { health_data_consent: boolean; ai_processing_consent: boolean }) =>
    request<ConsentRecord>('/profile/consent', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Foods
  searchFoods: (query: string = '') =>
    request<{ items: FoodSearchItem[] }>(`/foods/search?query=${encodeURIComponent(query)}`),

  calculatePortion: (data: { food_name: string; quantity: number; unit: string }) =>
    request<{
      food_name: string;
      quantity: number;
      unit: string;
      serving_weight_g: number;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      fiber_g: number;
      sugar_g: number;
      sodium_mg: number;
      data_source: string;
    }>('/foods/calculate-portion', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listFoodEntries: (date?: string) =>
    request<FoodEntry[]>(`/foods/${date ? `?target_date=${date}` : ''}`),

  createFoodEntry: (data: Partial<FoodEntry>) =>
    request<FoodEntry>('/foods/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFoodEntry: (id: number, data: Partial<FoodEntry>) =>
    request<FoodEntry>(`/foods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteFoodEntry: (id: number) =>
    request<{ message: string }>(`/foods/${id}`, {
      method: 'DELETE',
    }),

  uploadFoodImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{
      status: string;
      detected_count: number;
      items: Array<{
        detected_name: string;
        matched_food_name: string;
        category: string;
        estimated_portion: string;
        confidence: string;
        note: string;
        estimated_nutrients: any;
        standard_units: any[];
      }>;
      disclaimer: string;
      message?: string;
    }>('/foods/upload-image', {
      method: 'POST',
      body: formData,
    });
  },

  // Nutrition
  getDailySummary: (date?: string) =>
    request<DailyNutritionSummary>(`/nutrition/daily-summary${date ? `?target_date=${date}` : ''}`),

  getWeeklySummary: () =>
    request<WeeklyNutritionSummary>('/nutrition/weekly-summary'),

  getFoodAlternatives: (food_name: string) =>
    request<FoodAlternative[]>(`/nutrition/food-alternatives?food_name=${encodeURIComponent(food_name)}`),

  // Symptoms
  listSymptoms: () => request<SymptomLog[]>('/symptoms/'),

  createSymptom: (data: Partial<SymptomLog>) =>
    request<SymptomLog>('/symptoms/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSymptom: (id: number) =>
    request<{ message: string }>(`/symptoms/${id}`, {
      method: 'DELETE',
    }),

  getPatterns: () => request<FoodPatternInsight[]>('/symptoms/patterns'),

  submitFeedback: (insightId: number, feedback: 'helpful' | 'inaccurate' | 'not_relevant') =>
    request<FoodPatternInsight>(`/symptoms/feedback/${insightId}`, {
      method: 'POST',
      body: JSON.stringify({ user_feedback: feedback }),
    }),

  // Exercise
  listExercises: () => request<ExerciseLog[]>('/exercise/'),

  createExercise: (data: Partial<ExerciseLog>) =>
    request<ExerciseLog>('/exercise/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteExercise: (id: number) =>
    request<{ message: string }>(`/exercise/${id}`, {
      method: 'DELETE',
    }),

  getExerciseRecommendations: () =>
    request<ExercisePlanItem[]>('/exercise/recommendations'),

  // Water
  listWater: (date?: string) =>
    request<WaterLog[]>(`/water/${date ? `?target_date=${date}` : ''}`),

  logWater: (amount_ml: number) =>
    request<WaterLog>('/water/', {
      method: 'POST',
      body: JSON.stringify({ amount_ml }),
    }),

  deleteWater: (id: number) =>
    request<{ message: string }>(`/water/${id}`, {
      method: 'DELETE',
    }),

  getWaterSummary: (date?: string) =>
    request<{ date: string; total_ml: number; target_ml: number; percentage: number; glasses: number }>(
      `/water/summary${date ? `?target_date=${date}` : ''}`
    ),

  // Meal Planner
  generateMealPlan: (data?: any) =>
    request<MealPlan>('/meal-plans/generate', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  listMealPlans: () => request<MealPlan[]>('/meal-plans/'),

  getMealPlan: (id: number) => request<MealPlan>(`/meal-plans/${id}`),

  addPlanToDiary: (planId: number) =>
    request<{ message: string }>(`/meal-plans/${planId}/add-to-diary`, {
      method: 'POST',
    }),

  generateGroceryList: (planId: number) =>
    request<{ message: string }>(`/meal-plans/${planId}/grocery-list`, {
      method: 'POST',
    }),

  listGrocery: () => request<GroceryItem[]>('/meal-plans/grocery-list'),

  addGrocery: (data: { item_name: string; category?: string; quantity?: string }) =>
    request<GroceryItem>('/meal-plans/grocery-list', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateGrocery: (id: number, data: Partial<GroceryItem>) =>
    request<GroceryItem>(`/meal-plans/grocery-list/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteGrocery: (id: number) =>
    request<{ message: string }>(`/meal-plans/grocery-list/${id}`, {
      method: 'DELETE',
    }),

  // AI Assistant Chat
  sendChatMessage: (message: string, history: Array<{ role: string; content: string }> = []) =>
    request<{
      response: string;
      detected_language: string;
      referenced_data: any;
      medical_disclaimer: string;
    }>('/chat/', {
      method: 'POST',
      body: JSON.stringify({ message, history, include_today_context: true }),
    }),

  // Dashboard
  getDashboardSummary: () => request<DashboardData>('/dashboard/'),
};
