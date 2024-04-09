import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import TournirPage from "./router/TournirPage";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PollVotingPage, { pollVotingLoader } from "./router/PollVotingPage";
import PollResultsPage from "./router/PollResultsPage";
import { pollResultsLoader } from "./router/PollResultsPage";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <TournirPage />,
  },
  {
    path: "/poll/:pollId",
    element: <PollVotingPage />,
    loader: pollVotingLoader,
  },
  {
    path: "/poll/:pollId/results",
    element: <PollResultsPage />,
    loader: pollResultsLoader,
  },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
