import { Box, Button } from "@mui/material";
import { useFundWallet, usePrivy } from "@privy-io/react-auth";
import { base } from "viem/chains";

export default function Privy() {
  const { ready, user, authenticated, login } = usePrivy();
  const { fundWallet } = useFundWallet();

  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button disabled={!ready || authenticated} onClick={login} variant="contained">
        Log in or sign up
      </Button>
      <Button
        onClick={() =>
          fundWallet(user?.wallet?.address ?? "0xf422673cb7a673f595852f7b00906408a0b073db", {
            defaultFundingMethod: "manual",
            chain: base,
            amount: "123",
            asset: { erc20: "0x0Db510e79909666d6dEc7f5e49370838c16D950f" },
          })
        }
        disabled={!ready || !authenticated}
        variant="contained"
      >
        Fund
      </Button>
    </Box>
  );
}
