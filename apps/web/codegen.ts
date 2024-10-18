import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://apollo.helixbridge.app/graphql",
  documents: "src/hooks/**/*.ts",
  generates: {
    "src/_generated_/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;