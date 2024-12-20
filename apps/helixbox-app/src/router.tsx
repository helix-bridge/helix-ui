import { createHashRouter } from "react-router-dom";
import Transfer from "./routes/transfer";
import Relayer from "./routes/relayer";
import NotFound from "./routes/not-found";
import Error from "./routes/error";
import Explorer from "./routes/explorer";
import TxDetails from "./routes/tx-details";
import Layout from "./layout";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Transfer /> },
      { path: "relayer", element: <Relayer /> },
      { path: "solver", element: <Relayer /> },
      { path: "explorer", element: <Explorer /> },
      { path: "tx/:id", element: <TxDetails /> },
    ],
    errorElement: <Error />,
  },
  { path: "*", element: <NotFound /> },
]);
