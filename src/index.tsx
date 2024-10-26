import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import TournirPage from './router/TournirPage'
import reportWebVitals from './reportWebVitals'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import MusicContextProvider from './contexts/MusicContext'
import VotingPage from 'router/VotingPage'
import LotoPage from 'router/LotoPage'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

// const baseURL = process.env.PUBLIC_URL || "/turnir";

const router = createBrowserRouter([
  {
    path: '/',
    element: <TournirPage />,
  },
  {
    path: '/turnir',
    element: <TournirPage />,
  },
  {
    path: '/turnir/:id',
    element: <TournirPage />,
  },
  {
    path: '/voting',
    element: <VotingPage />,
  },
  {
    path: '/loto',
    element: <LotoPage />,
  },
])

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // primary: {
    //   main: "#a6d4fa",
    // },
    // background: {
    //   default: "#242424",
    // },
  },
})

root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <MusicContextProvider>
        <RouterProvider router={router} />
      </MusicContextProvider>
    </ThemeProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
