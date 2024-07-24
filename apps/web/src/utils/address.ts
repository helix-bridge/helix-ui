import { Address } from "viem";

export function toShortAdrress(address: Address, prefixLength = 5, suffixLength = 4) {
  return address.length > 16 ? `${address.slice(0, prefixLength)}...${address.slice(-1 * suffixLength)}` : address;
}
