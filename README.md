# Helix Bridge

## DEPLOYMENTS

### Production

helix: https://helixbridge.app
helix test: https://helix-ui-test.vercel.app
helix apps: https://apps.helixbridge.app
helix apps test: https://helix-apps-test.vercel.app

### Staging

helix: https://helix-ui-stg.vercel.app
helix test: https://helix-ui-test-stg.vercel.app/
apps: https://helix-apps-stg.vercel.app/
apps test: https://helix-apps-test-stg.vercel.app/

## HOW TO ADD A BRIDGE

### Step-1: Check network

`shared/config/network/` Add network configuration if needed:

1. `shared/model/network.ts` Update network type
1. `shared/config/network/` Add network configuration
1. `shared/config/theme.ts` Update theme configuration
1. `shared/config/network/networks.ts` Add network

Make sure the token exists on the network configuration:

1. add the token config if not exist
1. update the cross field for the token if exist

### Step-2: Generate bridge

Go to `package/apps/` and run `yarn init:bridge`

1. `shared/model/bridge` Update types
1. `shared/config/bridges` Update bridge configuration
1. `shared/config/bridge.ts` Add bridge

### Step-3: Add balance query

`apps/utils/balance.ts` Update getBalance function

### Step-4: Unit test

Run `yarn test:shared` under the project root, fix the failed test suits.

### Step-5: Complete bridge development

Under the `packages/apps/bridges` folder, you will find a new bridge folder which created by the script

1. [YOUR BRIDGE]/utils/fee.ts Add the method to get fee here
1. [YOUR BRIDGE]/utils/tx.ts Add the transfer methods, param validation functions and so on.
1. [YOUR BRIDGE]/: Complete the react component

