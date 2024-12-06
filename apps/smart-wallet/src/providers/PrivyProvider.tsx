import { PrivyProvider as Provider } from "@privy-io/react-auth";
import { PropsWithChildren } from "react";

export default function PrivyProvider({ children }: PropsWithChildren<unknown>) {
  return <Provider appId="cm4c8vv3y0846119zl29qwi9t">{children}</Provider>;
}
