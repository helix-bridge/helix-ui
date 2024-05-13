import { createHashRouter } from "react-router-dom";
import Root from "./routes/root";
import Home from "./routes/home";
import Relayer from "./routes/relayer";
import Records from "./routes/records";
import Record from "./routes/record";
import NotFound from "./routes/not-found";
import Error from "./routes/error";

export const router = createHashRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/relayer", element: <Relayer /> },
      { path: "/records", element: <Records /> },
      { path: "/records/:id", element: <Record /> },
      { path: "*", element: <NotFound /> },
    ],
    errorElement: <Error />,
  },
]);
