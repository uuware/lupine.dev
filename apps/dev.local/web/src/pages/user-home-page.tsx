import { CssProps, MediaQueryMaxWidth, MediaQueryRange, PageProps } from 'lupine.components';
import { HomeSearchComponent } from '../components/home-search-component';

export const UserHomePage = async (props: PageProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    width: '100%',
    margin: '0 auto',
    maxWidth: MediaQueryMaxWidth.DesktopMax,
    '.search-component-container': {
      padding: '0 32px 16px',
      [MediaQueryRange.MobileBelow]: {
        padding: '0 16px 16px',
      },
    },
  };
  return (
    <div css={css}>
      <div class='search-component-container'>
        <HomeSearchComponent management={false} />
      </div>
    </div>
  );
};
