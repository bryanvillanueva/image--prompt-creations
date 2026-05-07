import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        brandBlue: "var(--blue-5)",
        brandLime: "var(--lime-3)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,.12)",
        6: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
