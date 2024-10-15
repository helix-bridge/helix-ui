import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://apollo.helixbridge.app/graphql",
  documents: ["src/hooks/**/*.ts", "src/components/**/*.tsx", "src/providers/**/*.tsx"],
  generates: {
    "src/_generated_/gql/": {
      preset: "client",
      plugins: [],
    },
    // "./graphql.schema.json": {
    //   plugins: ["introspection"]
    // }
  },
};

export default config;
