import React, { useState } from "react";
import axios from "axios";

const UserLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [hover, setHover] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/User/login", formData);

      // Save token & email
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.email);
      if (res.data.profile) localStorage.setItem("profile", res.data.profile);

      alert("Login successful!");
      onLogin(); // Call the onLogin function from App
    } catch (err) {
      console.error(err.response || err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // Styles
  const containerStyle = {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.3s"
  };

  const buttonStyle = {
    width: "100%",
    padding: "14px",
    margin: "20px 0 10px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #4361ee, #3a0ca3)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s"
  };

  const buttonHoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: "0 5px 15px rgba(67, 97, 238, 0.4)"
  };

  const titleStyle = {
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
    fontSize: "28px",
    fontWeight: 700
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>⚡ FitPulse</h2>
      <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>Login to Your Account</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <button
          type="submit"
          style={hover ? { ...buttonStyle, ...buttonHoverStyle } : buttonStyle}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default UserLogin;