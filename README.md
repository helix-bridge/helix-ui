# Helix Bridge UI

❤️ Perform cross-chain transfers through Helix Bridge.

### Production

- mainnet: https://helixbridge.app/
- testnet: https://testnet.helixbridge.app/

### Staging

- mainnet: https://helix-stg.vercel.app/
- testnet: https://helix-stg-test.vercel.app/

### Development

- mainnet: https://helix-dev-main.vercel.app/
- testnet: https://helix-dev-test.vercel.app/

### Local development

```shell
$ npm install
$ npm run dev:apps
```

### How to add a new chain

1. Define `ChainID` and `Network` in `packages/apps/src/types/chain.ts`
2. Configure the chain file in the `packages/apps/src/config/chains` directory
3. Export the configuration file in the `packages/apps/src/config/chains/index.ts`
4. Add new chain to `packages/apps/src/utils/chain.ts`
