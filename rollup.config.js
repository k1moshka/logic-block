const esbuild = require("rollup-plugin-esbuild").default;
const dts = require("rollup-plugin-dts").default;

module.exports = [
  {
    input: "./src/index.ts",
    output: { file: "lib/index.js", format: "cjs" },
    plugins: [esbuild()],
  },
  {
    input: "./src/index.ts",
    output: { file: "lib/index.d.ts", format: "es" },
    plugins: [dts()],
  },
];
