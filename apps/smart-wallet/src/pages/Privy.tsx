import { Box, Button } from "@mui/material";
import { useFundWallet, usePrivy } from "@privy-io/react-auth";
// import { base } from "viem/chains";

export default function Privy() {
  const { ready, user, authenticated, login, logout } = usePrivy();
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
      {!authenticated && (
        <Button disabled={!ready} onClick={login} variant="contained">
          Log in or sign up
        </Button>
      )}

      {authenticated && (
        <Button disabled={!ready} onClick={logout} variant="contained">
          Logout
        </Button>
      )}

      {authenticated && (
        <Button
          onClick={() =>
            fundWallet(user?.wallet?.address ?? "0x0555fd1450fa95a95EE4F5C5f83fcff5b98BDfaA", {
              defaultFundingMethod: "manual",
              // chain: base,
              // amount: "",
              // asset: { erc20: "0x0Db510e79909666d6dEc7f5e49370838c16D950f" },
            })
          }
          disabled={!ready}
          variant="contained"
        >
          Deposit
        </Button>
      )}

      {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : null}
    </Box>
  );
}
