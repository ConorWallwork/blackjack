import React from "react";
import ReactDOM from "react-dom/client";
import App from "./routes/App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./error-page";
import Seat from "./routes/seat.tsx";
import { createSeatAction, getSeatLoader } from "./services/seats.ts";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>,
    errorElement: <ErrorPage />,
    action: createSeatAction,
  },
  {
    path: "seat/:seatId",
    element: <Seat />,
    errorElement: <ErrorPage />,
    loader: getSeatLoader,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
