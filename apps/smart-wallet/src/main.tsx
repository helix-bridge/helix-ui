import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./i18n";

import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

import PrivyProvider from "./providers/PrivyProvider.tsx";

const theme = createTheme({
  colorSchemes: { dark: true },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PrivyProvider>
        <RouterProvider router={router} />
      </PrivyProvider>
    </ThemeProvider>
  </StrictMode>,
);