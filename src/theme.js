export const theme = {
  bg: "#0a0a0f",
  surface: "#12121a",
  card: "#1a1a26",
  border: "#2a2a3d",
  accent: "#6c63ff",
  accentGlow: "#6c63ff33",
  accentAlt: "#ff6584",
  green: "#00d4aa",
  yellow: "#ffd166",
  text: "#e8e8f0",
  muted: "#6b6b8a",
};

export const mockData = {
  user: { name: "Aryan Khan", email: "aryan@gmail.com", weight: "78 kg", age: 26, goal: "Build Muscle" },
  recentWorkouts: [
    { id: 1, name: "Chest & Triceps", type: "Strength", date: "Today", duration: "52 min", calories: 380, exercises: 6 },
    { id: 2, name: "Morning Run", type: "Cardio", date: "Yesterday", duration: "35 min", calories: 290, exercises: 1 },
    { id: 3, name: "Back & Biceps", type: "Strength", date: "Mon", duration: "48 min", calories: 340, exercises: 7 },
    { id: 4, name: "HIIT Session", type: "Cardio", date: "Sun", duration: "28 min", calories: 420, exercises: 8 },
  ],
  nutritionToday: { calories: 1840, target: 2200, protein: 142, carbs: 198, fat: 54 },
  weeklyProgress: [
    { day: "Mon", calories: 2100, workouts: 1 },
    { day: "Tue", calories: 1950, workouts: 0 },
    { day: "Wed", calories: 2300, workouts: 1 },
    { day: "Thu", calories: 1800, workouts: 1 },
    { day: "Fri", calories: 2050, workouts: 0 },
    { day: "Sat", calories: 1900, workouts: 1 },
    { day: "Sun", calories: 1840, workouts: 1 },
  ],
  workoutRoutines: [
    { id: 1, name: "Push Day", category: "Strength", exercises: [
      { name: "Bench Press", sets: 4, reps: 8, weight: "80kg" },
      { name: "Shoulder Press", sets: 3, reps: 10, weight: "50kg" },
      { name: "Tricep Dips", sets: 3, reps: 12, weight: "BW" },
    ]},
    { id: 2, name: "Pull Day", category: "Strength", exercises: [
      { name: "Deadlift", sets: 4, reps: 5, weight: "120kg" },
      { name: "Pull Ups", sets: 3, reps: 8, weight: "BW" },
      { name: "Barbell Row", sets: 3, reps: 10, weight: "70kg" },
    ]},
    { id: 3, name: "5K Run", category: "Cardio", exercises: [
      { name: "Warm Up", sets: 1, reps: 1, weight: "5min" },
      { name: "Run", sets: 1, reps: 1, weight: "5km" },
    ]},
  ],
  meals: [
    { type: "Breakfast", time: "7:30 AM", items: [
      { name: "Oats with Banana", calories: 380, protein: 12, carbs: 68, fat: 6 },
      { name: "Boiled Eggs (3)", calories: 210, protein: 18, carbs: 0, fat: 14 },
    ]},
    { type: "Lunch", time: "1:00 PM", items: [
      { name: "Chicken Rice Bowl", calories: 520, protein: 48, carbs: 62, fat: 8 },
    ]},
    { type: "Snack", time: "4:00 PM", items: [
      { name: "Protein Shake", calories: 180, protein: 30, carbs: 8, fat: 3 },
      { name: "Almonds (30g)", calories: 170, protein: 6, carbs: 4, fat: 15 },
    ]},
    { type: "Dinner", time: "8:00 PM", items: [
      { name: "Salmon & Veggies", calories: 380, protein: 28, carbs: 22, fat: 18 },
    ]},
  ],
  progressData: {
    weight: [78.5, 78.2, 77.9, 77.8, 77.5, 77.6, 78.0, 77.8],
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    benchPress: [60, 65, 70, 72, 75, 77, 80, 80],
    runTime: [32, 31, 30, 29, 28, 28, 27, 26],
  }
};
