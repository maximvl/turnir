import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import TournirPage from './pages/turnir/TournirPage'
import reportWebVitals from './reportWebVitals'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import MusicContextProvider from 'common/hooks/MusicContext'
import VotingPage from 'pages/voting/VotingPage'
import LotoPage from 'pages/loto/LotoPage'
import { QueryClient, QueryClientProvider } from 'react-query'

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
  },
})

const queryClient = new QueryClient()

root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <MusicContextProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </MusicContextProvider>
    </ThemeProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
