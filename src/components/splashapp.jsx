// SplashApp.jsx
import React, { useState, useEffect } from "react";

export default function SplashApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // splash duration 3s
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={styles.splashContainer}>
        <img src="Screenshot 2025-11-20 194447.png" alt="Logo" style={styles.logo} />
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <h1>Welcome to My WebApp</h1>
      {/* Rest of your app content */}
    </div>
  );
}

// CSS-in-JS styles
const styles = {
  splashContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#282c34",
    animation: "fadeInOut 3s forwards",
  },
  logo: {
    width: "200px",
    animation: "bounce 2s infinite",
  },
  appContainer: {
    padding: "20px",
    textAlign: "center",
  },
};

// Add keyframe animations
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}`, styleSheet.cssRules.length);

styleSheet.insertRule(`
@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}`, styleSheet.cssRules.length);
