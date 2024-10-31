const abi = [
  {
    inputs: [
      { internalType: "address", name: "_dao", type: "address" },
      { internalType: "address", name: "_endpoint", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint16", name: "lzRemoteChainId", type: "uint16" },
      { indexed: false, internalType: "bytes", name: "srcAddress", type: "bytes" },
      { indexed: false, internalType: "bool", name: "successed", type: "bool" },
    ],
    name: "CallResult",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint16", name: "lzRemoteChainId", type: "uint16" },
      { indexed: false, internalType: "bytes", name: "srcAddress", type: "bytes" },
      { indexed: false, internalType: "address", name: "remoteAppAddress", type: "address" },
    ],
    name: "CallerUnMatched",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "appAddress", type: "address" },
      { internalType: "bool", name: "enable", type: "bool" },
    ],
    name: "authoriseAppCaller",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "callerWhiteList",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dao",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "endpoint",
    outputs: [{ internalType: "contract ILayerZeroEndpoint", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_remoteChainId", type: "uint256" },
      { internalType: "bytes", name: "_message", type: "bytes" },
    ],
    name: "fee",
    outputs: [
      { internalType: "uint256", name: "nativeFee", type: "uint256" },
      { internalType: "uint256", name: "zroFee", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint16", name: "_srcChainId", type: "uint16" },
      { internalType: "bytes", name: "_srcAddress", type: "bytes" },
      { internalType: "uint64", name: "", type: "uint64" },
      { internalType: "bytes", name: "_payload", type: "bytes" },
    ],
    name: "lzReceive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "operator",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_remoteChainId", type: "uint256" },
      { internalType: "address", name: "_remoteBridge", type: "address" },
    ],
    name: "registerRemoteReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_remoteChainId", type: "uint256" },
      { internalType: "address", name: "_remoteBridge", type: "address" },
    ],
    name: "registerRemoteSender",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "remoteAppReceivers",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "remoteAppSenders",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "remoteMessagers",
    outputs: [
      { internalType: "uint16", name: "lzRemoteChainId", type: "uint16" },
      { internalType: "address", name: "messager", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_remoteChainId", type: "uint256" },
      { internalType: "bytes", name: "_message", type: "bytes" },
      { internalType: "bytes", name: "_params", type: "bytes" },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_operator", type: "address" }],
    name: "setOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_appRemoteChainId", type: "uint256" },
      { internalType: "uint16", name: "_lzRemoteChainId", type: "uint16" },
      { internalType: "address", name: "_remoteMessager", type: "address" },
    ],
    name: "setRemoteMessager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_dao", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint16", name: "", type: "uint16" }],
    name: "trustedRemotes",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default abi;
