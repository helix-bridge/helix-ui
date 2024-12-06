import { Box } from "@mui/material";
import { Header } from "../components/Header";
import { ToggleThemeButton } from "../components/ToggleThemeButton";
export default function Home() {
  return (
    <Box>
      <Header />
      <ToggleThemeButton />
    </Box>
  );
}
