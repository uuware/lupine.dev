import { RefProps, stopPropagation } from 'lupine.web';

export type PopupMenuOpenMenuProps = { handle?: Function };

export type PopupMenuProps = {
  list: string[];
  defaultValue: string;
  tips?: string;
  minWidth?: string;
  maxWidth?: string;
  maxHeight?: string;
  handleSelected?: Function;
  handleOpened?: Function;
  handleClosed?: Function;
  noUpdateValue?: boolean;
  refOpenMenu?: PopupMenuOpenMenuProps;
};

export type PopupMenuWithButtonProps = { label: string } & PopupMenuProps;

export const PopupMenuWithButton = (props: PopupMenuWithButtonProps) => {
  const handle: PopupMenuOpenMenuProps = {};
  return (
    <button
      class='button-base'
      onClick={() => {
        handle.handle && handle.handle();
      }}
      css={{ '>div': { float: 'right', textAlign: 'left' } }}
    >
      {props.label}:{' '}
      <PopupMenu
        list={props.list}
        defaultValue={props.defaultValue}
        tips={props.tips}
        minWidth={props.minWidth}
        maxWidth={props.maxWidth}
        maxHeight={props.maxHeight}
        handleSelected={props.handleSelected}
        handleOpened={props.handleOpened}
        handleClosed={props.handleClosed}
        noUpdateValue={props.noUpdateValue}
        refOpenMenu={handle}
      ></PopupMenu>
    </button>
  );
};

export type PopupMenuWithLabelProps = { label: string } & PopupMenuProps;

export const PopupMenuWithLabel = (props: PopupMenuWithLabelProps) => {
  const handle: PopupMenuOpenMenuProps = {};
  return (
    <div
      onClick={() => {
        handle.handle && handle.handle();
      }}
      css={{ cursor: 'pointer', '>div': { float: 'right', textAlign: 'left' } }}
    >
      {props.label}:{' '}
      <PopupMenu
        list={props.list}
        defaultValue={props.defaultValue}
        tips={props.tips}
        minWidth={props.minWidth}
        maxWidth={props.maxWidth}
        maxHeight={props.maxHeight}
        handleSelected={props.handleSelected}
        handleOpened={props.handleOpened}
        handleClosed={props.handleClosed}
        noUpdateValue={props.noUpdateValue}
        refOpenMenu={handle}
      ></PopupMenu>
    </div>
  );
};

export const PopupMenu = ({
  list,
  defaultValue,
  tips = '',
  minWidth,
  maxWidth,
  maxHeight,
  handleSelected,
  handleOpened,
  handleClosed,
  noUpdateValue,
  refOpenMenu,
}: PopupMenuProps) => {
  const css: any = {
    '.popup-menu-item': {
      padding: '0 0 1px 0',
      display: 'inline-block',
      position: 'relative',
      '.popup-menu-text': {
        display: 'inline-block',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        marginRight: '15px',
      },
      // cover-box-shadow
      '.popup-menu-text::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: '3px',
        width: 0,
        height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: '5px solid var(--primary-color)',
      },
    },
    '.popup-menu-item:hover': {
      padding: '1px 0 0 0',
    },
    '.popup-menu-bottom': {
      position: 'relative',
      height: '1px',
      '.popup-menu-list': {
        display: 'none',
        position: 'absolute',
        fontSize: 'var(--menu-font-size)',
        top: 0,
        left: '2px',
        color: 'var(--activatable-color-normal)',
        backgroundColor: 'var(--activatable-bg-color-normal)',
        zIndex: 'var(--layer-menu)',
        borderRadius: '4px',
        border: '1px solid #ddd',
        padding: '5px 0px',
        overflow: 'auto',
        'line-height': '1.2em',
        'min-width': minWidth || 'auto',
        'max-width': maxWidth || '200px',
        'max-height': maxHeight || '300px',
        'box-shadow': 'var(--cover-box-shadow)', //'#0000004c 0px 19px 38px, #00000038 0px 15px 12px',
        '.menu-focus': {
          position: 'absolute',
          height: '0px',
        },
        '.item': {
          padding: '2px 12px',
        },
        '.item:hover': {
          padding: '2px 11px 2px 13px',
          color: 'var(--activatable-color-hover)',
          backgroundColor: 'var(--activatable-bg-color-hover)',
          cursor: 'pointer',
        },
      },
    },
  };

  let ref: RefProps = { id: '' };
  let isShowing = false;
  const handleClick = (event: any) => {
    stopPropagation(event);

    handleOpened && handleOpened();
    // console.log('=======22', event);
    isShowing = !isShowing;
    ref.$('.popup-menu-list').style.display = isShowing ? 'inline-block' : 'none';
    ref.$('.popup-menu-list .menu-focus').focus();
  };
  if (refOpenMenu) {
    refOpenMenu.handle = handleClick;
  }
  const itemClick = (event: any) => {
    stopPropagation(event);

    // console.log('=======', event);
    isShowing = false;
    ref.$('.popup-menu-list').style.display = 'none';
    if (event.target) {
      if (noUpdateValue !== true) {
        ref.$('.popup-menu-item .popup-menu-text').innerText = event.target.innerText;
      }
      if (handleSelected) {
        handleSelected(event.target.innerText);
      }
    }
    handleClosed && handleClosed();
  };
  const onBlur = (event: any) => {
    setTimeout(() => {
      ref.$('.popup-menu-list').style.display = 'none';
      isShowing && handleClosed && handleClosed();
      isShowing = false;
    }, 300);
  };

  return (
    <div ref={ref} css={css} onClick={handleClick} title={tips}>
      <div class='popup-menu-item'>
        <span class='popup-menu-text'>{defaultValue || '&nbsp;'}</span>
      </div>
      <div class='popup-menu-bottom'>
        <div class='popup-menu-list'>
          <div>
            {list.map((item) => {
              return item === '' ? (
                <hr />
              ) : (
                <div class='item' onClick={itemClick}>
                  {item}
                </div>
              );
            })}
          </div>
          <div class='menu-focus' onBlur={onBlur} tabIndex={0}></div>
        </div>
      </div>
    </div>
  );
};
