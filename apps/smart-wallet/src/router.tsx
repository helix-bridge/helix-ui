import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Privy from "./pages/Privy";

export const router = createBrowserRouter([
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/",
    element: <Privy />,
  },
  {
    path: "/privy",
    element: <Privy />,
  },
]);
