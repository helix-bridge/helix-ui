import { Button, useColorScheme, useTheme } from "@mui/material";

export function ToggleThemeButton() {
  const { setMode } = useColorScheme();
  const theme = useTheme();

  return (
    <Button variant="contained" onClick={() => setMode(theme.palette.mode === "dark" ? "light" : "dark")}>
      Toggle Theme
    </Button>
  );
}
