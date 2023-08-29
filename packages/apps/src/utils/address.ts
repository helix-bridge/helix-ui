export function toShortAdrress(address: string) {
  return address.length > 16 ? `${address.slice(0, 5)}...${address.slice(-4)}` : address;
}
