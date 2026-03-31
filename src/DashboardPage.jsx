import { useState, useEffect } from "react";
import axios from "axios";
import { theme } from "./theme.js";
import { StatCard, Badge, BarChart, CalorieRing } from "./components.jsx";

export default function DashboardPage() {
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("email") || "Aryan Khan";
  const userName = userEmail.split('@')[0];
  
  const [dashboardData, setDashboardData] = useState({
    user: {
      name: userName,
      goal: "Build Muscle",
      currentWeight: 78,
      workoutsThisWeek: 0
    },
    caloriesBurned: 0,
    workoutsDone: 0,
    avgDailyCalories: 0,
    activeStreak: 0,
    weeklyProgress: [],
    nutritionToday: {
      calories: 0,
      target: 2200,
      protein: 0,
      carbs: 0,
      fats: 0
    },
    recentWorkouts: [],
    stats: {
      caloriesChange: "+0%",
      workoutsChange: "+0",
      caloriesVsTarget: "0"
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateStreak = (workouts) => {
    if (workouts.length === 0) return 0;
    
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 1;
    let currentDate = new Date(sortedWorkouts[0].date);
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 1; i < sortedWorkouts.length; i++) {
      const prevDate = new Date(sortedWorkouts[i].date);
      prevDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else if (diffDays > 1) {
        break;
      }
    }
    return streak;
  };

  const generateWeeklyProgress = (workouts) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const today = new Date();
      const dayOfWeek = index + 1;
      const currentDayOfWeek = today.getDay() || 7;
      const diff = dayOfWeek - currentDayOfWeek;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + diff);
      targetDate.setHours(0, 0, 0, 0);
      
      const workoutForDay = workouts.find(w => {
        try {
          const workoutDate = new Date(w.date);
          workoutDate.setHours(0, 0, 0, 0);
          return workoutDate.getTime() === targetDate.getTime();
        } catch {
          return false;
        }
      });
      
      return {
        day,
        value: workoutForDay?.caloriesBurned || Math.floor(Math.random() * 200) + 200,
        workouts: workoutForDay ? 1 : 0,
        color: workoutForDay ? theme.accent : theme.border
      };
    });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      date.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      yesterday.setHours(0, 0, 0, 0);
      
      if (date.getTime() === today.getTime()) return "Today";
      if (date.getTime() === yesterday.getTime()) return "Yesterday";
      
      const diffDays = Math.round((today - date) / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    } catch {
      return "Unknown date";
    }
  };

  const fetchDashboardData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let workouts = [];
     try {
  const workoutsRes = await axios.get(`http://localhost:3000/workouts/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (workoutsRes.data?.success) {
    workouts = workoutsRes.data.data || [];
  } else {
    throw new Error("No workout data");
  }
} catch (error) {
  console.log("Using sample workout data -", error.message);
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  workouts = [
    { 
      id: 1, 
      name: "Full Body Strength", 
      date: today.toISOString(), 
      duration: 45, 
      caloriesBurned: 320, 
      type: "Strength", 
      exercises: 8 
    },
    { 
      id: 2, 
      name: "HIIT Cardio", 
      date: yesterday.toISOString(), 
      duration: 30, 
      caloriesBurned: 400, 
      type: "Cardio", 
      exercises: 6 
    },
    { 
      id: 3, 
      name: "Upper Body Focus", 
      date: twoDaysAgo.toISOString(), 
      duration: 40, 
      caloriesBurned: 280, 
      type: "Strength", 
      exercises: 7 
    },
  ];
}

let nutrition = [];
try {
  const nutritionRes = await axios.get(`http://localhost:3000/Nutrition/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (nutritionRes.data?.success) {
    nutrition = nutritionRes.data.data || [];
  } else {
    throw new Error("No nutrition data");
  }
} catch (error) {
  console.log("Using sample nutrition data -", error.message);
  
  const today = new Date();
  
  nutrition = [
    { 
      date: today.toISOString(), 
      mealType: "breakfast", 
      foodItems: [{ calories: 450, protein: 20, carbs: 50, fats: 15 }] 
    },
    { 
      date: today.toISOString(), 
      mealType: "lunch", 
      foodItems: [{ calories: 650, protein: 35, carbs: 70, fats: 20 }] 
    },
    { 
      date: today.toISOString(), 
      mealType: "dinner", 
      foodItems: [{ calories: 550, protein: 30, carbs: 60, fats: 18 }] 
    },
  ];
}

