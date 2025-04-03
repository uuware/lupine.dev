import { MediaQueryRange, PageProps } from 'lupine.js';
import { HomeSearchComponent } from '../components/home-search-component';

export const AdminItemListPage = async (props: PageProps) => {
  const css: any = {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    '.management-music-page-box': {
      padding: '0 32px 16px',
      [MediaQueryRange.MobileBelow]: {
        padding: '0 16px 16px',
      },
    },
  };
  return (
    <div css={css}>
      <div class='management-music-page-box'>
        <HomeSearchComponent management={true} />
      </div>
    </div>
  );
};
