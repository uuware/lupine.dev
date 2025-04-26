import { CssProps, MediaQueryMaxWidth, MediaQueryRange, PageProps } from 'lupine.js';

const fetchHomeData = async (props: PageProps) => {
  const data = await props.renderPageFunctions.fetchData('/api/settings');
  return data.json;
};

export const UserFavoritePage = async (props: PageProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: MediaQueryMaxWidth.DesktopMax,
    margin: 'auto',
    '.img': {
      width: '100%',
    },
    '.page-title': {
      fontSize: '30px',
      textAlign: 'center',
      padding: '20px 0',
    },
    '.block2': {
      width: '100%',
      margin: '10px 0',
      padding: '100px 0',
      border: '1px solid #aaa',
      borderRadius: '8px',
      color: '#1749ff',
    },
    '.a-text': {
      padding: '20px',
      fontSize: '21px',
      textAlign: 'center',
    },
    [MediaQueryRange.ExtraSmallBelow]: {
      '.header-title, .header-subtitle': {
        fontSize: '11px',
      },
    },
    [MediaQueryRange.DesktopAbove]: {
      '.header-title': {
        fontSize: '32px',
      },
    },
  };
  return (
    <div css={css}>
      <div class='padding-block'>
        <div class='block2'>
          <div class='page-title'>Favorites</div>
          <div class='a-text'>My favorite list.</div>
        </div>
      </div>
    </div>
  );
};