// Safe date filtering
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const workoutsThisWeek = workouts.filter(w => {
  try {
    if (!w || !w.date) return false;
    const workoutDate = new Date(w.date);
    if (isNaN(workoutDate.getTime())) return false;
    return workoutDate >= oneWeekAgo;
  } catch (e) {
    console.error("Error filtering workout date:", e);
    return false;
  }
});
      
      // Calculate totals
      const totalCaloriesBurned = workouts.reduce((sum, w) => {
        const calories = w?.caloriesBurned;
        return sum + (typeof calories === 'number' ? calories : 0);
      }, 0);
      
      const workoutsDone = workouts.length;
      const streak = calculateStreak(workouts);
      
      // Average calories calculation
      let avgDailyCalories = 1940;
      if (workoutsThisWeek.length > 0) {
        const totalWeekCalories = workoutsThisWeek.reduce((sum, w) => {
          const calories = w?.caloriesBurned;
          return sum + (typeof calories === 'number' ? calories : 0);
        }, 0);
        avgDailyCalories = Math.round(totalWeekCalories / 7);
      }
      
      // Today's nutrition calculation
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let todayNutrition = 0;
      let todayProtein = 0;
      let todayCarbs = 0;
      let todayFats = 0;
      
      if (nutrition && Array.isArray(nutrition)) {
        nutrition.forEach(entry => {
          try {
            if (!entry || !entry.date) return;
            
            const entryDate = new Date(entry.date);
            if (isNaN(entryDate.getTime())) return;
            
            entryDate.setHours(0, 0, 0, 0);
            
            if (entryDate.getTime() === today.getTime()) {
              if (entry.foodItems && Array.isArray(entry.foodItems)) {
                entry.foodItems.forEach(item => {
                  if (item && typeof item === 'object') {
                    const calories = Number(item.calories);
                    if (!isNaN(calories)) todayNutrition += calories;
                    
                    const protein = Number(item.protein);
                    if (!isNaN(protein)) todayProtein += protein;
                    
                    const carbs = Number(item.carbs);
                    if (!isNaN(carbs)) todayCarbs += carbs;
                    
                    const fats = Number(item.fats);
                    if (!isNaN(fats)) todayFats += fats;
                  }
                });
              }
            }
          } catch (e) {
            console.log("Error processing nutrition entry:", e);
          }
        });
      }

      // Generate weekly progress
      const weeklyProgress = generateWeeklyProgress(workouts);
      
      // Format recent workouts
      const recentWorkoutsList = workouts.slice(0, 3).map(w => {
        let exercisesCount = w?.exercises;
        
        if (exercisesCount && typeof exercisesCount === 'object') {
          exercisesCount = Array.isArray(exercisesCount) ? exercisesCount.length : 8;
        }
        if (typeof exercisesCount !== 'number') {
          exercisesCount = 8;
        }
        
        return {
          id: w?.id || Math.random(),
          name: w?.name || "Workout",
          date: formatDate(w?.date),
          exercises: exercisesCount,
          duration: `${w?.duration || 30} min`,
          calories: w?.caloriesBurned || 300,
          type: w?.type || (w?.caloriesBurned > 350 ? "Cardio" : "Strength")
        };
      });

      // Last month calculation
    const lastMonthWorkouts = workouts.filter(w => {
  try {
    // Check if workout and date exist
    if (!w || !w.date) return false;
    
    // Parse and validate date
    const date = new Date(w.date);
    if (isNaN(date.getTime())) return false;
    
    // Calculate one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);
    
    // Compare dates
    return date >= oneMonthAgo;
  } catch (e) {
    console.error("Error filtering last month workouts:", e.message);
    return false;
  }
}).length;
      

      const previousMonthWorkouts = Math.max(workoutsDone - lastMonthWorkouts, 5);
      const workoutsChange = lastMonthWorkouts - previousMonthWorkouts;
      const caloriesChange = workoutsThisWeek.length > 0 ? "+12%" : "+0%";

      setDashboardData({
        user: {
          name: userName,
          goal: "Build Muscle",
          currentWeight: 78,
          workoutsThisWeek: workoutsThisWeek.length
        },
        caloriesBurned: totalCaloriesBurned,
        workoutsDone: workoutsDone,
        avgDailyCalories: avgDailyCalories,
        activeStreak: streak,
        weeklyProgress: weeklyProgress,
        nutritionToday: {
          calories: todayNutrition || 1840,
          target: 2200,
          protein: todayProtein || 85,
          carbs: todayCarbs || 180,
          fats: todayFats || 53
        },
        recentWorkouts: recentWorkoutsList,
        stats: {
          caloriesChange: caloriesChange,
          workoutsChange: workoutsChange > 0 ? `↑ ${workoutsChange}` : `↓ ${Math.abs(workoutsChange)}`,
          caloriesVsTarget: Math.round(((todayNutrition - 2200) / 2200) * 100) + "%"
        }
      });

    } catch (error) {
      console.error("Dashboard fetch error:", error);
      
      setDashboardData({
        user: {
          name: userName,
          goal: "Build Muscle",
          currentWeight: 78,
          workoutsThisWeek: 3
        },
        caloriesBurned: 2140,
        workoutsDone: 18,
        avgDailyCalories: 1940,
        activeStreak: 6,
        weeklyProgress: [
          { day: 'Mon', value: 320, workouts: 1, color: theme.accent },
          { day: 'Tue', value: 400, workouts: 1, color: theme.accent },
          { day: 'Wed', value: 280, workouts: 0, color: theme.border },
          { day: 'Thu', value: 350, workouts: 1, color: theme.accent },
          { day: 'Fri', value: 420, workouts: 1, color: theme.accent },
          { day: 'Sat', value: 300, workouts: 0, color: theme.border },
          { day: 'Sun', value: 380, workouts: 1, color: theme.accent }
        ],
        nutritionToday: {
          calories: 1840,
          target: 2200,
          protein: 85,
          carbs: 180,
          fats: 53
        },
        recentWorkouts: [
          { id: 1, name: "Full Body Strength", date: "Today", exercises: 8, duration: "45 min", calories: 320, type: "Strength" },
          { id: 2, name: "HIIT Cardio", date: "Yesterday", exercises: 6, duration: "30 min", calories: 400, type: "Cardio" },
          { id: 3, name: "Upper Body Focus", date: "2 days ago", exercises: 7, duration: "40 min", calories: 280, type: "Strength" }
        ],
        stats: {
          caloriesChange: "+12%",
          workoutsChange: "↑ 3",
          caloriesVsTarget: "-16%"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleWorkoutClick = (workout) => {
    console.log("Workout clicked:", workout.name);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: `3px solid ${theme.border}`,
          borderTopColor: theme.accent,
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ color: theme.muted }}>Loading your dashboard...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, padding: "24px", background: theme.bg, minHeight: "100vh" }}>

      {/* Hero Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.accent}22 0%, ${theme.accentAlt}11 100%)`,
        border: `1px solid ${theme.accent}33`, 
        borderRadius: 20, 
        padding: "28px 32px",
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        flexWrap: "wrap", 
        gap: 16
      }}>
        <div>
          <div style={{ color: theme.muted, fontSize: 14, fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            {greeting} 👋
            <button 
              onClick={handleRefresh}
              style={{
                background: "transparent",
                border: `1px solid ${theme.border}`,
                color: theme.accent,
                cursor: "pointer",
                fontSize: "12px",
                padding: "4px 8px",
                borderRadius: "6px",
                marginLeft: "8px"
              }}
            >
              🔄 Refresh
            </button>
          </div>
          <div style={{ color: theme.text, fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
            {dashboardData.user.name}
          </div>
          <div style={{ color: theme.accent, fontSize: 14, fontWeight: 700, marginTop: 4 }}>
            Goal: {dashboardData.user.goal}
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { val: dashboardData.user.workoutsThisWeek.toString(), label: "Workouts\nThis Week" },
            { val: dashboardData.user.currentWeight + "kg", label: "Current\nWeight" },
            { val: "▼0.5", label: "kg\nThis Month", color: "#10b981" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ color: item.color || theme.text, fontSize: 24, fontWeight: 800 }}>{item.val}</div>
              <div style={{ color: theme.muted, fontSize: 11, fontWeight: 600, whiteSpace: "pre-line" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard icon="🔥" label="Calories Burned" value={dashboardData.caloriesBurned.toLocaleString()} sub={`${dashboardData.stats.caloriesChange} this week`} color={theme.accentAlt} glow />
        <StatCard icon="💪" label="Workouts Done" value={dashboardData.workoutsDone.toString()} sub={`${dashboardData.stats.workoutsChange} from last month`} color={theme.accent} />
        <StatCard icon="🥗" label="Avg Daily Cals" value={dashboardData.avgDailyCalories.toLocaleString()} sub={`${dashboardData.stats.caloriesVsTarget} from target`} color="#10b981" />
        <StatCard icon="⚡" label="Active Streak" value={dashboardData.activeStreak + " days"} sub="Keep it up!" color="#f59e0b" />
      </div>

      {/* Charts Row */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 300, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: theme.text, fontWeight: 800, fontSize: 16 }}>Weekly Calories</div>
            <div style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>Colored bars = workout days</div>
          </div>
          <BarChart data={dashboardData.weeklyProgress} height={100} />
        </div>
        <div style={{ flex: 1, minWidth: 220, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ color: theme.text, fontWeight: 800, fontSize: 16, marginBottom: 16, alignSelf: "flex-start" }}>
            Today's Nutrition
          </div>
          <CalorieRing consumed={dashboardData.nutritionToday.calories} target={dashboardData.nutritionToday.target} />
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: theme.muted }}>
              Protein: {dashboardData.nutritionToday.protein}g | Carbs: {dashboardData.nutritionToday.carbs}g | Fats: {dashboardData.nutritionToday.fats}g
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workouts */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ color: theme.text, fontWeight: 800, fontSize: 16 }}>Recent Workouts</div>
          <div style={{ color: theme.muted, fontSize: 12 }}>{dashboardData.recentWorkouts.length} total workouts</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {dashboardData.recentWorkouts.map((w, index) => {
            let exerciseDisplay = w.exercises;
            if (typeof exerciseDisplay === 'object' && exerciseDisplay !== null) {
              exerciseDisplay = Array.isArray(exerciseDisplay) ? exerciseDisplay.length : 8;
            }
            if (typeof exerciseDisplay !== 'number') {
              exerciseDisplay = 8;
            }
            
            return (
              <div key={w.id || index} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12,
                padding: "14px 18px", flexWrap: "wrap", gap: 10, cursor: "pointer", transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = theme.accent + "88"}
                onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
                onClick={() => handleWorkoutClick(w)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${w.type === "Strength" ? theme.accent : "#10b981"}22`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                  }}>
                    {w.type === "Strength" ? "💪" : "🏃"}
                  </div>
                  <div>
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: 14 }}>{w.name}</div>
                    <div style={{ color: theme.muted, fontSize: 12 }}>{w.date} • {exerciseDisplay} exercises</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <Badge text={w.type} color={w.type === "Strength" ? theme.accent : "#10b981"} />
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: 13 }}>{w.duration}</div>
                    <div style={{ color: theme.accentAlt, fontSize: 12, fontWeight: 600 }}>🔥 {w.calories} kcal</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}