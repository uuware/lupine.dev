import { CssProps, getRenderPageProps, HtmlVar, initializePage, RefProps } from 'lupine.js';
import { StoryListComponent } from './story-list';
import { StoryCardShortProps } from './story-props';

export const getMusicList = async (management: boolean) => {
  // const result = await getRenderPageProps().renderPageFunctions.fetchData('/api/music-list');
  // console.log('====getMusicList', result);
  // if (!result.json || result.json.status !== 'ok') {
  //   // NoticeMessage.sendMessage('Failed to get user info.', NotificationColor.Error);
  //   return null;
  // }
  return {
    count: 100,
    management,
    results: Array.from({ length: 100 }).map(
      (_, index) =>
        ({
          id: index + 1,
          title: `琴谱 ${index + 1}`,
          cover_file: `/assets/images/sample.png`,
          author: `作者 ${index + 1}`,
          view_count: 100 + index,
          download_count: 50 + index,
          collect_count: 30 + index,
          start_time_seconds: new Date().getTime() / 1000,
        } as StoryCardShortProps)
    ),
  };
};

export type SearchMusicProps = {
  management: boolean;
};
export const HomeSearchComponent = (props: SearchMusicProps) => {
  const css: CssProps = {
    display: 'flex',
    // paddingTop: '4px',
    // paddingRight: '8px',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    '.search-result-box': {
      width: '100%',
    },
    '.navigation-bar-box': {
      width: '100%',
      height: '20px',
      position: 'relative',
      marginBottom: '16px',
      // textAlign: 'center',
    },
    '.navigation-bar': {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      display: 'flex',
      whiteSpace: 'nowrap',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      // justifyContent: 'center',
      // textAlign: 'left',
    },
    // '.navigation-bar:has(scrollbar), .navigation-bar::-webkit-scrollbar': {
    //   justifyContent: 'flex-start',
    // },
    '.navigation-item': {
      padding: '6px 10px',
      borderRadius: '12px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#f0f0f0',
      },
    },
    '.navigation-item.active': {
      backgroundColor: '#f0f0f0',
      fontWeight: 600,
    },
  };

  const dom = HtmlVar('');
  const ref: RefProps = {
    onLoad: async () => {
      await onSearch();
    },
  };
  const onSearch = async () => {
    const result = await getMusicList(props.management);
    dom.value = (
      <div>
        {result.count > 0 ? (
          <StoryListComponent items={result.results} count={result.count} management={props.management} />
        ) : (
          'no result'
        )}
      </div>
    );
  };
  const onAdd = () => {
    initializePage('/management-new');
  };
  return (
    <div css={css} class='search-music-box' ref={ref}>
      <div className='row-box search-box m-auto p-m w-100p'>
        <input class='input-base txt-search flex-1' type='text' placeholder='请输入琴谱名，演唱者等关键词' />
        <button class='button-base btn-search' onClick={onSearch}>
          搜索
        </button>
        {props.management && (
          <button class='button-base btn-add ml-m' onClick={onAdd}>
            添加
          </button>
        )}
      </div>
      <div class='navigation-bar-box mt-m'>
        <div class='navigation-bar'>
          <div class='navigation-item active'>全部</div>
          <div class='navigation-item'>华语</div>
          <div class='navigation-item'>欧美</div>
          <div class='navigation-item'>日韩</div>
          <div class='navigation-item'>次元</div>
          <div class='navigation-item'>古风</div>
          <div class='navigation-item'>简易</div>
        </div>
      </div>
      <div class='search-result-box'>{dom.node}</div>
    </div>
  );
};
