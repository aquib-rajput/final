import type { Config } from "tailwindcss"

const config: Config = {
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
    },
    extend: {
      boxShadow: {
        "elevation-xs": "0 0.5px 1px rgb(0 0 0 / 0.05), 0 1px 2px rgb(0 0 0 / 0.03)",
        "elevation-sm": "0 1px 2px rgb(0 0 0 / 0.05), 0 1px 3px rgb(0 0 0 / 0.1), 0 1px 4px rgb(0 0 0 / 0.03)",
        "elevation-md": "0 4px 6px rgb(0 0 0 / 0.07), 0 10px 13px rgb(0 0 0 / 0.1), 0 15px 35px rgb(0 0 0 / 0.05)",
        "elevation-lg": "0 20px 25px rgb(0 0 0 / 0.1), 0 25px 50px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
}

export default config

