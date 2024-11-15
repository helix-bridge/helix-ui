import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { getAvailableCrossChain, getHistoryByTxHash, getSortedSolveInfo } from "@helixbridge/sdk-indexer";
import { getChainByIdOrNetwork } from "@helixbridge/chains";
import { LnBridgeV3 } from "@helixbridge/sdk-bridge";
import { Address, createWalletClient, custom } from "viem";

function App() {
  const [count, setCount] = useState(0);

  const handleTransfer = async () => {
    const availableCrossChain = await getAvailableCrossChain(true);
    // availableCrossChain: [
    //   {
    //     tokenKey: "USDT",
    //     chains: [
    //       {
    //         fromChain: "zksync-sepolia",
    //         toChains: ["arbitrum-sepolia", "sepolia"],
    //       },
    //       {
    //         fromChain: "sepolia",
    //         toChains: ["zksync-sepolia", "arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "celo-testnet",
    //         toChains: ["arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "zircuit-sepolia",
    //         toChains: ["arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "bera",
    //         toChains: ["arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "arbitrum-sepolia",
    //         toChains: ["zksync-sepolia", "sepolia", "morph-testnet", "taiko-hekla", "zircuit-sepolia", "bera"],
    //       },
    //       {
    //         fromChain: "morph-testnet",
    //         toChains: ["arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "taiko-hekla",
    //         toChains: ["arbitrum-sepolia"],
    //       },
    //     ],
    //   },
    //   {
    //     tokenKey: "USDC",
    //     chains: [
    //       {
    //         fromChain: "bera",
    //         toChains: ["arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "arbitrum-sepolia",
    //         toChains: ["zksync-sepolia", "sepolia", "taiko-hekla", "zircuit-sepolia", "bera", "morph-testnet"],
    //       },
    //       {
    //         fromChain: "celo-testnet",
    //         toChains: ["arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "zircuit-sepolia",
    //         toChains: ["arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "zksync-sepolia",
    //         toChains: ["sepolia", "arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "sepolia",
    //         toChains: ["arbitrum-sepolia", "zksync-sepolia"],
    //       },
    //       {
    //         fromChain: "morph-testnet",
    //         toChains: ["arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "taiko-hekla",
    //         toChains: ["arbitrum-sepolia"],
    //       },
    //     ],
    //   },
    //   {
    //     tokenKey: "ETH",
    //     chains: [
    //       {
    //         fromChain: "sepolia",
    //         toChains: ["zksync-sepolia", "arbitrum-sepolia"],
    //       },
    //       {
    //         fromChain: "arbitrum-sepolia",
    //         toChains: ["sepolia", "zksync-sepolia"],
    //       },
    //       {
    //         fromChain: "zksync-sepolia",
    //         toChains: ["arbitrum-sepolia", "sepolia"],
    //       },
    //     ],
    //   },
    // ];
    console.log("availableCrossChain", availableCrossChain);

    const sourceChain = getChainByIdOrNetwork("arbitrum-sepolia");
    const targetChain = getChainByIdOrNetwork("morph-testnet");
    const sourceToken = "0x8A87497488073307E1a17e8A12475a94Afcb413f"; // USDC
    const targetToken = "0x5d016cC247CF6bF03524489C104C1F5016B01Bff"; // USDC
    const transferAmount = 14000000000000000000n;

    if (sourceChain && targetChain) {
      const sortedSolveInfo = await getSortedSolveInfo(sourceChain, targetChain, sourceToken, transferAmount);
      // sortedSolveInfo: {
      //   transferLimit: "100000000000000000000000",
      //   records: [
      //     {
      //       sendToken: "0x8a87497488073307e1a17e8a12475a94afcb413f",
      //       relayer: "0xb2a0654c6b2d0975846968d5a3e729f5006c2894",
      //       margin: "0",
      //       baseFee: "10000000000000000",
      //       protocolFee: "100000000000000000",
      //       liquidityFeeRate: 1,
      //       lastTransferId: "0x0000000000000000000000000000000000000000000000000000000000000000",
      //       withdrawNonce: "0",
      //       bridge: "lnv3",
      //     },
      //   ],
      // };
      console.log("sortedSolveInfo", sortedSolveInfo);
      if (BigInt(sortedSolveInfo?.transferLimit || 0) < transferAmount) {
        throw new Error("transferAmount is greater than transferLimit");
      }

      const signer = "0xf422673cb7a673f595852f7b00906408a0b073db";
      const walletClient = createWalletClient({
        account: signer,
        chain: sourceChain,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transport: custom((window as any).ethereum!),
      });

      const bridge = new LnBridgeV3(sourceChain, targetChain, sourceToken, targetToken, "lnv3", { walletClient });

      const info = sortedSolveInfo?.records?.[0];
      if (info) {
        const totalFee = await bridge.getTotalFee(info.relayer as Address, transferAmount);
        console.log("totalFee", totalFee);

        const balance = await bridge.getSourceTokenBalance(signer);
        const allowance = await bridge.getSourceTokenAllowance(signer);
        console.log("balance", balance);
        console.log("allowance", allowance);

        if (balance.value < transferAmount + totalFee.value) {
          throw new Error("balance is less than transferAmount");
        }
        if (allowance.value < transferAmount + totalFee.value) {
          const receipt = await bridge.approveSourceToken(transferAmount + totalFee.value);
          console.log("approveSourceToken receipt", receipt);
          if (receipt.status === "success") {
            const receipt = await bridge.transfer(transferAmount, signer, totalFee.value, info);
            console.log("receipt", receipt);

            if (receipt.status === "success") {
              await new Promise((resolve) => setTimeout(resolve, 10000));
              const history = await getHistoryByTxHash(!!sourceChain.testnet, receipt.transactionHash);
              console.log("history", history);
            }
          }
        }
      }
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>

      <button onClick={handleTransfer}>Transfer</button>
    </>
  );
}

export default App;
