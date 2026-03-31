import { theme } from "./theme.js";

// Safe render function for objects
const safeRender = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    console.warn('Object being rendered:', value);
    if (value.exerciseName) return value.exerciseName;
    if (value.name) return value.name;
    if (value.type) return value.type;
    return JSON.stringify(value);
  }
  return value;
};

// Fixed StatCard
export const StatCard = ({ icon, label, value, sub, color = theme.accent, glow }) => {
  const displayValue = typeof value === 'object' ? safeRender(value) : value;
  const displaySub = typeof sub === 'object' ? safeRender(sub) : sub;
  
  return (
    <div
      style={{
        background: theme.card, border: `1px solid ${theme.border}`,
        borderRadius: 16, padding: "20px 22px", flex: 1, minWidth: 140,
        position: "relative", overflow: "hidden",
        boxShadow: glow ? `0 0 24px ${color}22` : "none",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${color}33`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = glow ? `0 0 24px ${color}22` : "none"; }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${color}18, transparent 70%)`, transform: "translate(20px,-20px)" }} />
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: theme.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ color: theme.text, fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>{displayValue}</div>
      {displaySub && <div style={{ color: color, fontSize: 12, marginTop: 4, fontWeight: 600 }}>{displaySub}</div>}
    </div>
  );
};

// Fixed Badge
export const Badge = ({ text, color }) => {
  const displayText = safeRender(text);
  
  return (
    <span style={{
      background: `${color}22`, color: color, border: `1px solid ${color}44`,
      borderRadius: 8, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5
    }}>{displayText}</span>
  );
};

// FIXED BarChart - Main error yahan tha
export const BarChart = ({ data, height = 80 }) => {
  // Agar data nahi hai to empty show karo
  if (!data || data.length === 0) {
    return <div style={{ color: theme.muted, textAlign: "center" }}>No data available</div>;
  }

  // Data ko safe format mein convert karo
  const chartData = data.map(item => ({
    day: item.day || '',
    value: item.value || item.calories || 0,
    hasWorkout: item.workouts > 0 || item.color === theme.accent || false
  }));

  // Max value for scaling
  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, padding: "0 4px" }}>
      {chartData.map((d, i) => {
        const barHeight = Math.max((d.value / maxValue) * (height - 20), 4);
        
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: "100%", 
              height: barHeight,
              background: d.hasWorkout 
                ? `linear-gradient(180deg, ${theme.accent}, ${theme.accentAlt})` 
                : theme.border,
              borderRadius: "6px 6px 0 0", 
              transition: "height 0.5s ease",
              minHeight: 4,
              boxShadow: d.hasWorkout ? `0 0 8px ${theme.accent}44` : "none",
            }} />
            <span style={{ color: theme.muted, fontSize: 10, fontWeight: 600 }}>{d.day}</span>
            <span style={{ color: theme.text, fontSize: 9 }}>{d.value}</span>
          </div>
        );
      })}
    </div>
  );
};

// LineChart (no changes needed)
export const LineChart = ({ values, labels, color = theme.green, height = 100 }) => {
  if (!values || values.length === 0) return null;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 400, h = height;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * (w - 40) + 20,
    y: h - 20 - ((v - min) / range) * (h - 40)
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1].x} ${h - 20} L ${pts[0].x} ${h - 20} Z`;
  const gradId = `grad-${color.replace("#", "")}`;
  
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={theme.card} stroke={color} strokeWidth="2">
          <title>{`${labels?.[i] || i}: ${values[i]}`}</title>
        </circle>
      ))}
    </svg>
  );
};

// MacroRing (no changes needed)
export const MacroRing = ({ value, total, label, color }) => {
  const safeValue = Number(value) || 0;
  const safeTotal = Number(total) || 1;
  const pct = Math.min(safeValue / safeTotal, 1);
  const r = 28, circ = 2 * Math.PI * r;
  
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke={theme.border} strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        <text x="36" y="40" textAnchor="middle" fill={theme.text} fontSize="13" fontWeight="800">{safeValue}g</text>
      </svg>
      <div style={{ color: theme.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
};

// Fixed CalorieRing
export const CalorieRing = ({ consumed, target }) => {
  const safeConsumed = Number(consumed) || 0;
  const safeTarget = Number(target) || 2200;
  const pct = Math.min(safeConsumed / safeTarget, 1);
  const remaining = safeTarget - safeConsumed;
  const r = 60, circ = 2 * Math.PI * r;
  
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke={theme.border} strokeWidth="10" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="url(#cgrad)" strokeWidth="10"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 80 80)" />
        <defs>
          <linearGradient id="cgrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={theme.accent} />
            <stop offset="100%" stopColor={theme.accentAlt} />
          </linearGradient>
        </defs>
        <text x="80" y="72" textAnchor="middle" fill={theme.text} fontSize="28" fontWeight="900">{safeConsumed}</text>
        <text x="80" y="92" textAnchor="middle" fill={theme.muted} fontSize="12">of {safeTarget} kcal</text>
        <text x="80" y="108" textAnchor="middle" fill={remaining > 0 ? theme.green : theme.accent} fontSize="11" fontWeight="700">
          {remaining > 0 ? `${remaining} remaining` : "Goal reached!"}
        </text>
      </svg>
    </div>
  );
};