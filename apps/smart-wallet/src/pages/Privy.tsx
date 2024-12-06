import { Box, Button } from "@mui/material";
import { usePrivy } from "@privy-io/react-auth";

export default function Privy() {
  const { ready, authenticated, login } = usePrivy();

  return (
    <Box
      component="main"
      sx={{ display: "flex", flexDirection: "row", minHeight: "100vh", justifyContent: "center", alignItems: "center" }}
    >
      <Button disabled={!ready || authenticated} onClick={login} variant="contained">
        Log in or sign up
      </Button>
    </Box>
  );
}
