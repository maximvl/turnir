import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import TournirPage from '@/pages/turnir/TournirPage'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import MusicContextProvider from '@/common/hooks/MusicContext'
import VotingPage from '@/pages/voting/VotingPage'
import LotoPage from '@/pages/loto/LotoPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import GamePage from '@/pages/game/GamePage'
import ChatOptionsPage from '@/pages/chatOptions/ChatOptionsPage'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

// console.log('process.env.PUBLIC_URL', process.env.PUBLIC_URL)

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
  {
    path: '/game',
    element: <GamePage />,
  },
  {
    path: '/chatOptions',
    element: <ChatOptionsPage />,
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
