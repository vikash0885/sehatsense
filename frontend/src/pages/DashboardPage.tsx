import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { ProgressRing } from '../components/ProgressRing';
import { MacroCard } from '../components/MacroCard';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import {
  UtensilsCrossed,
  Droplet,
  Dumbbell,
  Sparkles,
  PlusCircle,
  Camera,
  ActivitySquare,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Flame,
  Wheat,
  Fish,
  Cookie,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const [dash, week] = await Promise.all([
        api.getDashboardSummary(),
        api.getWeeklySummary(),
      ]);
      setData(dash);
      setWeeklyTrend(week.days);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickWater = async (amount: number) => {
    try {
      await api.logWater(amount);
      fetchDashboard();
    } catch (err: any) {
      alert(`Could not log water: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-400">Calculating your daily intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isAuthError = error?.toLowerCase().includes('token') || error?.toLowerCase().includes('credential') || error?.includes('401');

    return (
      <div className="p-8 text-center max-w-md mx-auto bg-gradient-to-br from-[#1c1205]/95 via-[#120a02]/95 to-[#080401] rounded-3xl border border-amber-500/35 shadow-2xl">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">
          {isAuthError ? 'Session Expired or Login Required' : 'Could not load dashboard'}
        </h3>
        <p className="text-xs text-zinc-400 mb-4">{error}</p>
        <div className="flex items-center justify-center gap-3">
          {isAuthError ? (
            <button
              onClick={() => {
                localStorage.removeItem('nutriai_token');
                window.location.href = '/login';
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              Sign In to Continue
            </button>
          ) : (
            <button
              onClick={fetchDashboard}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const { today_nutrition, hydration, activity, user, recent_meals, recent_symptoms, pattern_insights, habit_insights } = data;
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner: Royal Golden Onyx */}
      <div className="bg-gradient-to-r from-[#221603]/90 via-[#140e02]/95 to-[#0b0a06] rounded-3xl p-6 sm:p-8 text-white border border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-bold mb-1.5">
            <span>{todayFormatted}</span>
            <span>•</span>
            <span className="capitalize">{user.dietary_preference} Plan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Namaste, {user.display_name}!
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base mt-1.5 max-w-xl leading-relaxed">
            {today_nutrition.entry_count > 0
              ? `You've logged ${today_nutrition.entry_count} food items today. Stay mindful of hydration and your fiber intake!`
              : "No meals recorded yet today. Snap a photo or log your breakfast to start tracking your energy!"}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            to="/food-logging"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black px-6 py-3 rounded-2xl text-sm font-extrabold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-black stroke-[2.5]" />
            <span>Log Food</span>
          </Link>
          <Link
            to="/food-logging?tab=image"
            className="inline-flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer backdrop-blur-sm"
          >
            <Camera className="w-5 h-5 text-amber-400" />
            <span>AI Camera</span>
          </Link>
        </div>
      </div>

      {/* Daily Progress Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie Ring Card: Warm Golden Flame */}
        <div className="bg-gradient-to-br from-[#281805]/85 via-[#1a1106]/90 to-[#0c0a07]/95 rounded-3xl p-6 border border-amber-500/40 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15 transition-all flex flex-col items-center justify-center text-center backdrop-blur-xs">
          <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-4">
            Daily Calorie Intake
          </h3>
          <ProgressRing
            progress={today_nutrition.calorie_percentage}
            size={160}
            strokeWidth={14}
            colorClass="text-amber-400"
            bgColorClass="text-zinc-800"
          >
            <Flame className="w-6 h-6 text-amber-400 mb-1" />
            <span className="text-3xl font-black text-white leading-tight">
              {Math.round(today_nutrition.total_calories)}
            </span>
            <span className="text-sm text-zinc-300 font-semibold">
              / {Math.round(today_nutrition.calorie_target)} kcal
            </span>
          </ProgressRing>
          <p className="text-sm text-zinc-200 font-semibold mt-4">
            {today_nutrition.calorie_target - today_nutrition.total_calories > 0
              ? `${Math.round(today_nutrition.calorie_target - today_nutrition.total_calories)} kcal remaining to target`
              : 'Target reached for today'}
          </p>
        </div>

        {/* Hydration Card: Deep Ocean Sky Blue */}
        <div className="bg-gradient-to-br from-[#062038]/85 via-[#041424]/90 to-[#040c15]/95 rounded-3xl p-6 border border-sky-500/40 hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-500/15 transition-all flex flex-col justify-between backdrop-blur-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300">
                <Droplet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hydration</h3>
                <p className="text-sm text-sky-200">{hydration.glasses} glasses consumed</p>
              </div>
            </div>
            <span className="text-sm font-extrabold text-sky-300 bg-sky-950/80 border border-sky-500/40 px-3 py-1 rounded-full">
              {Math.round(hydration.percentage)}%
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-3xl font-black text-white">{hydration.total_ml} ml</span>
              <span className="text-sm text-sky-200 font-medium">Target: {hydration.target_ml} ml</span>
            </div>
            <div className="w-full bg-black/60 rounded-full h-3.5 overflow-hidden border border-white/5">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-sky-400"
                style={{ width: `${Math.min(hydration.percentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-sky-900/40">
            <span className="text-sm text-sky-200 font-bold mr-1">Quick Add:</span>
            {[250, 500, 750].map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickWater(amt)}
                className="flex-1 py-2 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border border-sky-500/30 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                +{amt}ml
              </button>
            ))}
          </div>
        </div>

        {/* Activity & Digestion Stroll Card: Warm Sunset Coral Orange */}
        <div className="bg-gradient-to-br from-[#2f1406]/85 via-[#1e0e05]/90 to-[#0e0704]/95 rounded-3xl p-6 border border-orange-500/40 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/15 transition-all flex flex-col justify-between backdrop-blur-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Physical Activity</h3>
                <p className="text-sm text-orange-200">{activity.sessions_count} logged sessions</p>
              </div>
            </div>
            <Link
              to="/exercise"
              className="text-sm font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              <span>Log</span> <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="my-4 grid grid-cols-2 gap-4 bg-black/60 border border-orange-500/25 p-4 rounded-2xl">
            <div>
              <span className="text-xs sm:text-sm text-zinc-300 font-semibold block mb-0.5">Total Duration</span>
              <span className="text-2xl font-black text-white">{activity.total_minutes} mins</span>
            </div>
            <div>
              <span className="text-xs sm:text-sm text-zinc-300 font-semibold block mb-0.5">Calories Burned</span>
              <span className="text-2xl font-black text-white">{Math.round(activity.calories_burned)} kcal</span>
            </div>
          </div>

          <div className="text-sm text-orange-200 bg-orange-950/40 p-3 rounded-xl border border-orange-800/40 flex items-center gap-2 font-medium">
            <Sparkles className="w-4.5 h-4.5 text-orange-400 flex-shrink-0" />
            <span>Gentle 15-min post-meal stroll supports smooth digestion.</span>
          </div>
        </div>
      </div>

      {/* Macronutrients Progress Row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black text-white">Macronutrients Breakdown</h2>
          <Link to="/nutrition" className="text-sm font-bold text-amber-400 hover:text-amber-300 hover:underline">
            Detailed Analysis
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MacroCard
            label="Protein"
            data={today_nutrition.protein}
            color="violet"
            icon={<Fish className="w-5 h-5" />}
          />
          <MacroCard
            label="Carbohydrates"
            data={today_nutrition.carbs}
            color="amber"
            icon={<Wheat className="w-5 h-5" />}
          />
          <MacroCard
            label="Healthy Fats"
            data={today_nutrition.fat}
            color="rose"
            icon={<Cookie className="w-5 h-5" />}
          />
          <MacroCard
            label="Dietary Fiber"
            data={today_nutrition.fiber}
            color="indigo"
            icon={<Sparkles className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Weekly Nutrition Chart & Recent Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart: Deep Sapphire Indigo */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0b1736]/85 via-[#081024]/90 to-[#040914]/95 rounded-3xl p-6 border border-indigo-500/40 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/15 transition-all backdrop-blur-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-white">7-Day Caloric Intake vs Target</h3>
              <p className="text-sm text-indigo-200/90 font-medium">Actual daily consumption recorded in your diary</p>
            </div>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/40 px-3 py-1 rounded-full">
              Weekly Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2238" />
                <XAxis dataKey="day_name" tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: '#a5b4fc', fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: '#a5b4fc', fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070709', borderRadius: '12px', border: '1px solid #6366f1', color: '#fff', fontSize: '13px', fontWeight: 600 }}
                />
                <Bar dataKey="calories" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Calories (kcal)" />
                <Line type="monotone" dataKey="calorie_target" stroke="#818cf8" strokeDasharray="4 4" dot={false} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Meals Feed: Warm Terracotta Honey */}
        <div className="bg-gradient-to-br from-[#281508]/85 via-[#1a0e05]/90 to-[#0d0703]/95 rounded-3xl p-6 border border-amber-600/40 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-600/15 transition-all flex flex-col justify-between backdrop-blur-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white">Today's Logged Meals</h3>
              <Link to="/food-diary" className="text-sm font-bold text-amber-400 hover:text-amber-300 hover:underline">
                View Diary
              </Link>
            </div>

            {recent_meals.length === 0 ? (
              <div className="text-center py-8 text-zinc-300">
                <UtensilsCrossed className="w-9 h-9 mx-auto mb-2 opacity-50 text-amber-300" />
                <p className="text-sm font-medium">No meals logged yet today.</p>
                <Link
                  to="/food-logging"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-amber-400 font-bold hover:underline"
                >
                  <PlusCircle className="w-4 h-4" /> Log your first meal
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recent_meals.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{m.food_name}</h4>
                      <p className="text-xs text-zinc-300 capitalize font-medium">
                        {m.meal_category} • {m.portion}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{Math.round(m.calories)} kcal</span>
                      <p className="text-xs text-amber-400 font-bold">{m.protein_g}g Pro</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/food-logging"
            className="w-full mt-4 py-3 rounded-xl border border-dashed border-amber-500/40 text-sm font-bold text-amber-200 hover:text-white hover:border-amber-400 hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" /> Add Food Entry
          </Link>
        </div>
      </div>

      {/* Pattern Insights & Habit Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symptom Pattern Insights: Royal Purple Amethyst */}
        <div className="bg-gradient-to-br from-[#240a36]/85 via-[#180724]/90 to-[#0c0412]/95 rounded-3xl p-6 border border-purple-500/40 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/15 transition-all backdrop-blur-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">Food & Symptom Pattern Insights</h3>
            </div>
            <Link to="/patterns" className="text-sm font-bold text-purple-300 hover:text-purple-200 hover:underline">
              Analyze Logs
            </Link>
          </div>

          {pattern_insights.length === 0 ? (
            <div className="p-4 rounded-2xl bg-black/50 border border-purple-500/20 text-sm text-purple-200">
              <p className="font-bold text-white mb-1.5">No symptom patterns detected yet.</p>
              <p className="leading-relaxed text-zinc-300">
                Log your meals and any digestive feelings (bloating, acidity) in the Symptom Diary.
                SehatSense AI will automatically identify repeated associations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pattern_insights.map((ins) => (
                <div key={ins.id} className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-purple-200">{ins.title}</span>
                    <span className="text-xs font-bold bg-purple-900/60 text-purple-300 px-2.5 py-0.5 rounded-full capitalize">
                      {ins.confidence} confidence
                    </span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed mb-2">{ins.description}</p>
                  {ins.actionable_tip && (
                    <p className="text-xs text-purple-200 font-semibold bg-purple-950/60 border border-purple-800/40 p-2.5 rounded-xl">
                      💡 Tip: {ins.actionable_tip}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habit Insights: Forest Jade Teal */}
        <div className="bg-gradient-to-br from-[#062922]/85 via-[#041a16]/90 to-[#040e0c]/95 rounded-3xl p-6 border border-teal-500/40 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-500/15 transition-all backdrop-blur-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">Your Habit Insights</h3>
            </div>
            <Link to="/habits" className="text-sm font-bold text-teal-300 hover:text-teal-200 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {habit_insights.map((h, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-black/50 border border-teal-500/20">
                <h4 className="text-sm font-bold text-teal-100 mb-1.5">{h.title}</h4>
                <p className="text-sm text-zinc-200 leading-relaxed mb-2">{h.description}</p>
                {h.actionable_tip && (
                  <p className="text-xs text-teal-200 font-bold bg-teal-950/50 border border-teal-800/40 p-2.5 rounded-xl">
                    Action to consider: {h.actionable_tip}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <MedicalDisclaimer />
    </div>
  );
};
