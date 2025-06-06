import { bindGlobalStyles, getRenderPageProps } from '../core';
import { CssProps, RefProps } from '../jsx';
import { stopPropagation } from '../lib';
import { MediaQueryMaxWidth } from '../types';
import { NestMenuItemProps } from './menu-item-props';

const fetchMenu = async (menuId: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData(`/api/menu/get/${menuId}`);
  return data.json;
};

export type MenuSidebarProps = {
  mobileMenu?: boolean;
  desktopMenu?: boolean;
  menuId?: string;
  items: NestMenuItemProps[];
  className?: string;
  maxWidthMobileMenu?: string;
  maxWidth?: string;
  color?: string;
  backgroundColor?: string;
};
export const MenuSidebar = ({
  mobileMenu,
  desktopMenu,
  menuId,
  items,
  className,
  color = 'white',
  backgroundColor = 'dark',
  maxWidth = '100%',
  maxWidthMobileMenu = MediaQueryMaxWidth.TabletMax,
}: MenuSidebarProps) => {
  const css: CssProps = {
    backgroundColor,
    '.menu-sidebar-top': {
      width: '100%',
      backgroundColor: 'var(--sidebar-bg-color)',
      maxWidth: maxWidth,
      margin: 'auto',
      // height: 'auto',
      position: 'relative',

      display: 'flex',
      // width: '100%',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    '&.mobile .menu-sidebar-top': {
      position: 'absolute',
    },
    '.menu-sidebar-item': {
      display: 'inline-block',
      color,
      cursor: 'pointer',
      padding: '14px 16px',
      textDecoration: 'none',
      position: 'relative',
      borderBottom: 'var(--sidebar-border)',
    },
    // select parent when hover on a child, .menu-sidebar-sub-box:hover > .menu-sidebar-item
    '.menu-sidebar-item:hover': {
      color: 'var(--activatable-color-hover)',
      backgroundColor: 'var(--activatable-bg-color-hover)',
    },
    '.menu-sidebar-sub-box .menu-sidebar-sub': {
      display: 'none',
      // position: 'absolute',
      // color: 'var(--sidebar-sub-color)',
      // backgroundColor: 'var(--sidebar-sub-bg-color)',
      minWidth: '160px',
      // boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
      zIndex: 'var(--layer-sidebar-sub)',
      flexDirection: 'column',
    },
    '.menu-sidebar-sub-box > .menu-sidebar-item': {
      padding: '14px 26px 14px 16px',
      width: '100%',
    },
    '.menu-sidebar-sub-box > .menu-sidebar-sub > .menu-sidebar-item': {
      paddingLeft: '32px',
    },
    '.menu-sidebar-sub-box > .menu-sidebar-item::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%) rotate(-90deg)',
      marginLeft: '6px',
      width: 0,
      height: 0,
      borderLeft: '5px solid transparent',
      borderRight: '5px solid transparent',
      borderTop: '5px solid ' + color,
      right: '10px',
      transition: 'all 300ms ease-in-out',
    },
    '.menu-sidebar-sub-box.open > .menu-sidebar-item::after': {
      transform: 'rotate(0deg)',
    },
    '&.mobile .menu-sidebar-sub-box > .menu-sidebar-item::after': {
      transform: 'rotate(0deg)',
    },
    // '.menu-sidebar-sub-box .menu-sidebar-sub > .menu-sidebar-item': {
    //   color: 'black',
    // },
    '.menu-sidebar-sub-box.open > .menu-sidebar-sub': {
      display: 'flex',
    },
    '.menu-sidebar-sub-box .menu-sidebar-sub .menu-sidebar-item:hover': {
      color: 'var(--activatable-color-hover)',
      backgroundColor: 'var(--activatable-bg-color-hover)',
    },
    '.menu-sidebar-mobile': {
      display: 'none',
      position: 'relative',
      backgroundColor: 'var(--primary-bg-color)',
      padding: '5px 4px 6px',
      '.menu-sidebar-toggle': {
        cursor: 'pointer',
        padding: '6px 0 8px 0',
        'span, span::before, span::after': {
          cursor: 'pointer',
          height: '3px',
          width: '25px',
          borderRadius: '1px',
          background: 'var(--primary-color)',
          position: 'absolute',
          display: 'block',
          transition: 'all 300ms ease-in-out',
        },
        'span::before, span::after': {
          content: '""',
        },
        'span::before': {
          top: '-7px',
        },
        'span::after': {
          bottom: '-7px',
        },
      },
      '.menu-sidebar-toggle.active span': {
        backgroundColor: 'transparent',
      },
      '.menu-sidebar-toggle.active span::before': {
        transform: 'rotate(45deg)',
        top: 0,
      },
      '.menu-sidebar-toggle.active span::after': {
        transform: 'rotate(-45deg)',
        top: 0,
      },
    },
    // hide menu for mobile place
    '&.mobile': {
      display: 'none',
      // width: '33px',
    },
    '&.mobile .menu-sidebar-mobile': {
      display: 'block',
      width: '33px',
    },
    ['@media only screen and (max-width: ' + maxWidthMobileMenu + ')']: {
      // hide menu for not mobile place
      display: 'none',
      // show menu for mobile place
      '&.mobile': {
        display: 'block',
      },
      '.menu-sidebar-top': {
        display: 'none',
      },
      '.menu-sidebar-top.open': {
        display: 'flex',
        flexDirection: 'column',
        zIndex: 'var(--layer-sidebar)',
      },
      '.menu-sidebar-top.open .menu-sidebar-sub-box > .menu-sidebar-sub': {
        display: 'flex',
        position: 'unset',
        '.menu-sidebar-item': {
          paddingLeft: '32px',
          color,
          backgroundColor,
        },
        '.menu-sidebar-item:hover': {
          color: 'var(--activatable-color-hover)',
          backgroundColor: 'var(--activatable-bg-color-hover)',
        },
      },
      '.menu-sidebar-sub-box:hover > .menu-sidebar-item': {
        backgroundColor: 'unset',
      },
      '.menu-sidebar-sub-box:hover > .menu-sidebar-item:hover': {
        color: 'var(--activatable-color-hover)',
        backgroundColor: 'var(--activatable-bg-color-hover)',
      },
    },
  };

  // first level is grouped
  const renderItems = (items: NestMenuItemProps[], className: string) => {
    return (
      <div class={className}>
        {items.map((item) => {
          let ref: RefProps = {};
          return item.items ? (
            <div ref={ref} class='menu-sidebar-sub-box' onClick={() => onItemToggleClick(ref)}>
              <div class='menu-sidebar-item'>{item.text}</div>
              {renderItems(item.items, 'menu-sidebar-sub')}
            </div>
          ) : item.js ? (
            <a
              class='menu-sidebar-item'
              href='javascript:void(0)'
              alt={item.alt || item.text}
              onClick={(event) => {
                stopPropagation(event);
                // hide menu
                onToggleClick();
                item.js && item.js();
              }}
            >
              {item.text}
            </a>
          ) : (
            <a class='menu-sidebar-item' href={item.url} alt={item.alt || item.text}>
              {item.text}
            </a>
          );
        })}
      </div>
    );
  };

  const ref: RefProps = {
    onLoad: async () => {
      if (menuId) {
        const menu = await fetchMenu(menuId);
        if (menu.result.items.length > 0) {
          const items = menu.result.items.map((i: any) => {
            const l = i.split('\t');
            return { text: l[5], url: l[4] };
          });
          const newDom = renderItems(items, 'menu-sidebar-top');
          //mountComponents('.menu-sidebar-top', newDom);
        }
      }
    },
  };
  const onToggleClick = () => {
    const menu = ref.$('.menu-sidebar-mobile .menu-sidebar-toggle');
    menu.classList.toggle('active');
    const topMenu = ref.$('.menu-sidebar-top');
    topMenu.classList.toggle('open');
  };
  const onItemToggleClick = (ref: RefProps) => {
    // if (event.target != ref.current && (event.target as any).parentNode != ref.current) {
    //   return;
    // }
    ref.current.classList.toggle('open');
  };

  // if this component is used twice, then the Global styles is only set at the first time
  bindGlobalStyles('menu-sidebar-box', '.menu-sidebar-box', css);

  // show the menu on both mobile and desktop
  const newCss: CssProps =
    (!desktopMenu && !mobileMenu) || (desktopMenu && mobileMenu)
      ? {
          ['@media only screen and (max-width: ' + maxWidthMobileMenu + ')']: {
            display: 'block',
            '.menu-sidebar-top': {
              display: 'block',
            },
          },
        }
      : {};
  return (
    <div css={newCss} ref={ref} class={['menu-sidebar-box', className, mobileMenu ? 'mobile' : ''].join(' ')}>
      <div class='menu-sidebar-mobile'>
        <div class='menu-sidebar-toggle' onClick={onToggleClick}>
          <span></span>
        </div>
      </div>

      {renderItems(items, 'menu-sidebar-top')}
    </div>
  );
};
