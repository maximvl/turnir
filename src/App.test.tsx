import React from 'react'
import { render, screen } from '@testing-library/react'
import TournirPage from 'pages/turnir/TournirPage'

test('renders learn react link', () => {
  render(<TournirPage />)
  const linkElement = screen.getByText(/learn react/i)
  expect(linkElement).toBeInTheDocument()
})
