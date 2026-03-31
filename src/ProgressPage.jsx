import { useState } from "react";
import { theme, mockData } from "./theme.js";
import { StatCard, LineChart } from "./components.jsx";

import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ProgressPage() {
  const { progressData } = mockData;
  
  // State for all dynamic data (front end se data aayega)
  const [stats, setStats] = useState({
    currentWeight: 78,
    bodyFat: 16.2,
    benchPress: 80,
    fiveKTime: 26,
    weightChange: -0.5,
    bodyFatChange: -1.1,
    benchPressChange: 20,
    fiveKTimeChange: -6,
    totalWeightLoss: 0.7
  });

  // Chart data state
  const [weightChartData, setWeightChartData] = useState({
    labels: progressData.labels,
    values: progressData.weight
  });

  const [benchChartData, setBenchChartData] = useState({
    labels: progressData.labels,
    values: progressData.benchPress
  });

  const [runChartData, setRunChartData] = useState({
    labels: progressData.labels,
    values: progressData.runTime
  });

  // Measurements state
  const [measurements, setMeasurements] = useState([
    { label: "Chest", val: "102 cm", change: "+2 cm" },
    { label: "Waist", val: "82 cm", change: "-1 cm" },
    { label: "Hips", val: "96 cm", change: "0 cm" },
    { label: "Bicep", val: "37 cm", change: "+1.5 cm" },
    { label: "Thigh", val: "58 cm", change: "+0.5 cm" },
    { label: "Shoulder", val: "118 cm", change: "+3 cm" },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    weight: "",
    bodyFat: "",
    chest: "",
    waist: "",
    benchPress: "",
    runTime: "",
    notes: ""
  });

  // Notification state
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Update weight
  const updateWeight = () => {
    if (!formData.weight) {
      showNotification("Please enter weight", "error");
      return;
    }

    const newWeight = parseFloat(formData.weight);
    const oldWeight = stats.currentWeight;
    const change = (newWeight - oldWeight).toFixed(1);
    
    // Update stats
    setStats({
      ...stats,
      currentWeight: newWeight,
      weightChange: parseFloat(change),
      totalWeightLoss: stats.totalWeightLoss - parseFloat(change)
    });

    // Update weight chart
    const newValues = [...weightChartData.values.slice(1), newWeight];
    setWeightChartData({
      ...weightChartData,
      values: newValues
    });

    setFormData({ ...formData, weight: "" });
    showNotification(`Weight updated to ${newWeight}kg (${change > 0 ? '+' : ''}${change}kg)`);
  };

  // Update body fat
  const updateBodyFat = () => {
    if (!formData.bodyFat) {
      showNotification("Please enter body fat %", "error");
      return;
    }

    const newBodyFat = parseFloat(formData.bodyFat);
    const change = (newBodyFat - stats.bodyFat).toFixed(1);
    
    setStats({
      ...stats,
      bodyFat: newBodyFat,
      bodyFatChange: parseFloat(change)
    });

    setFormData({ ...formData, bodyFat: "" });
    showNotification(`Body fat updated to ${newBodyFat}% (${change > 0 ? '+' : ''}${change}%)`);
  };

  // Update bench press
  const updateBenchPress = () => {
    if (!formData.benchPress) {
      showNotification("Please enter bench press weight", "error");
      return;
    }

    const newBench = parseFloat(formData.benchPress);
    const oldBench = stats.benchPress;
    const change = newBench - oldBench;
    
    setStats({
      ...stats,
      benchPress: newBench,
      benchPressChange: stats.benchPressChange + change
    });

    // Update bench chart
    const newValues = [...benchChartData.values.slice(1), newBench];
    setBenchChartData({
      ...benchChartData,
      values: newValues
    });

    setFormData({ ...formData, benchPress: "" });
    showNotification(`Bench press updated to ${newBench}kg (${change > 0 ? '+' : ''}${change}kg)`);
  };

  // Update run time
  const updateRunTime = () => {
    if (!formData.runTime) {
      showNotification("Please enter 5K run time", "error");
      return;
    }

    const newTime = parseFloat(formData.runTime);
    const oldTime = stats.fiveKTime;
    const change = newTime - oldTime;
    
    setStats({
      ...stats,
      fiveKTime: newTime,
      fiveKTimeChange: stats.fiveKTimeChange + change
    });

    // Update run chart
    const newValues = [...runChartData.values.slice(1), newTime];
    setRunChartData({
      ...runChartData,
      values: newValues
    });

    setFormData({ ...formData, runTime: "" });
    showNotification(`5K time updated to ${newTime}min (${change > 0 ? '+' : ''}${change}min)`);
  };

  // Save new measurement
  const handleSaveEntry = () => {
    // Validation
    if (!formData.weight && !formData.chest && !formData.waist && !formData.bodyFat && !formData.benchPress && !formData.runTime) {
      showNotification("Please enter at least one measurement", "error");
      return;
    }

    // Update weight if provided
    if (formData.weight) {
      updateWeight();
    }

    // Update body fat if provided
    if (formData.bodyFat) {
      updateBodyFat();
    }

    // Update bench press if provided
    if (formData.benchPress) {
      updateBenchPress();
    }

    // Update run time if provided
    if (formData.runTime) {
      updateRunTime();
    }

    // Update chest measurement if provided
    if (formData.chest) {
      const chestIndex = measurements.findIndex(m => m.label === "Chest");
      const newMeasurements = [...measurements];
      const oldVal = parseInt(newMeasurements[chestIndex].val);
      const newVal = parseInt(formData.chest);
      const change = newVal - oldVal;
      
      newMeasurements[chestIndex] = {
        ...newMeasurements[chestIndex],
        val: `${formData.chest} cm`,
        change: change > 0 ? `+${change} cm` : change < 0 ? `${change} cm` : "0 cm"
      };
      setMeasurements(newMeasurements);
      setFormData({ ...formData, chest: "" });
    }

    // Update waist if provided
    if (formData.waist) {
      const waistIndex = measurements.findIndex(m => m.label === "Waist");
      const newMeasurements = [...measurements];
      const oldVal = parseInt(newMeasurements[waistIndex].val);
      const newVal = parseInt(formData.waist);
      const change = newVal - oldVal;
      
      newMeasurements[waistIndex] = {
        ...newMeasurements[waistIndex],
        val: `${formData.waist} cm`,
        change: change > 0 ? `+${change} cm` : change < 0 ? `${change} cm` : "0 cm"
      };
      setMeasurements(newMeasurements);
      setFormData({ ...formData, waist: "" });
    }

    showNotification("Measurements saved successfully! 🎉");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text("Fitness Progress Report", 14, 22);
    
    // Date
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

    // Stats Section
    doc.setFontSize(16);
    doc.setTextColor(theme.accent);
    doc.text("Current Statistics", 14, 45);
    
    const statsData = [
      ["Metric", "Value", "Change"],
      ["Current Weight", `${stats.currentWeight} kg`, stats.weightChange < 0 ? `▼ ${Math.abs(stats.weightChange)}kg` : `▲ ${stats.weightChange}kg`],
      ["Body Fat", `${stats.bodyFat}%`, stats.bodyFatChange < 0 ? `▼ ${Math.abs(stats.bodyFatChange)}%` : `▲ ${stats.bodyFatChange}%`],
      ["Bench Press", `${stats.benchPress} kg`, `▲ ${stats.benchPressChange}kg`],
      ["5K Run Time", `${stats.fiveKTime} min`, stats.fiveKTimeChange < 0 ? `▼ ${Math.abs(stats.fiveKTimeChange)} min` : `▲ ${stats.fiveKTimeChange} min`]
    ];
    
    doc.autoTable({
      startY: 50,
      head: [statsData[0]],
      body: statsData.slice(1),
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: theme.accent, textColor: [255,255,255] },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } }
    });

    // Measurements Section
    doc.setFontSize(16);
    doc.setTextColor(theme.accent);
    doc.text("Body Measurements", 14, doc.lastAutoTable.finalY + 15);
    
    const measureData = measurements.map(m => [m.label, m.val, m.change]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Measurement", "Current", "Change"]],
      body: measureData,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: theme.accent }
    });

    // Progress Data
    doc.setFontSize(16);
    doc.setTextColor(theme.accent);
    doc.text("Progress Over Time", 14, doc.lastAutoTable.finalY + 15);
    
    const progressRows = weightChartData.labels.map((label, i) => [
      label,
      `${weightChartData.values[i]} kg`,
      `${benchChartData.values[i]} kg`,
      `${runChartData.values[i]} min`
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Month", "Weight", "Bench Press", "5K Run"]],
      body: progressRows,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: theme.accent }
    });

    doc.save("fitness-progress-report.pdf");
    showNotification("PDF downloaded successfully! 📄");
  };

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const rows = [
      ["Fitness Progress Report"],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
      ["Current Statistics"],
      ["Metric", "Value", "Change"],
      ["Current Weight", `${stats.currentWeight} kg`, stats.weightChange < 0 ? `▼ ${Math.abs(stats.weightChange)}kg` : `▲ ${stats.weightChange}kg`],
      ["Body Fat", `${stats.bodyFat}%`, stats.bodyFatChange < 0 ? `▼ ${Math.abs(stats.bodyFatChange)}%` : `▲ ${stats.bodyFatChange}%`],
      ["Bench Press", `${stats.benchPress} kg`, `▲ ${stats.benchPressChange}kg`],
      ["5K Run Time", `${stats.fiveKTime} min`, stats.fiveKTimeChange < 0 ? `▼ ${Math.abs(stats.fiveKTimeChange)} min` : `▲ ${stats.fiveKTimeChange} min`],
      [],
      ["Body Measurements"],
      ["Measurement", "Current", "Change"],
      ...measurements.map(m => [m.label, m.val, m.change]),
      [],
      ["Progress Over Time"],
      ["Month", "Weight (kg)", "Bench Press (kg)", "5K Run (min)"],
      ...weightChartData.labels.map((label, i) => [
        label,
        weightChartData.values[i],
        benchChartData.values[i],
        runChartData.values[i]
      ])
    ];

    // Convert to CSV string
    const csvContent = rows.map(row => row.join(",")).join("\n");
    
    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "fitness-progress-data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification("CSV downloaded successfully! 📊");
  };

  // Share Progress
  const shareProgress = async () => {
    const shareText = `🏋️ My Fitness Progress 🏃

Current Stats:
• Weight: ${stats.currentWeight} kg (${stats.weightChange < 0 ? '▼' : '▲'} ${Math.abs(stats.weightChange)}kg)
• Body Fat: ${stats.bodyFat}% (${stats.bodyFatChange < 0 ? '▼' : '▲'} ${Math.abs(stats.bodyFatChange)}%)
• Bench Press: ${stats.benchPress} kg (▲ ${stats.benchPressChange}kg)
• 5K Run: ${stats.fiveKTime} min (${stats.fiveKTimeChange < 0 ? '▼' : '▲'} ${Math.abs(stats.fiveKTimeChange)}min)

Body Measurements:
${measurements.map(m => `• ${m.label}: ${m.val} (${m.change})`).join("\n")}

Track your progress with FitPulse!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Fitness Progress",
          text: shareText,
          url: window.location.href
        });
        showNotification("Shared successfully! 🔗");
      } catch (err) {
        if (err.name !== "AbortError") {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  // Copy to clipboard fallback
  const copyToClipboard = () => {
    const shareText = `My Fitness Progress - Check out my latest stats!`;
    navigator.clipboard.writeText(shareText);
    showNotification("Link copied to clipboard! 🔗");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>

      {/* Notification Toast */}
      {notification.show && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          background: notification.type === "success" ? theme.green : "#ff4444",
          color: "white",
          padding: "12px 24px",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          animation: "slideIn 0.3s ease",
          fontSize: 14,
          fontWeight: 600
        }}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div>
        <div style={{ color: theme.text, fontSize: 24, fontWeight: 900 }}>Progress Tracker</div>
        <div style={{ color: theme.muted, fontSize: 13, marginTop: 2 }}>Monitor your fitness journey over time</div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard icon="⚖️" label="Current Weight" value={`${stats.currentWeight} kg`} sub={`▼ ${Math.abs(stats.weightChange)}kg this month`} color={theme.green} />
        <StatCard icon="📏" label="Body Fat" value={`${stats.bodyFat}%`} sub={`▼ ${Math.abs(stats.bodyFatChange)}% this month`} color={theme.accent} />
        <StatCard icon="💪" label="Bench Press Max" value={`${stats.benchPress} kg`} sub={`▲ ${stats.benchPressChange}kg since start`} color={theme.yellow} glow />
        <StatCard icon="🏃" label="5K Best Time" value={`${stats.fiveKTime} min`} sub={`▼ ${Math.abs(stats.fiveKTimeChange)} min since start`} color={theme.accentAlt} />
      </div>

      {/* Weight Chart */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ color: theme.text, fontWeight: 800, fontSize: 16 }}>Weight Progress</div>
            <div style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>Monthly tracking in kg</div>
          </div>
          <div style={{
            background: `${theme.green}22`, color: theme.green, border: `1px solid ${theme.green}44`,
            borderRadius: 10, padding: "4px 12px", fontSize: 12, fontWeight: 700
          }}>▼ {stats.totalWeightLoss} kg total</div>
        </div>
        <LineChart values={weightChartData.values} labels={weightChartData.labels} color={theme.green} height={120} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {weightChartData.labels.map((l, i) => (
            <span key={i} style={{ color: theme.muted, fontSize: 11, fontWeight: 600, flex: 1, textAlign: "center" }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Two Charts Side by Side */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ color: theme.text, fontWeight: 800, fontSize: 15 }}>Bench Press</div>
              <div style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>Max weight in kg</div>
            </div>
            <div style={{
              background: `${theme.accent}22`, color: theme.accent, border: `1px solid ${theme.accent}44`,
              borderRadius: 10, padding: "4px 12px", fontSize: 12, fontWeight: 700
            }}>▲ +{stats.benchPressChange}kg</div>
          </div>
          <LineChart values={benchChartData.values} labels={benchChartData.labels} color={theme.accent} height={120} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {benchChartData.labels.map((l, i) => (
              <span key={i} style={{ color: theme.muted, fontSize: 11, fontWeight: 600, flex: 1, textAlign: "center" }}>{l}</span>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 280, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ color: theme.text, fontWeight: 800, fontSize: 15 }}>5K Run Time</div>
              <div style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>Minutes per run</div>
            </div>
            <div style={{
              background: `${theme.accentAlt}22`, color: theme.accentAlt, border: `1px solid ${theme.accentAlt}44`,
              borderRadius: 10, padding: "4px 12px", fontSize: 12, fontWeight: 700
            }}>▼ {Math.abs(stats.fiveKTimeChange)} min</div>
          </div>
          <LineChart values={runChartData.values} labels={runChartData.labels} color={theme.accentAlt} height={120} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {runChartData.labels.map((l, i) => (
              <span key={i} style={{ color: theme.muted, fontSize: 11, fontWeight: 600, flex: 1, textAlign: "center" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Body Measurements */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📏 Body Measurements</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {measurements.map((m, i) => (
            <div key={i} style={{ background: theme.surface, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ color: theme.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{m.label}</div>
              <div style={{ color: theme.text, fontWeight: 800, fontSize: 20 }}>{m.val}</div>
              <div style={{ 
                color: m.change.includes("-") ? theme.green : m.change === "0 cm" ? theme.muted : theme.accentAlt, 
                fontSize: 12, 
                fontWeight: 700, 
                marginTop: 2 
              }}>{m.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Log New Measurement */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 16 }}>➕ Log New Measurement</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input 
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleInputChange}
            style={{
              flex: 1, minWidth: 140, background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 13, outline: "none"
            }} 
          />
          <input 
            name="bodyFat"
            placeholder="Body Fat (%)"
            value={formData.bodyFat}
            onChange={handleInputChange}
            style={{
              flex: 1, minWidth: 140, background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 13, outline: "none"
            }} 
          />
          <input 
            name="chest"
            placeholder="Chest (cm)"
            value={formData.chest}
            onChange={handleInputChange}
            style={{
              flex: 1, minWidth: 140, background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 13, outline: "none"
            }} 
          />
          <input 
            name="waist"
            placeholder="Waist (cm)"
            value={formData.waist}
            onChange={handleInputChange}
            style={{
              flex: 1, minWidth: 140, background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 13, outline: "none"
            }} 
          />
          <input 
            name="benchPress"
            placeholder="Bench Press (kg)"
            value={formData.benchPress}
            onChange={handleInputChange}
            style={{
              flex: 1, minWidth: 140, background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 13, outline: "none"
            }} 
          />
          <input 
            name="runTime"
            placeholder="5K Run Time (min)"
            value={formData.runTime}
            onChange={handleInputChange}
            style={{
              flex: 1, minWidth: 140, background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 13, outline: "none"
            }} 
          />
          <input 
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleInputChange}
            style={{
              flex: 1, minWidth: 140, background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 10, padding: "10px 14px", color: theme.text, fontSize: 13, outline: "none"
            }} 
          />
          <button 
            onClick={handleSaveEntry}
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
              color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", 
              fontWeight: 800, cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            Save Entry
          </button>
        </div>
      </div>

      {/* Export Reports */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 14 }}>📤 Export Reports</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button 
            onClick={exportToPDF}
            style={{
              flex: 1, minWidth: 150, background: `${theme.accent}11`, color: theme.accent,
              border: `1px solid ${theme.accent}44`, borderRadius: 12, padding: "12px 18px",
              fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", gap: 8, 
              alignItems: "center", justifyContent: "center", transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${theme.accent}22`; e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${theme.accent}11`; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <span>📄</span> Export as PDF
          </button>
          
          <button 
            onClick={exportToCSV}
            style={{
              flex: 1, minWidth: 150, background: `${theme.green}11`, color: theme.green,
              border: `1px solid ${theme.green}44`, borderRadius: 12, padding: "12px 18px",
              fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", gap: 8, 
              alignItems: "center", justifyContent: "center", transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${theme.green}22`; e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${theme.green}11`; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <span>📊</span> Export as CSV
          </button>
          
          <button 
            onClick={shareProgress}
            style={{
              flex: 1, minWidth: 150, background: `${theme.yellow}11`, color: theme.yellow,
              border: `1px solid ${theme.yellow}44`, borderRadius: 12, padding: "12px 18px",
              fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", gap: 8, 
              alignItems: "center", justifyContent: "center", transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${theme.yellow}22`; e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${theme.yellow}11`; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <span>🔗</span> Share Progress
          </button>
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

    </div>
  );
}