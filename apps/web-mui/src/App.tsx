import { Button, Typography, useColorScheme, useMediaQuery, useTheme } from "@mui/material";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { mode, setMode } = useColorScheme();
  const theme = useTheme();

  return (
    <>
      <Typography variant="body1">Mode: {mode}</Typography>
      <Typography variant="body1">Prefers Dark Mode: {prefersDarkMode ? "Yes" : "No"}</Typography>
      <Typography variant="body1">Theme: {theme.palette.mode}</Typography>
      <Button variant="outlined" onClick={() => setMode("dark")}>
        Dark Mode
      </Button>
      <Button variant="outlined" onClick={() => setMode("light")}>
        Light Mode
      </Button>
      <Button variant="contained" onClick={() => setMode("system")}>
        System Mode
      </Button>
      <Button variant="contained" onClick={() => setMode(theme.palette.mode === "dark" ? "light" : "dark")}>
        Toggle Mode
      </Button>
    </>
  );
}

export default App;
