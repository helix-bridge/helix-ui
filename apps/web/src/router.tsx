import { createHashRouter } from "react-router-dom";
import Root from "./routes/root";
import Home from "./routes/home";
import Relayer from "./routes/relayer";
import NotFound from "./routes/not-found";
import Error from "./routes/error";
import Explorer from "./routes/explorer";
import TxDetails from "./routes/tx-details";

export const router = createHashRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/relayer", element: <Relayer /> },
      { path: "/explorer", element: <Explorer /> },
      { path: "/tx/:id", element: <TxDetails /> },
      { path: "*", element: <NotFound /> },
    ],
    errorElement: <Error />,
  },
]);
