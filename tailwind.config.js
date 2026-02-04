// import type { Config } from "tailwindcss";

// const config: Config = {
//   theme: {
//     extend: {
//       screens: {
//         xs: "420px",
//         sm: "640px",
//         md: "768px",
//         lg: "1024px",
//         xl: "1280px",
//         "2xl": "1536px",
//       },
//     },
//   },
//   plugins: [],
// };

// export default config;

// module.exports = {
//     theme: {
//         extend: {
//             screens: {
//                 xs: "420px",
//             },
//         },
//     },
// };

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "420px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
};
