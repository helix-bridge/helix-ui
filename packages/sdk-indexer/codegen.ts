import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://apollo.helix.box/graphql",
  documents: ["src/actions/**/*.ts"],
  ignoreNoDocuments: true,
  generates: {
    "./src/generated/action/": {
      preset: "client",
      config: {
        documentMode: "string",
      },
    },
    "./src/generated/hook/": {
      preset: "client",
      plugins: [],
    },
    "./schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
