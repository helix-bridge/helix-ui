import { Abi, Address, PublicClient, WalletClient } from "viem";
import { Token } from "./token";

const abi = [
  // erc20
  {
    inputs: [
      { internalType: "string", name: "name_", type: "string" },
      { internalType: "string", name: "symbol_", type: "string" },
      { internalType: "uint8", name: "decimals_", type: "uint8" },
      { internalType: "uint256", name: "initialBalance_", type: "uint256" },
      { internalType: "address payable", name: "feeReceiver_", type: "address" },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "spender", type: "address" },
      { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },

  // faucet
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "allowFaucet",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxFaucetAllowed",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const satisfies Abi;

interface Options {
  logo?: string;
  publicClient?: PublicClient;
  walletClient?: WalletClient;
}

export class OnChainToken extends Token {
  private readonly publicClient?: PublicClient;
  private readonly walletClient?: WalletClient;

  constructor(chainId: number, address: Address, decimals: number, symbol: string, name: string, options?: Options) {
    super(chainId, address, decimals, symbol, name, options?.logo);
  }

  /**
   * Faucet allow
   * @param address Address
   * @returns Amount of tokens allowed to be sent from the faucet
   */
  getAllowFaucet(address: Address) {
    return this.publicClient?.readContract({
      abi,
      address: this.address,
      functionName: "allowFaucet",
      args: [address],
    });
  }

  /**
   * Faucet max allowed
   * @returns Maximum amount of tokens allowed to be sent from the faucet
   */
  getMaxFaucetAllowed() {
    return this.publicClient?.readContract({
      abi,
      address: this.address,
      functionName: "maxFaucetAllowed",
    });
  }

  /**
   * Faucet
   * @param amount Amount of tokens to send from the faucet
   */
  async faucet(amount: bigint) {
    if (this.publicClient && this.walletClient) {
      const { request } = await this.publicClient.simulateContract({
        abi,
        address: this.address,
        functionName: "faucet",
        args: [amount],
        account: this.walletClient.account,
      });
      const hash = await this.walletClient.writeContract(request);
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: 2 });
    }
    throw new Error("Faucet token is not connected to a public or wallet client");
  }

  /**
   * Balance
   * @param address Address
   * @returns Amount of tokens in the address
   */
  getBalance(address: Address) {
    return this.isNative
      ? this.publicClient?.getBalance({ address })
      : this.publicClient?.readContract({
          abi,
          address: this.address,
          functionName: "balanceOf",
          args: [address],
        });
  }

  /**
   * Allowance
   * @param owner Owner address
   * @param spender Spender address
   * @returns Amount of tokens allowed to be spent
   */
  getAllowance(owner: Address, spender: Address) {
    return this.isNative
      ? Promise.resolve(this.parseEther(Number.MAX_SAFE_INTEGER.toString()))
      : this.publicClient?.readContract({
          abi,
          address: this.address,
          functionName: "allowance",
          args: [owner, spender],
        }) || Promise.resolve(0n);
  }

  /**
   * Approve
   * @param spender Spender address
   * @param amount Amount of tokens to approve
   */
  async approve(spender: Address, amount: bigint) {
    if (this.publicClient && this.walletClient) {
      const { request } = await this.publicClient.simulateContract({
        abi,
        account: this.walletClient?.account,
        address: this.address,
        functionName: "approve",
        args: [spender, amount],
      });
      const hash = await this.walletClient.writeContract(request);
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: 2 });
    }
    throw new Error("Token is not connected to a public or wallet client");
  }
}
