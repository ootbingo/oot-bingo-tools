import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: ["src/index.ts", "src/tools/frequencyAnalysis/worker.js"],
  output: [
    {
      name: "index.cjs",
      format: "cjs",
      dir: "dist",
    },
  ],
  external: ["oot-bingo-lists", "oot-bingo-generator", "tslib"],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
    }),
    nodeResolve(),
    commonjs(),
  ],
};
