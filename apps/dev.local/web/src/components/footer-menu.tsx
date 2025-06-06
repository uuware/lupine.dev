import { CssProps, MediaQueryRange } from 'lupine.web';

export const FooterMenu = (props: any) => {
  const css: CssProps = {
    '.footer-menu': {
      display: 'none',
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      background: 'var(--sidebar-bg-color)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 'var(--layer-menu)',
      height: '50px',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid #ccc',
    },
    '.footer-menu, .footer-menu a': {
      textDecoration: 'none',
      color: 'var(--sidebar-color)',
    },
    '.footer-menu .footer-menu-item': {
      padding: '0 16px',
    },
    [MediaQueryRange.TabletBelow]: {
      '.footer-menu': {
        display: 'flex',
      },
    },
  };
  return (
    <div css={css} class='footer-menu-box'>
      <div class='footer-menu'>
        <div class='footer-menu-item'><a href='/'>List</a></div>
        <div class='footer-menu-item'><a href='/user/favorite'>Favorite</a></div>
        <div class='footer-menu-item'><a href='/user/page1/parameter1/fixed-section/parameter2/option1'>Page1</a></div>
        <div class='footer-menu-item'><a href='/user/mine'>Mine</a></div>
      </div>
    </div>
  );
};
