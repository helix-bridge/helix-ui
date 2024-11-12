import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://apollo.helix.box/graphql",
  documents: ["src/hooks/**/*.ts", "src/components/**/*.tsx"],
  generates: {
    "src/_generated_/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
