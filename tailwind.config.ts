import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: "#FDF2F4",
          100: "#FBE4E8",
          200: "#F5B8C2",
          500: "#9B1B30",
          700: "#6B1120",
          800: "#540C18",
          900: "#400812",
          950: "#26040A",
        },
        gold: {
          50: "#FCF9EE",
          100: "#F8F1D2",
          200: "#F0DF9B",
          300: "#E5CA63",
          400: "#DCBA43",
          500: "#D4AF37",
          600: "#B89426",
          700: "#8C6F19",
          800: "#695212",
        },
        saffron: {
          50: "#FEF6EE",
          100: "#FDE8D3",
          500: "#E36414",
          600: "#C7510C",
          700: "#9D3F0A",
        },
        ivory: {
          50: "#FFFEFA",
          100: "#FAF6EE",
          200: "#F5EFE3",
          300: "#EBE0CE",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "flame-flicker": "flameFlicker 1.8s ease-in-out infinite alternate",
        "float-particle": "floatParticle 6s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        flameFlicker: {
          "0%": { transform: "scale(1) rotate(-1deg)", opacity: "0.9" },
          "25%": { transform: "scale(1.04, 0.98) rotate(1deg)", opacity: "1" },
          "50%": { transform: "scale(0.97, 1.05) rotate(-0.5deg)", opacity: "0.85" },
          "75%": { transform: "scale(1.02, 1.01) rotate(0.8deg)", opacity: "0.95" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        floatParticle: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "20%": { opacity: "0.8" },
          "80%": { opacity: "0.6" },
          "100%": { transform: "translateY(-100px) translateX(20px)", opacity: "0" },
        },
      },
      boxShadow: {
        festive: "0 10px 30px -10px rgba(212, 175, 55, 0.3)",
        maroon: "0 10px 25px -5px rgba(64, 8, 18, 0.4)",
        diya: "0 0 25px 4px rgba(243, 198, 79, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
