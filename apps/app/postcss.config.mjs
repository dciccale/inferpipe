/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {
      base: `${process.cwd()}/../..`, // Point to monorepo root
    },
  },
};

export default config;
