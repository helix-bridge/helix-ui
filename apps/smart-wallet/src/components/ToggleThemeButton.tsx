import { Button, useColorScheme, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

export function ToggleThemeButton() {
  const { setMode } = useColorScheme();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Button variant="contained" onClick={() => setMode(theme.palette.mode === "dark" ? "light" : "dark")}>
      {t("Toggle Theme")}
    </Button>
  );
}
