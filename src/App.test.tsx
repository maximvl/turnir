import React from "react";
import { render, screen } from "@testing-library/react";
import TournirApp from "./TournirApp";

test("renders learn react link", () => {
  render(<TournirApp />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
