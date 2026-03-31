
import React, { useState, useEffect } from 'react';

import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Instead of: import { useNotifications } from './App';
import { useNotifications } from './Context/NotificationContext'; // ✅ New import
import './NutritionAnalytics.css';

const NutritionPage = () => {
  const { addNotification } = useNotifications();
  const token = localStorage.getItem("token");
  
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [selectedMetric, setSelectedMetric] = useState('calories');
  const [analyticsData, setAnalyticsData] = useState({
    dailyTrend: [],
    macroDistribution: [],
    mealDistribution: [],
    weeklyAverage: {},
    topFoods: [],
    calorieBalance: [],
    nutrientDensity: [],
    weeklyComparison: [],
    goalsProgress: {},
    timeOfDayAnalysis: []
  });

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFE194', '#B19CD9', '#FF9999', '#6C5B7B'];
  const MACRO_COLORS = {
    protein: '#FF6B6B',
    carbs: '#4ECDC4',
    fats: '#FFD93D',
    calories: '#FF9F1C'
  };

  // Goals
  const GOALS = {
    calories: 2000,
    protein: 120,
    carbs: 250,
    fats: 55
  };

  // Fetch nutrition data
  useEffect(() => {
    fetchNutritionData();
  }, []);

  const fetchNutritionData = async () => {
    if (!token) {
      addNotification("error", "Please login to view nutrition data", "🔐");
      return;
    }

    try {
      setLoading(true);
      
      // Fetch data for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const res = await axios.get(
        `http://localhost:3000/Nutrition/list`,
        {
          params: { 
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data?.success) {
        setEntries(res.data.data);
        processAnalytics(res.data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      addNotification("error", "Failed to load nutrition data", "❌");
    } finally {
      setLoading(false);
    }
  };

  // Filter data by time range
  const filterByTimeRange = (data, range) => {
    const now = new Date();
    const filterDate = new Date();
    
    switch(range) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(entry => new Date(entry.date) >= filterDate);
  };

  // Process analytics data
  const processAnalytics = (nutritionData) => {
    const filteredData = filterByTimeRange(nutritionData, timeRange);
    
    // 1. Daily Trend (Line Chart)
    const dailyTotals = {};
    filteredData.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyTotals[date]) {
        dailyTotals[date] = { calories: 0, protein: 0, carbs: 0, fats: 0, date };
      }
      
      entry.foodItems?.forEach(item => {
        dailyTotals[date].calories += Number(item.calories) || 0;
        dailyTotals[date].protein += Number(item.protein) || 0;
        dailyTotals[date].carbs += Number(item.carbs) || 0;
        dailyTotals[date].fats += Number(item.fats) || 0;
      });
    });

    const dailyTrend = Object.values(dailyTotals).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // 2. Macronutrient Distribution (Pie Chart)
    let totalProtein = 0, totalCarbs = 0, totalFats = 0, totalCalories = 0;
    
    filteredData.forEach(entry => {
      entry.foodItems?.forEach(item => {
        totalProtein += Number(item.protein) || 0;
        totalCarbs += Number(item.carbs) || 0;
        totalFats += Number(item.fats) || 0;
        totalCalories += Number(item.calories) || 0;
      });
    });

    const macroDistribution = [
      { name: 'Protein', value: totalProtein, color: MACRO_COLORS.protein, unit: 'g' },
      { name: 'Carbs', value: totalCarbs, color: MACRO_COLORS.carbs, unit: 'g' },
      { name: 'Fats', value: totalFats, color: MACRO_COLORS.fats, unit: 'g' }
    ];

    // 3. Meal Distribution (Pie Chart)
    const mealCalories = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0
    };

    filteredData.forEach(entry => {
      const mealCal = entry.foodItems?.reduce((sum, item) => sum + (Number(item.calories) || 0), 0) || 0;
      mealCalories[entry.mealType] = (mealCalories[entry.mealType] || 0) + mealCal;
    });

    const mealDistribution = Object.entries(mealCalories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    })).filter(meal => meal.value > 0);

    // 4. Weekly Averages
    const weeklyData = {};
    filteredData.forEach(entry => {
      const date = new Date(entry.date);
      const weekKey = `Week ${Math.ceil(date.getDate() / 7)}`;
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 };
      }
      
      entry.foodItems?.forEach(item => {
        weeklyData[weekKey].calories += Number(item.calories) || 0;
        weeklyData[weekKey].protein += Number(item.protein) || 0;
        weeklyData[weekKey].carbs += Number(item.carbs) || 0;
        weeklyData[weekKey].fats += Number(item.fats) || 0;
      });
      weeklyData[weekKey].count++;
    });

    const weeklyAverage = {};
    Object.entries(weeklyData).forEach(([week, data]) => {
      weeklyAverage[week] = {
        calories: Math.round(data.calories / data.count),
        protein: Math.round(data.protein / data.count),
        carbs: Math.round(data.carbs / data.count),
        fats: Math.round(data.fats / data.count)
      };
    });

    // 5. Top Foods
    const foodFrequency = {};
    filteredData.forEach(entry => {
      entry.foodItems?.forEach(item => {
        if (!foodFrequency[item.name]) {
          foodFrequency[item.name] = {
            count: 0,
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0
          };
        }
        foodFrequency[item.name].count++;
        foodFrequency[item.name].totalCalories += Number(item.calories) || 0;
        foodFrequency[item.name].totalProtein += Number(item.protein) || 0;
        foodFrequency[item.name].totalCarbs += Number(item.carbs) || 0;
        foodFrequency[item.name].totalFats += Number(item.fats) || 0;
      });
    });

    const topFoods = Object.entries(foodFrequency)
      .map(([name, data]) => ({
        name,
        frequency: data.count,
        avgCalories: Math.round(data.totalCalories / data.count),
        totalCalories: data.totalCalories
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8);

    // 6. Calorie Balance (Goal vs Actual)
    const calorieBalance = dailyTrend.map(day => ({
      date: day.date,
      actual: day.calories,
      goal: GOALS.calories,
      difference: day.calories - GOALS.calories
    }));

    // 7. Nutrient Density (Calories per gram)
    const nutrientDensity = macroDistribution.map(macro => ({
      name: macro.name,
      caloriesPerGram: macro.name === 'Protein' ? 4 : macro.name === 'Carbs' ? 4 : 9,
      actual: macro.value,
      calories: macro.name === 'Protein' ? macro.value * 4 : 
                macro.name === 'Carbs' ? macro.value * 4 : 
                macro.value * 9
    }));

    // 8. Weekly Comparison
    const weeklyComparison = Object.entries(weeklyAverage).map(([week, data]) => ({
      week,
      ...data
    }));

    // 9. Goals Progress
    const goalsProgress = {
      calories: Math.min(100, Math.round((totalCalories / (GOALS.calories * filteredData.length)) * 100)),
      protein: Math.min(100, Math.round((totalProtein / (GOALS.protein * filteredData.length)) * 100)),
      carbs: Math.min(100, Math.round((totalCarbs / (GOALS.carbs * filteredData.length)) * 100)),
      fats: Math.min(100, Math.round((totalFats / (GOALS.fats * filteredData.length)) * 100))
    };

    // 10. Time of Day Analysis
    const timeSlots = {
      morning: { name: 'Morning (6-12)', calories: 0, count: 0 },
      afternoon: { name: 'Afternoon (12-18)', calories: 0, count: 0 },
      evening: { name: 'Evening (18-24)', calories: 0, count: 0 },
      night: { name: 'Night (0-6)', calories: 0, count: 0 }
    };

    filteredData.forEach(entry => {
      const hour = new Date(entry.date).getHours();
      const calories = entry.foodItems?.reduce((sum, item) => sum + (Number(item.calories) || 0), 0) || 0;
      
      if (hour >= 6 && hour < 12) {
        timeSlots.morning.calories += calories;
        timeSlots.morning.count++;
      } else if (hour >= 12 && hour < 18) {
        timeSlots.afternoon.calories += calories;
        timeSlots.afternoon.count++;
      } else if (hour >= 18 && hour < 24) {
        timeSlots.evening.calories += calories;
        timeSlots.evening.count++;
      } else {
        timeSlots.night.calories += calories;
        timeSlots.night.count++;
      }
    });

    const timeOfDayAnalysis = Object.values(timeSlots).map(slot => ({
      name: slot.name,
      avgCalories: slot.count > 0 ? Math.round(slot.calories / slot.count) : 0,
      totalCalories: slot.calories,
      count: slot.count
    }));

    setAnalyticsData({
      dailyTrend,
      macroDistribution,
      mealDistribution,
      weeklyAverage,
      topFoods,
      calorieBalance,
      nutrientDensity,
      weeklyComparison,
      goalsProgress,
      timeOfDayAnalysis
    });
  };

  // Update when time range changes
  useEffect(() => {
    if (entries.length > 0) {
      processAnalytics(entries);
    }
  }, [timeRange]);

  if (loading) {
    return (
      <div className="nutrition-analytics-loading">
        <div className="spinner"></div>
        <p>Loading nutrition analytics...</p>
      </div>
    );
  }

  return (
    <div className="nutrition-analytics">
      <div className="analytics-header">
        <h1>🥗 Nutrition Analytics Dashboard</h1>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'week' ? 'active' : ''} 
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''} 
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={timeRange === 'year' ? 'active' : ''} 
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-content">
            <span className="metric-value">{analyticsData.dailyTrend.length}</span>
            <span className="metric-label">Days Tracked</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🍎</div>
          <div className="metric-content">
            <span className="metric-value">{analyticsData.topFoods.length}</span>
            <span className="metric-label">Unique Foods</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⚖️</div>
          <div className="metric-content">
            <span className="metric-value">
              {analyticsData.macroDistribution.reduce((sum, m) => sum + m.value, 0)}g
            </span>
            <span className="metric-label">Total Macros</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <span className="metric-value">
              {Math.round(analyticsData.macroDistribution.reduce((sum, m) => 
                sum + (m.name === 'Protein' ? m.value * 4 : m.name === 'Carbs' ? m.value * 4 : m.value * 9), 0
              ))}
            </span>
            <span className="metric-label">Total Calories</span>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="goals-section">
        <h3>🎯 Daily Goals Progress</h3>
        <div className="goals-grid">
          {Object.entries(analyticsData.goalsProgress).map(([goal, progress]) => (
            <div key={goal} className="goal-card">
              <div className="goal-header">
                <span className="goal-name">{goal.charAt(0).toUpperCase() + goal.slice(1)}</span>
                <span className="goal-percent">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${progress}%`,
                    background: MACRO_COLORS[goal] || '#4ECDC4'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Daily Calorie Trend */}
        <div className="chart-card full-width">
          <h3>📈 Daily Calorie Intake</h3>
          <p className="chart-subtitle">Track your daily calories vs goal</p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={analyticsData.calorieBalance}>
              <defs>
                <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="actual" fill="url(#calorieGradient)" name="Actual Calories" />
              <Line type="monotone" dataKey="goal" stroke="#4ECDC4" strokeWidth={2} name="Daily Goal" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Macronutrient Distribution */}
        <div className="chart-card">
          <h3>🥑 Macronutrient Distribution</h3>
          <p className="chart-subtitle">Total protein, carbs & fats</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData.macroDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.macroDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                formatter={(value) => [`${value}g`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="macro-legend">
            {analyticsData.macroDistribution.map((macro, i) => (
              <div key={i} className="macro-item">
                <span className="macro-dot" style={{ background: macro.color }}></span>
                <span className="macro-name">{macro.name}</span>
                <span className="macro-value">{macro.value}g</span>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Distribution */}
        <div className="chart-card">
          <h3>🍽️ Calories by Meal</h3>
          <p className="chart-subtitle">How you distribute calories</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData.mealDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.mealDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                formatter={(value) => [`${Math.round(value)} kcal`, 'Calories']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Macro Trend Line Chart */}
        <div className="chart-card full-width">
          <h3>📊 Macronutrient Trends</h3>
          <p className="chart-subtitle">Protein, Carbs & Fats over time</p>
          <div className="metric-selector">
            <button 
              className={selectedMetric === 'calories' ? 'active' : ''}
              onClick={() => setSelectedMetric('calories')}
            >
              Calories
            </button>
            <button 
              className={selectedMetric === 'protein' ? 'active' : ''}
              onClick={() => setSelectedMetric('protein')}
            >
              Protein
            </button>
            <button 
              className={selectedMetric === 'carbs' ? 'active' : ''}
              onClick={() => setSelectedMetric('carbs')}
            >
              Carbs
            </button>
            <button 
              className={selectedMetric === 'fats' ? 'active' : ''}
              onClick={() => setSelectedMetric('fats')}
            >
              Fats
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={MACRO_COLORS[selectedMetric] || '#4ECDC4'} 
                strokeWidth={2}
                name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Comparison */}
        <div className="chart-card">
          <h3>📅 Weekly Average Comparison</h3>
          <p className="chart-subtitle">Calories by week</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.weeklyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="calories" fill="#FF6B6B" name="Calories">
                {analyticsData.weeklyComparison.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time of Day Analysis */}
        <div className="chart-card">
          <h3>⏰ Time of Day Analysis</h3>
          <p className="chart-subtitle">Average calories by time</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.timeOfDayAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="avgCalories" fill="#45B7D1" name="Avg Calories">
                {analyticsData.timeOfDayAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Foods */}
        <div className="chart-card">
          <h3>🥑 Most Frequent Foods</h3>
          <p className="chart-subtitle">Your favorite foods</p>
          <div className="top-foods-list">
            {analyticsData.topFoods.map((food, index) => (
              <div key={index} className="food-item">
                <span className="food-rank">#{index + 1}</span>
                <span className="food-name">{food.name}</span>
                <span className="food-frequency">{food.frequency}x</span>
                <span className="food-calories">{food.avgCalories} kcal</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrient Density */}
        <div className="chart-card">
          <h3>⚖️ Nutrient Density</h3>
          <p className="chart-subtitle">Calories from macros</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.nutrientDensity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={60} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="calories" fill="#4ECDC4" name="Calories">
                {analyticsData.nutrientDensity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="chart-card full-width">
          <h3>📊 Nutrition Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Average Daily Calories</span>
              <span className="summary-value">
                {Math.round(analyticsData.dailyTrend.reduce((sum, d) => sum + d.calories, 0) / analyticsData.dailyTrend.length || 0)} kcal
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Protein</span>
              <span className="summary-value">
                {Math.round(analyticsData.dailyTrend.reduce((sum, d) => sum + d.protein, 0) / analyticsData.dailyTrend.length || 0)}g
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Carbs</span>
              <span className="summary-value">
                {Math.round(analyticsData.dailyTrend.reduce((sum, d) => sum + d.carbs, 0) / analyticsData.dailyTrend.length || 0)}g
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Fats</span>
              <span className="summary-value">
                {Math.round(analyticsData.dailyTrend.reduce((sum, d) => sum + d.fats, 0) / analyticsData.dailyTrend.length || 0)}g
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Most Active Meal</span>
              <span className="summary-value">
                {analyticsData.mealDistribution.reduce((max, meal) => meal.value > (max.value || 0) ? meal : max, {}).name || 'N/A'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Best Time to Eat</span>
              <span className="summary-value">
                {analyticsData.timeOfDayAnalysis.reduce((max, time) => time.avgCalories > (max.avgCalories || 0) ? time : max, {}).name || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionPage;