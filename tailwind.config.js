/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Applied Behavioral Holistic Health Brand Colors
        abhh: {
          yellow: {
            50: "#FFFEF0",
            100: "#FEFCE1",
            200: "#FEF9C3",
            300: "#FEF08A",
            400: "#FACC15",
            500: "#F7E825", // Main yellow
            600: "#E6D000",
            700: "#D4C100",
            800: "#A19600",
            900: "#8B7F00",
          },
          teal: {
            50: "#E6F2F0",
            100: "#CCE5E1",
            200: "#99CCC3",
            300: "#66B3A4",
            400: "#339A86",
            500: "#1B5E56", // Main teal
            600: "#164E47",
            700: "#113E38",
            800: "#0C2E29",
            900: "#071F1A",
          },
        },
        // Standard design system colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1B5E56", // ABHH Teal
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F7E825", // ABHH Yellow
          foreground: "#1B5E56",
        },
        accent: {
          DEFAULT: "#2D7A6E",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: "#E2E8F0",
        input: "#F1F5F9",
        ring: "#1B5E56",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        abhh: "0 4px 6px -1px rgba(27, 94, 86, 0.1), 0 2px 4px -1px rgba(27, 94, 86, 0.06)",
        "abhh-lg":
          "0 10px 15px -3px rgba(27, 94, 86, 0.1), 0 4px 6px -2px rgba(27, 94, 86, 0.05)",
      },
    },
  },
  plugins: [],
};
