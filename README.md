# Helixbox Interfaces

❤️ Helixbox is focusing on becoming an efficient multi-chain liquidity provider, offering users a superior experience in multi-chain asset transfer and exchange.

```bash
$ git clone git@github.com:helix-bridge/helix-ui.git
$ cd helix-ui
$ pnpm install
```

## App Interface

Source: [apps/helixbox-app](apps/helixbox-app)

```bash
$ pnpm app run dev
$ pnpm app run build
```

### Production

- mainnet: https://app.helixbox.ai (ipfs version: https://helixbridge.eth.limo)
- ~~testnet: https://testnet-app.helixbox.ai~~

### Staging

- mainnet: https://helix-stg-mainnet.vercel.app
- testnet: https://helix-stg-testnet.vercel.app

### Development

- mainnet: https://helix-dev-mainnet.vercel.app
- testnet: https://helix-dev-testnet.vercel.app

## Helix

Source: [apps/helixbox-helix](apps/helixbox-helix)

The old version mainly serves as a prompt page, directing users to visit the new domain.

```bash
$ pnpm helix run dev
$ pnpm helix run build
```

## Home

Source: [apps/helixbox-home](apps/helixbox-home)

The homepage of the old version is now deprecated.

```shell
$ pnpm --filter helixbox-home run dev
$ pnpm --filter helixbox-home run build
```

## Assets package

Some online media resources can be accessed via URL, such as https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/arbitrum.png.

Source: [packages/assets](packages/assets)


