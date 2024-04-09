import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import TournirApp from "./TournirApp";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PollApp, { pollLoader } from "./components/PollApp";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <TournirApp />,
  },
  {
    path: "/poll/:pollId",
    element: <PollApp />,
    loader: pollLoader,
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
