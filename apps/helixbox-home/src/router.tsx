import { createHashRouter } from "react-router-dom";
import NotFound from "./routes/not-found";
import Error from "./routes/error";
import Home from "./routes/home";
import Solver from "./routes/solver";
import Layout from "./layout";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "liquidity-solver", element: <Solver /> },
    ],
    errorElement: <Error />,
  },
  { path: "*", element: <NotFound /> },
]);
