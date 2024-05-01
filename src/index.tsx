import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import TournirPage from "./router/TournirPage";
import reportWebVitals from "./reportWebVitals";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { createTheme, GlobalStyles, ThemeProvider } from "@mui/material";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const router = createHashRouter([
  {
    path: "/",
    element: <TournirPage />,
  },
]);

const darkTheme = createTheme({
  palette: {
    // mode: "dark",
    background: {
      default: "#222222",
    },
    text: {
      primary: "#ffffff",
    },
  },
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <GlobalStyles styles={{ body: { backgroundColor: "#EEEDE7" } }} />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
