import { getRenderPageProps } from '../core';
import { RefProps } from '../jsx';
import { MediaQueryMaxWidth } from '../types';
import { LinkItem } from './link-item';
import { NestMenuItemProps } from './menu-item-props';

const fetchMenu = async (menuId: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData(`/api/menu/get/${menuId}`);
  return data.json;
};

export type MenuBarProps = {
  menuId?: string;
  items: NestMenuItemProps[];
  className?: string;
  textColor?: string;
  hoverColor?: string;
  hoverBgColor?: string;
  maxWidthMobileMenu?: string;
  maxWidth?: string;
  backgroundColor?: string;
};
export const MenuBar = ({
  menuId,
  items,
  className,
  textColor = 'var(--menubar-color)',
  backgroundColor = 'var(--menubar-bg-color)', //'black',
  hoverColor = 'var(--activatable-color-hover)', //'#ffffff',
  hoverBgColor = 'var(--activatable-bg-color-hover)', //'#d12121',
  maxWidth = '100%',
  maxWidthMobileMenu = MediaQueryMaxWidth.TabletMax,
}: MenuBarProps) => {
  const css: any = {
    width: '100%',
    maxWidth: maxWidth,
    margin: 'auto',
    // height: 'auto',
    backgroundColor,
    position: 'relative',
    '.menu-bar-top': {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
    },
    '.menu-bar-item': {
      display: 'inline-block',
      color: textColor,
      padding: '14px 16px',
      textDecoration: 'none',
      position: 'relative',
    },
    '.menu-bar-item:hover, .menu-bar-sub-box:hover > .menu-bar-item': {
      // for desktop, make parent menu hover when sub menu is hover
      color: hoverColor,
      backgroundColor: hoverBgColor,
    },
    '.menu-bar-sub-box .menu-bar-sub': {
      display: 'none',
      position: 'absolute',
      backgroundColor: 'var(--menubar-sub-bg-color)', //'#f9f9f9',
      minWidth: '160px',
      boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
      zIndex: 'var(--layer-menu-sub)',
      flexDirection: 'column',
    },
    '.menu-bar-sub-box > .menu-bar-item': {
      padding: '14px 26px 14px 16px',
      width: '100%',
    },
    '.menu-bar-sub-box > .menu-bar-item::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '6px',
      width: 0,
      height: 0,
      borderLeft: '5px solid transparent',
      borderRight: '5px solid transparent',
      borderTop: '5px solid ' + textColor,
    },
    '.menu-bar-sub-box .menu-bar-sub > .menu-bar-item': {
      color: 'black',
    },
    '.menu-bar-sub-box:hover > .menu-bar-sub': {
      display: 'flex',
    },
    '.menu-bar-sub-box .menu-bar-sub .menu-bar-item:hover': {
      // backgroundColor: '#ddd',
      color: hoverColor,
      backgroundColor: hoverBgColor,
    },
    '.menu-bar-mobile': {
      display: 'none',
      position: 'relative',
      backgroundColor,
      padding: '5px 18px 6px',
      '.menu-bar-toggle': {
        cursor: 'pointer',
        padding: '14px 0 19px 0',
        'span, span::before, span::after': {
          cursor: 'pointer',
          height: '3px',
          width: '25px',
          borderRadius: '1px',
          background: '#ffffff',
          position: 'absolute',
          display: 'block',
          transition: 'all 300ms ease-in-out',
        },
        'span::before, span::after': {
          content: '""',
        },
        'span::before': {
          top: '-10px',
        },
        'span::after': {
          bottom: '-10px',
        },
      },
      '.menu-bar-toggle.active span': {
        backgroundColor: 'transparent',
      },
      '.menu-bar-toggle.active span::before': {
        transform: 'rotate(45deg)',
        top: 0,
      },
      '.menu-bar-toggle.active span::after': {
        transform: 'rotate(-45deg)',
        top: 0,
      },
    },
    ['@media only screen and (max-width: ' + maxWidthMobileMenu + ')']: {
      '.menu-bar-mobile': {
        display: 'block',
      },
      '.menu-bar-top': {
        display: 'none',
      },
      '.menu-bar-top.open': {
        display: 'flex',
        flexDirection: 'column',
      },
      '.menu-bar-top.open .menu-bar-sub-box > .menu-bar-sub': {
        display: 'flex',
        position: 'unset',
        '.menu-bar-item': {
          paddingLeft: '32px',
          color: textColor,
          backgroundColor,
        },
        '.menu-bar-item:hover': {
          color: hoverColor,
          backgroundColor: hoverBgColor,
        },
      },
      '.menu-bar-sub-box:hover > .menu-bar-item': {
        // for mobile, no parent menu hover when sub menu is hover
        color: textColor,
        backgroundColor: backgroundColor,
      },
      '.menu-bar-sub-box:hover > .menu-bar-item:hover': {
        color: hoverColor,
        backgroundColor: hoverBgColor,
      },
    },
  };

  const renderItems = (items: NestMenuItemProps[], className: string) => {
    return (
      <div class={className}>
        {items.map((item) => {
          return item.items ? (
            <div class='menu-bar-sub-box'>
              <div class='menu-bar-item'>{item.text}</div>
              {renderItems(item.items, 'menu-bar-sub')}
            </div>
          ) : (
            <LinkItem className='menu-bar-item' url={item.url} alt={item.alt} text={item.text} />
          );
        })}
      </div>
    );
  };

  const ref: RefProps = {
    onLoad: async () => {
      if (menuId) {
        const menu = await fetchMenu(menuId);
        if (menu.result && menu.result.items.length > 0) {
          const items = menu.result.items.map((i: any) => {
            const l = i.split('\t');
            return { text: l[5], url: l[4] };
          });
          const newDom = renderItems(items, 'menu-bar-top');
          //mountComponents('.menu-bar-top', newDom);
        }
      }
    },
  };
  const onToggleClick = () => {
    const menu = ref.$('.menu-bar-mobile .menu-bar-toggle');
    menu.classList.toggle('active');
    const topMenu = ref.$('.menu-bar-top');
    topMenu.classList.toggle('open');
  };

  return (
    <div ref={ref} css={css} class={['menu-bar-box', className].join(' ')}>
      <div class='menu-bar-mobile'>
        <div class='menu-bar-toggle' onClick={onToggleClick}>
          <span></span>
        </div>
      </div>

      {renderItems(items, 'menu-bar-top')}
    </div>
  );
};
