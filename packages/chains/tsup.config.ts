import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/chains/index.ts", "src/types/index.ts", "src/utils/index.ts"],
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  ...options,
}));
