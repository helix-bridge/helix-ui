import { render } from '@testing-library/react';
import { Footer } from '../../components/Footer';
import { THEME } from '../../config/theme';

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

  it('should render bg', () => {
    const { getByRole } = render(<Footer theme={THEME.LIGHT} />);

    const ele = getByRole('contentinfo');
    expect(ele).toHaveStyle('background: #ccc');
  });
});
