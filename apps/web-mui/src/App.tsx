import { Button, Typography, useColorScheme } from "@mui/material";

function App() {
  const { mode, setMode } = useColorScheme();

  return (
    <>
      <Typography variant="body1">Mode: {mode}</Typography>
      <Button variant="outlined" onClick={() => setMode("dark")}>
        Dark Mode
      </Button>
      <Button variant="outlined" onClick={() => setMode("light")}>
        Light Mode
      </Button>
      <Button variant="contained" onClick={() => setMode("system")}>
        System Mode
      </Button>
    </>
  );
}

export default App;
