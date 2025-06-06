import { CssProps, MediaQueryRange, PageProps } from 'lupine.web';

export const AdminItemEditPage = async (props: PageProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    '.management-new-page-box': {
      padding: '0 32px 16px',
      [MediaQueryRange.MobileBelow]: {
        padding: '0 16px 16px',
      },
    },
  };
  return (
    <div css={css}>
      <div class='management-new-page-box'>
        Edit page
      </div>
    </div>
  );
};
