import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: "src/generated/index.js",
    output: { dir: "dist/esm", format: "esm", preserveModules: true },
    plugins: [resolve(), commonjs()]
  },

  {
    input: "src/generated/index.js",
    output: { dir: "dist/cjs", format: "cjs", preserveModules: true },
    plugins: [resolve(), commonjs()]
  },

  {
    input: "src/generated/index.js",
    output: {
      file: "dist/umd/iconshub.min.js",
      format: "umd",
      name: "iconshub",
    },
    plugins: [resolve(), commonjs(), terser()]
  }
];
