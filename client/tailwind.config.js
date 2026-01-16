/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"], // 👈 fija solo light para evitar cambios raros
    darkTheme: "light", // 👈 por si algo intenta activar dark
  },
};
