/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22",
        },
      },
      boxShadow: {
        "brand-glow": "0 0 40px -5px rgba(16, 185, 129, 0.20)",
        "brand-glow-lg": "0 24px 80px -20px rgba(16, 185, 129, 0.25)",
        glass: "0 20px 80px -20px rgba(0, 0, 0, 0.8)",
        "card-green": "0 24px 80px -20px rgba(16, 185, 129, 0.16)",
      },
      borderRadius: {
        card: "1.5rem",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        "brand-radial": "radial-gradient(circle, #10B981 0%, #059669 100%)",
        "dot-pattern":
          "radial-gradient(circle, rgba(16, 185, 129, 0.14) 1px, transparent 1px)",
      },
      ringColor: {
        DEFAULT: "#10B981",
      },
      ringOpacity: {
        DEFAULT: "0.4",
      },
      animation: {
        "float-slow": "float-slow 12s ease-in-out infinite",
        "float-medium": "float-medium 10s ease-in-out infinite",
        "float-reverse": "float-reverse 11s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
        drift: "drift 20s linear infinite",
      },
    },
  },
  plugins: [],
};
