// import { CrossChain } from "@/types/cross-chain";

// export const crossChains: CrossChain[] = [
//   {
//     sourceChain: "arbitrum-goerli",
//     targetChain: "linea-goerli",
//     bridge: {
//       category: "lnbridgev20-default",
//       contract: {
//         sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//         targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "arbitrum-goerli",
//     targetChain: "mantle-goerli",
//     bridge: {
//       category: "lnbridgev20-default",
//       contract: {
//         sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//         targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "goerli",
//     targetChain: "arbitrum-goerli",
//     bridge: {
//       category: "lnbridgev20-default",
//       contract: {
//         sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//         targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "goerli",
//     targetChain: "linea-goerli",
//     bridge: {
//       category: "lnbridgev20-default",
//       contract: {
//         sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//         targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "goerli",
//     targetChain: "mantle-goerli",
//     bridge: {
//       category: "lnbridgev20-default",
//       contract: {
//         sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//         targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "linea-goerli",
//     targetChain: "goerli",
//     bridge: {
//       category: "lnbridgev20-opposite",
//       contract: {
//         sourceAddress: "0x79e6f452f1e491a7aF0382FA0a6EF9368691960D",
//         targetAddress: "0x79e6f452f1e491a7aF0382FA0a6EF9368691960D",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "linea-goerli",
//     targetChain: "arbitrum-goerli",
//     bridge: {
//       category: "lnbridgev20-default",
//       contract: {
//         sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//         targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "linea-goerli",
//     targetChain: "mantle-goerli",
//     bridge: {
//       category: "lnbridgev20-default",
//       contract: {
//         sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//         targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "mantle-goerli",
//     targetChain: "goerli",
//     bridge: {
//       category: "lnbridgev20-default",
//       contract: {
//         sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//         targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "mantle-goerli",
//     targetChain: "arbitrum-goerli",
//     bridge: {
//       category: "lnbridgev20-default",
//       contract: {
//         sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//         targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "mantle-goerli",
//     targetChain: "linea-goerli",
//     bridge: {
//       category: "lnbridgev20-default",
//       contract: {
//         sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//         targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
//       },
//     },
//     tokens: [
//       { sourceToken: "USDC", targetToken: "USDC" },
//       { sourceToken: "USDT", targetToken: "USDT" },
//     ],
//   },
//   {
//     sourceChain: "arbitrum",
//     targetChain: "ethereum",
//     bridge: {
//       category: "lnbridgev20-opposite",
//       contract: {
//         sourceAddress: "0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978",
//         targetAddress: "0xeAb1F01a8f4A2687023B159c2063639Adad5304E",
//       },
//     },
//     tokens: [{ sourceToken: "RING", targetToken: "RING" }],
//   },
//   {
//     sourceChain: "crab-dvm",
//     targetChain: "darwinia-dvm",
//     tokens: [{ sourceToken: "CRAB", targetToken: "xWCRAB" }],
//   },
// ];

export const crossChain = {
  "arbitrum-goerli": {
    "linea-goerli": {
      "lnbridgev20-default": {
        contract: {
          sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
          targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
    "mantle-goerli": {
      "lnbridgev20-default": {
        contract: {
          sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
          targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
  },
  goerli: {
    "arbitrum-goerli": {
      "lnbridgev20-default": {
        contract: {
          sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
          targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
    "linea-goerli": {
      "lnbridgev20-default": {
        contract: {
          sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
          targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
    "mantle-goerli": {
      "lnbridgev20-default": {
        contract: {
          sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
          targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
  },
  "linea-goerli": {
    goerli: {
      "lnbridgev20-opposite": {
        contract: {
          sourceAddress: "0x79e6f452f1e491a7aF0382FA0a6EF9368691960D",
          targetAddress: "0x79e6f452f1e491a7aF0382FA0a6EF9368691960D",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
    "arbitrum-goerli": {
      "lnbridgev20-default": {
        contract: {
          sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
          targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
    "mantle-goerli": {
      "lnbridgev20-default": {
        contract: {
          sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
          targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
  },
  "mantle-goerli": {
    goerli: {
      "lnbridgev20-default": {
        contract: {
          sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
          targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
    "arbitrum-goerli": {
      "lnbridgev20-default": {
        contract: {
          sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
          targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
    "linea-goerli": {
      "lnbridgev20-default": {
        contract: {
          sourceAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
          targetAddress: "0x54cc9716905ba8ebdD01E6364125cA338Cd0054E",
        },
        tokens: [
          { sourceToken: "USDC", targetToken: "USDC" },
          { sourceToken: "USDT", targetToken: "USDT" },
        ],
      },
    },
  },
  "pangolin-dvm": {
    goerli: {
      "helix-sub2ethv2(lock)": {
        contract: {
          sourceAddress: "0xeAb1F01a8f4A2687023B159c2063639Adad5304E",
          targetAddress: "0x2a5fE3Cd11c6eEf7e3CeA26553e2694f0B0A9f9e",
        },
        tokens: [{ sourceToken: "PRING", targetToken: "PRING", deprecated: true }],
      },
    },
  },
};
