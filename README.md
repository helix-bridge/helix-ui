# Helix Bridge

## DEPLOYMENTS

### Production

helix: https://helixbridge.app
helix test: https://helix-apps-test.vercel.app

### Staging

helix: https://helix-stg.vercel.app
helix test: https://helix-stg-test.vercel.app/

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

### Step-2: Generate bridge(OPTIONAL)

Check whether the corresponding bridge already exists in the `package/apps/bridges/` directory

If exists, you can skip the steps below, otherwise follow these:

Go to `package/apps/` and run `yarn init:bridge`

Update files below under the apps project:

1. `bridges/[BRIDGE_TYPE]/[YOU_BRIDGE]/model/bridge.ts` Update the generated type if needed
1. `bridges/[BRIDGE_TYPE]/[YOU_BRIDGE]/config/bridge.ts` Update bridge configuration
1. `config/bridge.ts` Add bridge

### Step-3: Unit test

Run `yarn test:apps` under the project root, fix the failed test suits.

### Step-4: Complete bridge development

Under the `bridges/[BRIDGE_TYPE]` folder, you will find a new bridge folder which created by the script

##### [YOUR BRIDGE]/*.tsx

Adjust the type parameter of <b>CrossToken</b>. <b>ChainConfig</b> is just a base type. You can find all supported chain types at <b>packages/shared/model/network/config.ts</b>

In most cases you do not need to modify this component, if you need to, feel free to do it here.

##### [YOUR BRIDGE]/utils/bridge.ts

Adjust the Bridge's second and third type parameters. <b>ChainConfig</b> is just a base type. You can find all supported chain types at <b>packages/shared/model/network/config.ts</b>

Implement the methods needed for the generated bridge class, this should be your main job.
