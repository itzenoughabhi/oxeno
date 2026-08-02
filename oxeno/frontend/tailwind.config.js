module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        accent: {
          100: "#EDE9FE",
          500: "#7C3AED",
        },
        ink: {
          950: "#0A1120",
          900: "#0B1220",
          700: "#334155",
          500: "#64748B",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-24px)" },
        },
        floatCard: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        scanLine: {
          "0%, 100%": { top: "6%" },
          "50%": { top: "94%" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.7)", opacity: "0.35" },
          "70%, 100%": { transform: "scale(1.9)", opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "float-slow": "floatSlow 9s ease-in-out infinite",
        "float-card": "floatCard 5s ease-in-out infinite",
        "scan-line": "scanLine 2.4s ease-in-out infinite",
        "pulse-ring": "pulseRing 2.6s ease-out infinite",
        "fade-up": "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
};