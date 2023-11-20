import { Address } from "viem";

export function toShortAdrress(address: Address) {
  return address.length > 16 ? `${address.slice(0, 5)}...${address.slice(-4)}` : address;
}
