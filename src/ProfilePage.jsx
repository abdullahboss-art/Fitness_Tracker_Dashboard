import { useState, useEffect } from "react";
import { theme } from "./theme.js";
import { Badge } from "./components.jsx";

export default function ProfilePage() {
  // State Management
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    weight: "",
    goal: ""
  });
  
  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, label: "Workout Reminders", val: "8:00 AM daily", enabled: true },
    { id: 2, label: "Meal Reminders", val: "Breakfast, Lunch, Dinner", enabled: true },
    { id: 3, label: "Goal Achievements", val: "Instant notification", enabled: true },
    { id: 4, label: "Weekly Summary", val: "Every Sunday", enabled: false },
    { id: 5, label: "New Follower Alerts", val: "Disabled", enabled: false },
  ]);
  
  // Settings State
  const [settings, setSettings] = useState({
    units: "Metric (kg, cm)",
    theme: "Dark",
    language: "English",
    weekStart: "Monday"
  });
  
  // Support Ticket State
  const [supportTicket, setSupportTicket] = useState({
    type: "",
    subject: "",
    message: ""
  });
  
  // Stats State
  const [stats, setStats] = useState({
    totalWorkouts: "0",
    caloriesBurned: "0",
    hoursTrained: "0",
    daysActive: "0"
  });
  
  // Avatar State
  const [avatar, setAvatar] = useState(null);
  
  // Validation Errors
  const [validationErrors, setValidationErrors] = useState({});

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
    { id: "support", label: "Support" },
  ];

  useEffect(() => {
    // Load data from localStorage
    loadFromLocalStorage();
  }, []);

  // LocalStorage se data load karo
  const loadFromLocalStorage = () => {
    try {
      const storedEmail = localStorage.getItem("email");
      const storedName = localStorage.getItem("name");
      const storedAge = localStorage.getItem("age");
      const storedWeight = localStorage.getItem("weight");
      const storedGoal = localStorage.getItem("goal");
      const storedStats = localStorage.getItem("stats");
      
      console.log("Loading from localStorage:", { 
        storedEmail, storedName, storedAge, storedWeight, storedGoal 
      });
      
      setFormData({
        name: storedName || (storedEmail ? storedEmail.split('@')[0] : ""),
        email: storedEmail || "",
        age: storedAge || "",
        weight: storedWeight || "",
        goal: storedGoal || ""
      });
      
      if (storedStats) {
        try {
          setStats(JSON.parse(storedStats));
        } catch (e) {
          console.error("Error parsing stats:", e);
        }
      }
      
    } catch (err) {
      console.error("Error loading from localStorage:", err);
    }
  };

  // Save to localStorage only (bypass API for now)
  const handleSaveChanges = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!validateForm()) {
        throw new Error("Please fix validation errors");
      }
      
      console.log("Saving to localStorage:", formData);
      
      // Save to localStorage
      if (formData.name) localStorage.setItem("name", formData.name);
      if (formData.email) localStorage.setItem("email", formData.email);
      if (formData.age) localStorage.setItem("age", formData.age);
      if (formData.weight) localStorage.setItem("weight", formData.weight);
      if (formData.goal) localStorage.setItem("goal", formData.goal);
      
      // Save stats
      localStorage.setItem("stats", JSON.stringify(stats));
      
      // Also save complete user object
      const userData = {
        name: formData.name,
        email: formData.email,
        age: formData.age,
        weight: formData.weight,
        goal: formData.goal
      };
      localStorage.setItem("user", JSON.stringify(userData));
      
      setEditing(false);
      setSuccessMessage("Profile updated successfully! (Saved locally)");
      
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err.message || "Failed to save changes");
      console.error("Save error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    loadFromLocalStorage(); // Reload from localStorage
    setValidationErrors({});
    setEditing(false);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.email?.includes('@')) {
      errors.email = "Invalid email address";
    }
    
    if (formData.age && (formData.age < 1 || formData.age > 120)) {
      errors.age = "Age must be between 1-120";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Toggle notification
  const toggleNotification = (id) => {
    setNotifications(prev => prev.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  // Handle settings change
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    // Save settings to localStorage
    localStorage.setItem("settings", JSON.stringify({ ...settings, [setting]: value }));
  };

  // Handle support ticket submission
  const handleSupportSubmit = async () => {
    if (!supportTicket.message || !supportTicket.subject || !supportTicket.type) {
      setError("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Support ticket submitted! We'll respond within 24h.");
      setSupportTicket({ type: "", subject: "", message: "" });
      
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      setError(err.message || "Failed to submit ticket. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      localStorage.setItem("avatar", reader.result);
      setSuccessMessage("Profile picture updated!");
      setTimeout(() => setSuccessMessage(""), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Export user data
  const handleExportData = () => {
    const data = {
      profile: formData,
      stats: stats,
      notifications: notifications,
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all data (for testing)
  // const handleClearData = () => {
  //   if (window.confirm("Clear all saved data?")) {
  //     localStorage.clear();
  //     loadFromLocalStorage();
  //     setAvatar(null);
  //     setSuccessMessage("All data cleared!");
  //     setTimeout(() => setSuccessMessage(""), 3000);
  //   }
  // };

  // Show loading state
  if (isLoading && !formData.email) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px", flexDirection: "column" }}>
        <div style={{ color: theme.text, marginBottom: "20px" }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 800, margin: "0 auto", padding: 20 }}>
      
      {/* Header with Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: theme.text, fontSize: 24, fontWeight: 900 }}>My Profile</div>
        <div style={{ display: "flex", gap: "10px" }}>
          {/* <button 
            onClick={handleClearData}
            style={{
              background: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600
            }}
          >
            🗑️ Clear
          </button> */}
          <button 
            onClick={handleExportData}
            style={{
              background: theme.surface,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600
            }}
          >
            📥 Export
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          background: "#ff4444",
          color: "white",
          padding: "12px 16px",
          borderRadius: 8,
          fontSize: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>❌ {error}</span>
          <button 
            onClick={() => setError(null)}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}
      
      {successMessage && (
        <div style={{
          background: theme.green,
          color: "black",
          padding: "12px 16px",
          borderRadius: 8,
          fontSize: 14
        }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Profile Hero Card */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.accent}22, ${theme.accentAlt}11)`,
        border: `1px solid ${theme.accent}33`, borderRadius: 20, padding: "28px 32px",
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
        position: "relative"
      }}>
        {/* Avatar with Upload */}
        <div style={{ position: "relative" }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%", flexShrink: 0,
            background: avatar ? `url(${avatar})` : `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, fontWeight: 900, color: "#fff",
            boxShadow: `0 0 32px ${theme.accent}55`
          }}>
            {!avatar && formData.name && formData.name[0]?.toUpperCase()}
          </div>
          {editing && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: "none" }}
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  background: theme.accent,
                  color: "#fff",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: `2px solid ${theme.card}`,
                  fontSize: 14
                }}
              >
                📷
              </label>
            </>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ color: theme.text, fontSize: 22, fontWeight: 900 }}>
            {formData.name || formData.email?.split('@')[0] || "User"}
          </div>
          <div style={{ color: theme.muted, fontSize: 14, marginBottom: 8 }}>
            {formData.email || "No email"}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge text={formData.goal || "Fitness Goal"} color={theme.accent} />
            <Badge text="Member" color={theme.green} />
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 8 }}>
          {editing && (
            <button onClick={handleCancelEdit} style={{
              background: "transparent",
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 12, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13
            }}>
              Cancel
            </button>
          )}
          <button 
            onClick={editing ? handleSaveChanges : () => setEditing(true)} 
            disabled={isLoading}
            style={{
              background: editing ? theme.green : theme.surface,
              color: editing ? "#000" : theme.text,
              border: `1px solid ${editing ? theme.green : theme.border}`,
              borderRadius: 12, padding: "10px 20px", fontWeight: 700, cursor: isLoading ? "wait" : "pointer", 
              fontSize: 13, opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? "Saving..." : (editing ? "✓ Save Changes" : "✏️ Edit Profile")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, background: activeTab === t.id ? theme.accent : "transparent",
            color: activeTab === t.id ? "#fff" : theme.muted,
            border: "none", borderRadius: 10, padding: "10px",
            fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s"
          }}>{t.label}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Personal Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {[
                { label: "Full Name", field: "name", val: formData.name },
                { label: "Email", field: "email", val: formData.email },
                { label: "Age", field: "age", val: formData.age ? `${formData.age} years` : "" },
                { label: "Current Weight", field: "weight", val: formData.weight },
                { label: "Fitness Goal", field: "goal", val: formData.goal },
                { label: "Member Since", field: "joined", val: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), readOnly: true },
              ].map(f => (
                <div key={f.label} style={{ background: theme.surface, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ color: theme.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                    {f.label}
                    {validationErrors[f.field] && (
                      <span style={{ color: "#ff4444", marginLeft: 8, fontSize: 10 }}>⚠️</span>
                    )}
                  </div>
                  {editing && !f.readOnly ? (
                    <>
                      <input 
                        value={f.field === "age" ? formData.age : f.field === "weight" ? formData.weight : formData[f.field] || ""}
                        onChange={(e) => handleInputChange(f.field, e.target.value)}
                        type={f.field === "age" || f.field === "weight" ? "number" : "text"}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                        style={{
                          background: "transparent", border: "none",
                          borderBottom: `1px solid ${validationErrors[f.field] ? "#ff4444" : theme.accent}`,
                          color: theme.text, fontWeight: 700, fontSize: 14,
                          outline: "none", width: "100%", paddingBottom: 2
                        }} 
                      />
                      {validationErrors[f.field] && (
                        <div style={{ color: "#ff4444", fontSize: 10, marginTop: 4 }}>
                          {validationErrors[f.field]}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: theme.text, fontWeight: 700, fontSize: 14 }}>
                      {f.field === "age" && formData.age ? `${formData.age} years` : 
                       f.field === "weight" ? formData.weight : f.val || "Not set"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Fitness Summary</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { icon: "🏋️", label: "Total Workouts", val: stats.totalWorkouts },
                { icon: "🔥", label: "Calories Burned", val: stats.caloriesBurned },
                { icon: "⏱️", label: "Hours Trained", val: stats.hoursTrained },
                { icon: "📅", label: "Days Active", val: stats.daysActive },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, minWidth: 130, background: theme.surface, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ color: theme.text, fontWeight: 900, fontSize: 20 }}>{s.val}</div>
                  <div style={{ color: theme.muted, fontSize: 11, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 16 }}>🔔 Notification Preferences</div>
            {notifications.map((p) => (
              <div key={p.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 0", borderBottom: `1px solid ${theme.border}`
              }}>
                <div>
                  <div style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>{p.label}</div>
                  <div style={{ color: theme.muted, fontSize: 12 }}>{p.val}</div>
                </div>
                <div 
                  onClick={() => toggleNotification(p.id)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                    background: p.enabled ? theme.accent : theme.surface,
                    border: `1px solid ${p.enabled ? theme.accent : theme.border}`,
                    display: "flex", alignItems: "center", padding: "0 3px",
                    justifyContent: p.enabled ? "flex-end" : "flex-start",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 16 }}>⚙️ App Settings</div>
            {[
              { label: "Units of Measurement", field: "units", options: ["Metric (kg, cm)", "Imperial (lbs, in)"] },
              { label: "App Theme", field: "theme", options: ["Dark", "Light", "System"] },
              { label: "Language", field: "language", options: ["English", "اردو", "हिन्दी"] },
              { label: "Start of Week", field: "weekStart", options: ["Monday", "Sunday"] },
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: `1px solid ${theme.border}`
              }}>
                <span style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>{s.label}</span>
                <select 
                  value={settings[s.field]}
                  onChange={(e) => handleSettingChange(s.field, e.target.value)}
                  style={{
                    background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8,
                    color: theme.text, padding: "6px 10px", fontSize: 13, outline: "none", cursor: "pointer"
                  }}
                >
                  {s.options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Tab */}
      {activeTab === "support" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📩 Contact Support</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <select 
                value={supportTicket.type}
                onChange={(e) => setSupportTicket(prev => ({ ...prev, type: e.target.value }))}
                style={{
                  background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10,
                  color: theme.text, padding: "10px 14px", fontSize: 13, outline: "none"
                }}
              >
                <option value="">Select issue type</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="account">Account Issue</option>
                <option value="feedback">General Feedback</option>
              </select>
              
              <input 
                placeholder="Subject"
                value={supportTicket.subject}
                onChange={(e) => setSupportTicket(prev => ({ ...prev, subject: e.target.value }))}
                style={{
                  background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10,
                  padding: "10px 14px", color: theme.text, fontSize: 13, outline: "none"
                }} 
              />
              
              <textarea 
                placeholder="Describe your issue or feedback in detail..."
                value={supportTicket.message}
                onChange={(e) => setSupportTicket(prev => ({ ...prev, message: e.target.value }))}
                style={{
                  background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10,
                  padding: "12px 14px", color: theme.text, fontSize: 13, outline: "none",
                  resize: "vertical", minHeight: 100
                }} 
              />
              
              <button 
                onClick={handleSupportSubmit}
                disabled={isLoading}
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
                  color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px",
                  fontWeight: 800, cursor: isLoading ? "wait" : "pointer", alignSelf: "flex-start",
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>

          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 16 }}>❓ FAQs</div>
            {[
              "How do I reset my password?",
              "Can I export my workout data?",
              "How are calories calculated?",
              "How to set fitness goals?",
            ].map((q, i) => (
              <div 
                key={i} 
                onClick={() => {
                  setSupportTicket(prev => ({ ...prev, subject: q }));
                }}
                style={{
                  padding: "12px 0", borderBottom: `1px solid ${theme.border}`,
                  color: theme.accent, fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}
              >
                → {q}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}