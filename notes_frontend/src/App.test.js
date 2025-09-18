import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ocean Notes header', () => {
  render(<App />);
  const headerTitle = screen.getByText(/Ocean Notes/i);
  expect(headerTitle).toBeInTheDocument();
});
