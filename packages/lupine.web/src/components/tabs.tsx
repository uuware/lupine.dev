import { mountComponents, mountSelfComponents } from '../core';
import { RefProps, VNode } from '../jsx';
import { stopPropagation } from '../lib';

export type TabsUpdateProps = {
  updateTitle?: (index: number, title: string) => void;
  updateIndex?: (index: number) => void;
  newPage?: (title: string, page: VNode<any>, index?: number) => Promise<void>;
  removePage?: (index: number) => void;
  indexChanged?: (index: number) => void;
  getIndex?: () => number;
  getCount?: () => number;
  findAndActivate?: (title: string) => boolean;
};

export type TabsPageProps = { title: string; page: VNode<any> };

export type TabsProps = {
  pages: TabsPageProps[];
  defaultIndex?: number;
  topClassName?: string;
  pagePadding?: string;
  refUpdate?: TabsUpdateProps;
};
// For CSS or query selectors, please pay attention to that Tabs can be nested
export const Tabs = ({ pages, defaultIndex, topClassName, pagePadding, refUpdate }: TabsProps) => {
  const ref: RefProps = {};
  let newIndex = typeof defaultIndex === 'number' ? defaultIndex : 0;
  const clearIndex = () => {
    const header = ref.$(`.tabs[data-refid=${ref.id}] > div > .tab.active`);
    header && header.classList.remove('active');
    const page = ref.$(`.pages[data-refid=${ref.id}] > .page.active`);
    page && page.classList.remove('active');
  };
  const updateIndex = (index: number) => {
    clearIndex();
    const doms = ref.$all(`.tabs[data-refid=${ref.id}] > div > .tab`);
    if (index >= 0 && index < doms.length) {
      doms[index].classList.add('active');
      const pages = ref.$all(`.pages[data-refid=${ref.id}] > .page`);
      pages[index].classList.add('active');
      refUpdate?.indexChanged && refUpdate?.indexChanged(index);
    }
  };
  const removePage = (index: number) => {
    const doms = ref.$all(`.tabs[data-refid=${ref.id}] > div > .tab`);
    if (index >= 0 && index < doms.length) {
      const newIndex = index === doms.length - 1 ? index - 1 : index;
      const isAct = doms[index].classList.contains('active');
      doms[index].parentNode.remove();
      const pages = ref.$all(`.pages[data-refid=${ref.id}] > .page`);
      pages[index].remove();

      if (isAct) {
        updateIndex(newIndex);
      }
    }
  };
  const removePageFromX = (event: any) => {
    stopPropagation(event);

    const tab = event.target.parentNode;
    const index = Array.prototype.indexOf.call(tab.parentNode.parentNode.children, tab.parentNode);
    removePage(index);
  };

  const newPage = async (title: string, page: VNode<any>, index?: number) => {
    const allTabs = ref.$all(`.tabs[data-refid=${ref.id}] > div > .tab`);
    let newPageIndex = allTabs.length;
    if (typeof index === 'number' && index >= 0 && index < allTabs.length) {
      newPageIndex = index;
    }

    clearIndex();
    const newTab2 = createTabHeader(title, ' active');
    const newTab = document.createElement('div');

    const newPage = document.createElement('div');
    newPage.className = 'page';
    if (newPageIndex === allTabs.length) {
      ref.$(`.tabs[data-refid=${ref.id}]`).appendChild(newTab);
      ref.$(`.pages[data-refid=${ref.id}]`).appendChild(newPage);
    } else {
      ref.$(`.tabs[data-refid=${ref.id}]`).insertBefore(newTab, allTabs[newPageIndex]);
      const pages = ref.$all(`.pages[data-refid=${ref.id}] > .page`);
      ref.$(`.pages[data-refid=${ref.id}]`).insertBefore(newPage, pages[newPageIndex]);
    }

    await mountComponents(newTab, newTab2);
    await mountComponents(newPage, page);
    updateIndex(newPageIndex);
  };
  const createTabHeader = (title: string, className: string) => {
    return (
      <div onClick={onTabClick} class={'tab' + className}>
        {title}
        <span class='modal-close' onClick={removePageFromX}>
          ×
        </span>
      </div>
    );
  };
  const onTabClick = (event: any) => {
    stopPropagation(event);

    const tab = event.target;
    const index = Array.prototype.indexOf.call(tab.parentNode.parentNode.children, tab.parentNode);
    updateIndex(index);
  };
  const flashTitle = (index: number) => {
    const doms = ref.$all(`.tabs[data-refid=${ref.id}] > div > .tab`);
    if (index >= 0 && index < doms.length) {
      doms[index].classList.add('flash');
      setTimeout(() => {
        doms[index].classList.remove('flash');
      }, 1000);
    }
  };
  if (refUpdate) {
    refUpdate.updateTitle = (index: number, title: string) => {
      const doms = ref.$all(`.tabs[data-refid=${ref.id}] > div > .tab`);
      if (index >= 0 && index < doms.length) {
        doms[index].innerHTML = title;
      }
    };
    refUpdate.updateIndex = updateIndex;
    refUpdate.removePage = removePage;
    refUpdate.newPage = newPage;
    refUpdate.getIndex = () => {
      const header = ref.$(`.tabs[data-refid=${ref.id}] > div > .tab.active`);
      return header ? Array.prototype.indexOf.call(header.parentNode.parentNode.children, header.parentNode) : -1;
    };
    refUpdate.getCount = () => {
      const doms = ref.$all(`.tabs[data-refid=${ref.id}] > div > .tab`);
      return doms.length;
    };
    refUpdate.findAndActivate = (title: string) => {
      const doms = ref.$all(`.tabs[data-refid=${ref.id}] > div > .tab`);
      for (let i = 0; i < doms.length; i++) {
        if (doms[i].innerText === title) {
          updateIndex(i);
          flashTitle(i);
          return true;
        }
      }
      return false;
    };
  }

  // pay attention to nest tabs
  const newCss: any = {
    display: 'flex',
    'flex-direction': 'column',
    width: '100%',
    height: '100%',
    // border: 'solid 1px grey',
    '&:not(:has(.pages .page))': {
      // hide tabs when there is no tabs (not need to show borders)
      display: 'none',
    },
    '> .tabs': {
      display: 'flex',
      height: 'auto',
      'border-bottom': '1px solid grey',
      '> div > .tab': {
        padding: '2px 3px',
        width: 'auto',
        'font-size': 'smaller',
        'text-overflow': 'ellipsis',
        overflow: 'hidden',
        'white-space': 'nowrap',
        margin: '1px 1px 0 1px',
        cursor: 'pointer',
        position: 'relative',
        // transition: 'all 1s',
        'border-top-right-radius': '4px',
        'border-top-left-radius': '4px',
        'border-top': 'solid 1px var(--primary-border-color)',
        'border-left': 'solid 1px var(--primary-border-color)',
        'border-right': 'solid 1px var(--primary-border-color)',
        // 'border-bottom': '2px solid transparent',
        color: 'var(--activatable-color-normal)',
        backgroundColor: 'var(--activatable-bg-color-normal)',
      },
      '> div > .tab:hover': {
        padding: '3px 3px 1px 3px',
        // color: 'var(--activatable-color-hover)',
        // backgroundColor: 'var(--activatable-bg-color-hover)',
      },
      '> div > .tab.flash': {
        backgroundColor: 'red',
      },
      '> div > .active': {
        // 'border-bottom': '2px solid red',
        color: 'var(--activatable-color-selected)',
        backgroundColor: 'var(--activatable-bg-color-selected)',
        marginBottom: '-1px',
        borderBottom: '1px solid #FFFFFF00',
      },
      '> div > .tab > .modal-close': {
        display: 'none',
        float: 'right',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        position: 'absolute',
        top: '-4px',
        right: '1px',
      },
      '> div > .tab:hover > .modal-close': {
        display: 'inline-block',
        color: '#ff0000',
      },
    },
    '> .pages': {
      display: 'flex',
      flex: '1',
      position: 'relative',
      '> .page': {
        display: 'none',
        position: 'absolute',
        padding: pagePadding || '0px',
        overflow: 'auto',
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        overflowX: 'auto',
        overflowY: 'auto',
      },
      '> .active': {
        display: 'inline-block',
      },
    },
  };

  return (
    <div ref={ref} css={newCss} class={'tabs-box' + (topClassName ? ' ' + topClassName : '')}>
      <div class='tabs' data-refid={ref}>
        {pages.map((i, index) => {
          const className = index === newIndex ? ' active' : '';
          return <div>{createTabHeader(i.title, className)}</div>;
        })}
      </div>
      <div class='pages' data-refid={ref}>
        {pages.map((i, index) => {
          const className = index === newIndex ? ' active' : '';
          return <div class={'page' + className}>{i.page}</div>;
        })}
      </div>
    </div>
  );
};
