import { createHashRouter, Outlet } from "react-router-dom";
import NotFound from "./routes/not-found";
import Error from "./routes/error";
import Rebranding from "./routes/rebranding";

export const router = createHashRouter([
  {
    path: "/",
    element: <Outlet />,
    children: [
      { index: true, element: <Rebranding /> },
      { path: "transfer", element: <Rebranding /> },
      { path: "relayer", element: <Rebranding /> },
      { path: "explorer", element: <Rebranding /> },
      { path: "tx/:id", element: <Rebranding /> },
    ],
    errorElement: <Error />,
  },
  { path: "*", element: <NotFound /> },
]);
