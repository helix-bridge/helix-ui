import { PrivyProvider as PrivyProviderFromPrivy } from "@privy-io/react-auth";
// import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { PropsWithChildren } from "react";

export default function PrivyProvider({ children }: PropsWithChildren<unknown>) {
  return (
    <PrivyProviderFromPrivy appId="cm4c8vv3y0846119zl29qwi9t">
      {/* <SmartWalletsProvider></SmartWalletsProvider> */}
      {children}
    </PrivyProviderFromPrivy>
  );
}
