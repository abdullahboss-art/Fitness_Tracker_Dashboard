import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Scatter
} from 'recharts';
// Instead of: import { useNotifications } from './App';
import { useNotifications } from './Context/NotificationContext';  
import './Workout.css';

const Workouts = () => {
  const { addNotification } = useNotifications();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, all
  // const [selectedExercise, setSelectedExercise] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({
    volumeData: [],
    frequencyData: [],
    strengthProgress: [],
    exerciseDistribution: [],
    difficultyDistribution: [],
    weeklyTrend: [],
    personalRecords: [],
    workoutHeatmap: [],
    exerciseStats: {}
  });

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFE194', '#B19CD9', '#FF9999', '#6C5B7B', '#88D8B0', '#FFB347'];

  // Fetch workouts
  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/workouts/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkouts(res.data.data);
      processAnalytics(res.data.data);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      addNotification('error', 'Failed to load workout data', '❌');
    } finally {
      setLoading(false);
    }
  };

  // Filter workouts by time range
  const filterWorkoutsByTimeRange = (workoutList, range) => {
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
        return workoutList;
    }
    
    return workoutList.filter(w => new Date(w.createdAt) >= filterDate);
  };

  // Process analytics data
  const processAnalytics = (workoutData) => {
    const filteredWorkouts = filterWorkoutsByTimeRange(workoutData, timeRange);
    
    // 1. Volume Over Time (Line Chart)
    const volumeByDate = {};
    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const volume = workout.exercises?.reduce((sum, e) => sum + (e.weight * e.sets * e.reps), 0) || 0;
      volumeByDate[date] = (volumeByDate[date] || 0) + volume;
    });
    
    const volumeData = Object.entries(volumeByDate).map(([date, volume]) => ({
      date,
      volume: (volume / 1000).toFixed(2), // Convert to kg
      displayVolume: volume
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // 2. Exercise Frequency (Bar Chart)
    const exerciseCount = {};
    filteredWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        exerciseCount[exercise.exerciseName] = (exerciseCount[exercise.exerciseName] || 0) + 1;
      });
    });
    
    const frequencyData = Object.entries(exerciseCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 3. Strength Progress for each exercise (Line Chart)
    const strengthProgress = {};
    filteredWorkouts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    filteredWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (!strengthProgress[exercise.exerciseName]) {
          strengthProgress[exercise.exerciseName] = [];
        }
        strengthProgress[exercise.exerciseName].push({
          date: new Date(workout.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: exercise.weight,
          reps: exercise.reps,
          sets: exercise.sets,
          volume: exercise.weight * exercise.sets * exercise.reps
        });
      });
    });

    // 4. Exercise Distribution (Pie Chart)
    const categoryDistribution = {};
    filteredWorkouts.forEach(workout => {
      categoryDistribution[workout.category] = (categoryDistribution[workout.category] || 0) + 1;
    });
    
    const exerciseDistribution = Object.entries(categoryDistribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // 5. Difficulty Distribution (Pie Chart)
    const difficultyCount = {};
    filteredWorkouts.forEach(workout => {
      difficultyCount[workout.difficulty] = (difficultyCount[workout.difficulty] || 0) + 1;
    });
    
    const difficultyDistribution = Object.entries(difficultyCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // 6. Weekly Trend (Area Chart)
    const weeklyVolume = {};
    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.createdAt);
      const weekKey = `Week ${Math.ceil(date.getDate() / 7)}`;
      const volume = workout.exercises?.reduce((sum, e) => sum + (e.weight * e.sets * e.reps), 0) || 0;
      weeklyVolume[weekKey] = (weeklyVolume[weekKey] || 0) + volume;
    });
    
    const weeklyTrend = Object.entries(weeklyVolume).map(([week, volume]) => ({
      week,
      volume: (volume / 1000).toFixed(2)
    }));

    // 7. Personal Records
    const personalRecords = {};
    filteredWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (!personalRecords[exercise.exerciseName] || exercise.weight > personalRecords[exercise.exerciseName]) {
          personalRecords[exercise.exerciseName] = exercise.weight;
        }
      });
    });
    
    const prList = Object.entries(personalRecords)
      .map(([exercise, weight]) => ({ exercise, weight }))
      .sort((a, b) => b.weight - a.weight);

    // 8. Workout Heatmap (Day of week vs Time of day)
    const heatmapData = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const times = ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)', 'Night (0-6)'];
    
    days.forEach(day => {
      times.forEach(time => {
        heatmapData[`${day}-${time}`] = 0;
      });
    });

    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.createdAt);
      const day = days[date.getDay()];
      const hour = date.getHours();
      let timeSlot;
      
      if (hour >= 6 && hour < 12) timeSlot = times[0];
      else if (hour >= 12 && hour < 18) timeSlot = times[1];
      else if (hour >= 18 && hour < 24) timeSlot = times[2];
      else timeSlot = times[3];
      
      heatmapData[`${day}-${timeSlot}`]++;
    });

    const workoutHeatmap = days.map(day => ({
      day,
      ...times.reduce((acc, time) => ({
        ...acc,
        [time]: heatmapData[`${day}-${time}`]
      }), {})
    }));

    // 9. Exercise Statistics
    const exerciseStats = {};
    filteredWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (!exerciseStats[exercise.exerciseName]) {
          exerciseStats[exercise.exerciseName] = {
            totalSets: 0,
            totalReps: 0,
            maxWeight: 0,
            avgWeight: 0,
            count: 0,
            weights: []
          };
        }
        const stats = exerciseStats[exercise.exerciseName];
        stats.totalSets += exercise.sets;
        stats.totalReps += exercise.reps * exercise.sets;
        stats.maxWeight = Math.max(stats.maxWeight, exercise.weight);
        stats.weights.push(exercise.weight);
        stats.count++;
      });
    });

    Object.keys(exerciseStats).forEach(exercise => {
      const stats = exerciseStats[exercise];
      stats.avgWeight = (stats.weights.reduce((a, b) => a + b, 0) / stats.weights.length).toFixed(1);
      delete stats.weights;
    });

    setAnalyticsData({
      volumeData,
      frequencyData,
      strengthProgress,
      exerciseDistribution,
      difficultyDistribution,
      weeklyTrend,
      personalRecords: prList,
      workoutHeatmap,
      exerciseStats
    });
  };

  // Update when time range changes
  useEffect(() => {
    if (workouts.length > 0) {
      processAnalytics(workouts);
    }
  }, [timeRange]);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="workout-analytics">
      <div className="analytics-header">
        <h1>📊 Workout Analytics Dashboard</h1>
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
          <button 
            className={timeRange === 'all' ? 'active' : ''} 
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">🏋️</div>
          <div className="metric-content">
            <span className="metric-value">{workouts.length}</span>
            <span className="metric-label">Total Workouts</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💪</div>
          <div className="metric-content">
            <span className="metric-value">
              {Object.keys(analyticsData.strengthProgress).length}
            </span>
            <span className="metric-label">Unique Exercises</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🏆</div>
          <div className="metric-content">
            <span className="metric-value">{analyticsData.personalRecords.length}</span>
            <span className="metric-label">Personal Records</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-content">
            <span className="metric-value">
              {analyticsData.volumeData.reduce((sum, d) => sum + parseFloat(d.volume), 0).toFixed(1)}k
            </span>
            <span className="metric-label">Total Volume</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Volume Over Time */}
        <div className="chart-card full-width">
          <h3>📈 Volume Progression Over Time</h3>
          <p className="chart-subtitle">Track your total lifting volume (kg)</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.volumeData}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#4ECDC4" 
                fillOpacity={1} 
                fill="url(#volumeGradient)" 
                name="Volume (kg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Exercise Frequency */}
        <div className="chart-card">
          <h3>📊 Most Frequent Exercises</h3>
          <p className="chart-subtitle">How often you do each exercise</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.frequencyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" width={80} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#FF6B6B">
                {analyticsData.frequencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Workout Distribution */}
        <div className="chart-card">
          <h3>🥧 Workout Categories</h3>
          <p className="chart-subtitle">Distribution by workout type</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData.exerciseDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.exerciseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Strength Progress */}
        {Object.entries(analyticsData.strengthProgress).map(([exercise, data]) => (
          data.length > 1 && (
            <div key={exercise} className="chart-card full-width">
              <h3>💪 {exercise} - Weight Progression</h3>
              <p className="chart-subtitle">Track your strength gains over time</p>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#FF6B6B" name="Weight (kg)" strokeWidth={2} />
                  <Bar yAxisId="right" dataKey="volume" fill="#4ECDC4" name="Volume" opacity={0.5} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )
        ))}

        {/* Difficulty Distribution */}
        <div className="chart-card">
          <h3>📊 Difficulty Levels</h3>
          <p className="chart-subtitle">Workout intensity distribution</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData.difficultyDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.difficultyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="chart-card">
          <h3>📅 Weekly Volume Trend</h3>
          <p className="chart-subtitle">Volume by week (1000s kg)</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="volume" fill="#45B7D1">
                {analyticsData.weeklyTrend.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Personal Records */}
        <div className="chart-card">
          <h3>🏆 Personal Records</h3>
          <p className="chart-subtitle">Your best lifts</p>
          <div className="pr-list">
            {analyticsData.personalRecords.slice(0, 5).map((pr, index) => (
              <div key={index} className="pr-item">
                <span className="pr-exercise">{pr.exercise}</span>
                <span className="pr-weight">{pr.weight} kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workout Heatmap */}
        <div className="chart-card full-width">
          <h3>🔥 Workout Heatmap</h3>
          <p className="chart-subtitle">When you're most active (Day vs Time)</p>
          <div className="heatmap-container">
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th>Day / Time</th>
                  <th>Morning</th>
                  <th>Afternoon</th>
                  <th>Evening</th>
                  <th>Night</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.workoutHeatmap.map((row, i) => (
                  <tr key={i}>
                    <td className="day-cell">{row.day}</td>
                    <td className={`heatmap-cell intensity-${Math.min(row['Morning (6-12)'], 5)}`}>
                      {row['Morning (6-12)']}
                    </td>
                    <td className={`heatmap-cell intensity-${Math.min(row['Afternoon (12-18)'], 5)}`}>
                      {row['Afternoon (12-18)']}
                    </td>
                    <td className={`heatmap-cell intensity-${Math.min(row['Evening (18-24)'], 5)}`}>
                      {row['Evening (18-24)']}
                    </td>
                    <td className={`heatmap-cell intensity-${Math.min(row['Night (0-6)'], 5)}`}>
                      {row['Night (0-6)']}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exercise Statistics */}
        <div className="chart-card full-width">
          <h3>📊 Exercise Statistics</h3>
          <p className="chart-subtitle">Detailed breakdown by exercise</p>
          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Total Sets</th>
                  <th>Total Reps</th>
                  <th>Max Weight</th>
                  <th>Avg Weight</th>
                  <th>Times Done</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analyticsData.exerciseStats).map(([exercise, stats], i) => (
                  <tr key={i}>
                    <td className="exercise-name">{exercise}</td>
                    <td>{stats.totalSets}</td>
                    <td>{stats.totalReps}</td>
                    <td className="max-weight">{stats.maxWeight} kg</td>
                    <td>{stats.avgWeight} kg</td>
                    <td>{stats.count}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workouts;