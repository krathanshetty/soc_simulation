module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neon: "#00ffff",
        cyber: "#0f172a",
        danger: "#ff4d4d",
        success: "#22c55e",
      },
      boxShadow: {
        glow: "0 30px 80px -40px rgba(6,182,212,0.6)",
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse-slow': 'pulseSlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
