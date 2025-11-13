module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // ajuste conforme sua estrutura
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6d9756",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
