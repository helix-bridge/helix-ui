import { createHashRouter } from "react-router-dom";
import Transfer from "./routes/transfer";
import Relayer from "./routes/relayer";
import NotFound from "./routes/not-found";
import Error from "./routes/error";
import Explorer from "./routes/explorer";
import TxDetails from "./routes/tx-details";
import Home from "./routes/home";
import Solver from "./routes/solver";
import HomeLayout from "./layout/home-layout";
import AppLayout from "./layout/app-layout";

export const router = createHashRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "liquidity-solver", element: <Solver /> },
    ],
    errorElement: <Error />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "transfer", element: <Transfer /> },
      { path: "relayer", element: <Relayer /> },
      { path: "explorer", element: <Explorer /> },
      { path: "tx/:id", element: <TxDetails /> },
    ],
    errorElement: <Error />,
  },
  { path: "*", element: <NotFound /> },
]);
