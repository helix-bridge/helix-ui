import { render } from '@testing-library/react';
import { Footer } from '../../components/Footer';

jest.mock('next-i18next', () => ({
  useTranslation() {
    return {
      t: (label: string) => label,
    };
  },
}));

describe('<Footer />', () => {
  it('should display copyright', () => {
    const { getAllByRole, queryByText } = render(<Footer />);
    const links = getAllByRole('link');

    expect(queryByText(/Developed by Helix Team/i)).toBeInTheDocument();
    expect(links[0]).toHaveAttribute('href', 'https://github.com/helix-bridge');
    expect(links[1]).toHaveAttribute('href', 'https://twitter.com/helixbridges');
    expect(links[2]).toHaveAttribute('href', 'mailto:hello@helixbridge.app');
  });
});
