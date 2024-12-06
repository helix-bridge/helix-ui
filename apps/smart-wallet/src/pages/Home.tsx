import { Box, Button } from "@mui/material";
import { Header } from "../components/Header";
import { ToggleThemeButton } from "../components/ToggleThemeButton";
import { countAtom } from "../atoms";
import { useAtom } from "jotai";

export default function Home() {
  const [count, setCount] = useAtom(countAtom);

  return (
    <Box>
      <Header />
      <ToggleThemeButton />
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
      <p>Count: {count}</p>
    </Box>
  );
}
