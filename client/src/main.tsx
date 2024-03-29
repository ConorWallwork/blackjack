import React from "react";
import ReactDOM from "react-dom/client";
import App from "./routes/App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./error-page";
import Seat from "./routes/seat.tsx";
import { createSeatAction, getSeatLoader } from "./services/seats.ts";
import Leaderboard from "./routes/leaderboard.tsx";
import { getLeaderboardLoader } from "./services/leaderboard.ts";

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
  {
    path: "leaderboard",
    element: <Leaderboard />,
    errorElement: <ErrorPage />,
    loader: getLeaderboardLoader,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
