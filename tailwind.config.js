module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandGreen: "#2c6449",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "serif"],
        sans: ["Inter", "sans-serif"],
      },
      transitionProperty: {
        transform: "transform",
        spacing: "margin, padding",
        opacity: "opacity",
      },
      // ✅ Add this below
      animation: {
        dropdown: "scaleDropdown 0.3s ease-in-out forwards",
      },
      keyframes: {
        scaleDropdown: {
          "0%": { opacity: "0", transform: "scaleY(0)" },
          "100%": { opacity: "1", transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [],
};
