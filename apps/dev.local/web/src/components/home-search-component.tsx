import { CssProps, DragFresh, DragRefreshCloseProps, HtmlVar, initializePage, NotificationColor, NotificationMessage, RefProps } from 'lupine.web';
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
          title: `Title ${index + 1}`,
          cover_file: `/assets/images/sample.png`,
          author: `Author ${index + 1}`,
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
  const onDragRefresh = async (close: DragRefreshCloseProps) => {
    NotificationMessage.sendMessage('Refreshing...', NotificationColor.Info);
    await onSearch();
    close();
  };
  return (
    <div css={css} class='search-music-box' ref={ref}>
      <DragFresh container='.search-music-box' onDragRefresh={onDragRefresh} />
      <div className='row-box search-box m-auto p-m w-100p'>
        <input class='input-base txt-search flex-1' type='text' placeholder='Please input keywords' />
        <button class='button-base btn-search' onClick={onSearch}>
          Search
        </button>
        {props.management && (
          <button class='button-base btn-add ml-m' onClick={onAdd}>
            Add
          </button>
        )}
      </div>
      <div class='navigation-bar-box mt-m'>
        <div class='navigation-bar'>
          <div class='navigation-item active'>All</div>
          <div class='navigation-item'>Chinese</div>
          <div class='navigation-item'>Europe</div>
          <div class='navigation-item'>Asia</div>
          <div class='navigation-item'>Dimension</div>
          <div class='navigation-item'>Ancient</div>
          <div class='navigation-item'>Simple</div>
        </div>
      </div>
      <div class='search-result-box'>{dom.node}</div>
    </div>
  );
};
