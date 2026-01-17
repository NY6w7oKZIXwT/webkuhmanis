module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0f172a',
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgb(59 130 246 / 0.5)' },
          '50%': { boxShadow: '0 0 20px rgb(59 130 246 / 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
