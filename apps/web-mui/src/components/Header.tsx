import { MenuRounded } from "@mui/icons-material";
import { Box, Link, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Logo } from "../icons/Logo";

export function Header() {
  return (
    <Box sx={{ padding: 2, borderBottom: "1px solid #e0e0e0" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Link to="/" component={RouterLink} sx={{ height: 20 }}>
          <Logo />
        </Link>
        <MenuRounded sx={{ color: "primary.main" }} />
      </Stack>
    </Box>
  );
}
