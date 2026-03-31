import { useState } from "react";
import { theme } from "./theme.js";
import DashboardPage from "./DashboardPage.jsx";
import WorkoutsPage from "./WorkoutsPage.jsx";
import NutritionPage from "./NutritionPage.jsx";
import ProgressPage from "./ProgressPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import Login from "./UserLogin.jsx";
import { NotificationContext } from './Context/NotificationContext.jsx';

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "workouts", label: "Workouts", icon: "💪" },
  { id: "nutrition", label: "Nutrition", icon: "🥗" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "profile", label: "Profile", icon: "👤" },
];

const pages = {
  dashboard: <DashboardPage />,
  workouts: <WorkoutsPage />,
  nutrition: <NutritionPage />,
  progress: <ProgressPage />,
  profile: <ProfilePage />,
};

// Sample initial notifications
const initialNotifications = [
  {
    id: 1,
    type: "workout",
    message: "You completed 'Full Body Strength' workout!",
    time: "5 min ago",
    read: false,
    icon: "💪",
    timestamp: Date.now() - 300000
  },
  {
    id: 2,
    type: "goal",
    message: "Congratulations! You reached your weekly step goal!",
    time: "2 hours ago",
    read: false,
    icon: "🎯",
    timestamp: Date.now() - 7200000
  }
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      setIsLoggedIn(false);
      setPage("dashboard");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Function to add new notification
  const addNotification = (type, message, icon) => {
    console.log("Adding notification:", { type, message, icon }); // Debug
    
    const newNotification = {
      id: Date.now(),
      type: type,
      message: message,
      time: "Just now",
      read: false,
      icon: icon,
      timestamp: Date.now()
    };
    
    setNotifications(prev => {
      console.log("Previous notifications:", prev);
      console.log("New notification:", newNotification);
      return [newNotification, ...prev];
    });
    
    setShowNotifications(true);
    
    setTimeout(() => {
      setShowNotifications(false);
    }, 5000);
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  // Delete notification
  const deleteNotification = (notificationId, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // If not logged in, show login page
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const currentNav = navItems.find(n => n.id === page);
  
  const userEmail = localStorage.getItem("email") || "User";
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <NotificationContext.Provider value={{ 
      addNotification, 
      notifications,
      showNotifications,
      setShowNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      unreadCount
    }}>
      <div style={{
        minHeight: "100vh", 
        background: theme.bg,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        display: "flex", 
        color: theme.text,
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? 240 : 68,
          minHeight: "100vh",
          background: theme.surface,
          borderRight: `1px solid ${theme.border}`,
          display: "flex", 
          flexDirection: "column",
          transition: "width 0.25s ease",
          overflow: "hidden", 
          flexShrink: 0,
          position: "sticky", 
          top: 0, 
          height: "100vh"
        }}>
          {/* Logo */}
          <div style={{ padding: "24px 16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, 
              height: 36, 
              borderRadius: 10, 
              flexShrink: 0,
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: 18, 
              boxShadow: `0 0 12px ${theme.accent}44`
            }}>⚡</div>
            {sidebarOpen && (
              <span style={{ color: theme.text, fontWeight: 900, fontSize: 18, letterSpacing: -0.5, whiteSpace: "nowrap" }}>
                FitPulse
              </span>
            )}
          </div>

          {/* Toggle Button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{
              margin: "0 12px 16px", 
              background: theme.card, 
              border: `1px solid ${theme.border}`,
              borderRadius: 8, 
              padding: "6px", 
              cursor: "pointer", 
              color: theme.muted, 
              fontSize: 14
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          {/* Nav Items */}
          <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {navItems.map(n => (
              <button 
                key={n.id} 
                onClick={() => setPage(n.id)} 
                style={{
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "11px 12px",
                  borderRadius: 12, 
                  border: "none", 
                  cursor: "pointer", 
                  textAlign: "left",
                  background: page === n.id ? `linear-gradient(135deg, ${theme.accent}22, ${theme.accentAlt}11)` : "transparent",
                  color: page === n.id ? theme.text : theme.muted,
                  borderLeft: page === n.id ? `3px solid ${theme.accent}` : "3px solid transparent",
                  transition: "all 0.15s",
                  fontWeight: page === n.id ? 700 : 500, 
                  fontSize: 14, 
                  width: "100%"
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{n.label}</span>}
              </button>
            ))}
          </nav>

          {/* User Footer with Logout */}
          <div style={{ padding: "16px 12px", borderTop: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, 
                height: 34, 
                borderRadius: "50%", 
                flexShrink: 0,
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontWeight: 900, 
                fontSize: 14, 
                color: "#fff"
              }}>{userInitial}</div>
              {sidebarOpen && (
                <div style={{ overflow: "hidden" }}>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {userEmail}
                  </div>
                  <div style={{ color: theme.muted, fontSize: 11 }}>Member</div>
                </div>
              )}
            </div>
            
            {sidebarOpen && (
              <button 
                onClick={handleLogout} 
                style={{
                  marginTop: 12, 
                  width: "100%", 
                  padding: 8,
                  background: "transparent", 
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8, 
                  color: "#ef4444", 
                  cursor: "pointer",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: 6,
                  fontSize: 12, 
                  fontWeight: 500
                }}
              >
                <span>🚪</span> Logout
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Topbar */}
          <div style={{
            padding: "16px 28px", 
            borderBottom: `1px solid ${theme.border}`,
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            background: theme.surface, 
            position: "sticky", 
            top: 0, 
            zIndex: 10
          }}>
            <div style={{ color: theme.text, fontWeight: 800, fontSize: 18 }}>
              {currentNav?.icon} {currentNav?.label}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{
                background: theme.card, 
                border: `1px solid ${theme.border}`, 
                borderRadius: 10,
                padding: "8px 14px", 
                display: "flex", 
                alignItems: "center", 
                gap: 8
              }}>
                <span style={{ color: theme.muted, fontSize: 14 }}>🔍</span>
                <input 
                  placeholder="Search..." 
                  style={{
                    background: "transparent", 
                    border: "none", 
                    color: theme.text,
                    fontSize: 13, 
                    outline: "none", 
                    width: 140
                  }} 
                />
              </div>
              
              {/* Notification Bell */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: showNotifications ? `${theme.accent}22` : theme.card,
                    border: `1px solid ${theme.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 18,
                    position: "relative",
                    transition: "all 0.2s"
                  }}
                >
                  🔔
                  {unreadCount > 0 && (
                    <div style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "#ef4444",
                      color: "white",
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      border: `2px solid ${theme.surface}`
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div
                      onClick={() => setShowNotifications(false)}
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 90
                      }}
                    />
                    
                    <div style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 360,
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 16,
                      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                      zIndex: 100,
                      overflow: "hidden"
                    }}>
                      {/* Header */}
                      <div style={{
                        padding: "16px 20px",
                        borderBottom: `1px solid ${theme.border}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>
                          Notifications
                          {unreadCount > 0 && (
                            <span style={{
                              marginLeft: 8,
                              background: theme.accent,
                              color: "#fff",
                              fontSize: 12,
                              padding: "2px 8px",
                              borderRadius: 12
                            }}>
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: theme.accent,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              padding: "4px 8px",
                              borderRadius: 6
                            }}
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div style={{ maxHeight: 400, overflowY: "auto" }}>
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              style={{
                                padding: "16px 20px",
                                borderBottom: `1px solid ${theme.border}`,
                                background: notification.read ? "transparent" : `${theme.accent}08`,
                                display: "flex",
                                gap: 12,
                                cursor: "pointer",
                                transition: "background 0.2s",
                                position: "relative"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = theme.card}
                              onMouseLeave={(e) => e.currentTarget.style.background = notification.read ? "transparent" : `${theme.accent}08`}
                            >
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: `${theme.accent}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                                flexShrink: 0
                              }}>
                                {notification.icon}
                              </div>

                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: 13,
                                  color: theme.text,
                                  marginBottom: 4,
                                  fontWeight: notification.read ? 400 : 500,
                                  lineHeight: 1.4
                                }}>
                                  {notification.message}
                                </div>
                                <div style={{
                                  fontSize: 11,
                                  color: theme.muted,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8
                                }}>
                                  <span>{notification.time}</span>
                                  {!notification.read && (
                                    <span style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      background: theme.accent
                                    }} />
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={(e) => deleteNotification(notification.id, e)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: theme.muted,
                                  fontSize: 14,
                                  cursor: "pointer",
                                  padding: "4px",
                                  opacity: 0,
                                  transition: "opacity 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        ) : (
                          <div style={{
                            padding: "40px 20px",
                            textAlign: "center",
                            color: theme.muted
                          }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>🔔</div>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>No notifications</div>
                            <div style={{ fontSize: 12 }}>You're all caught up!</div>
                          </div>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div style={{
                          padding: "12px 20px",
                          borderTop: `1px solid ${theme.border}`,
                          textAlign: "center"
                        }}>
                          <button
                            onClick={() => {
                              setNotifications([]);
                              setShowNotifications(false);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: theme.muted,
                              fontSize: 12,
                              cursor: "pointer"
                            }}
                          >
                            Clear all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {!sidebarOpen && (
                <button 
                  onClick={handleLogout} 
                  style={{
                    background: "transparent", 
                    border: `1px solid ${theme.border}`,
                    borderRadius: 8, 
                    padding: "6px 10px", 
                    color: "#ef4444", 
                    cursor: "pointer",
                    fontSize: 12
                  }}
                >
                  🚪
                </button>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div style={{ padding: "28px", flex: 1, overflowY: "auto" }}>
            {pages[page]}
          </div>
        </div>
      </div>
    </NotificationContext.Provider>
  );
}