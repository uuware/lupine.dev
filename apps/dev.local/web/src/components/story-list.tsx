import { adjustedMediaQueryRange, CssProps, MediaQueryDirection, MediaQueryMaxWidth, MediaQueryRange, Panel } from 'lupine.web';
import { StoryCardShortProps } from './story-props';
import { StoryCard } from './story-card';

export type StoryListComponentProps = {
  items: StoryCardShortProps[];
  count: number;
  management: boolean;
};

export const StoryListComponent = (props: StoryListComponentProps) => {
  const maxWidth = '1399px';
  const css: CssProps = {
    alignSelf: 'center',
    paddingBottom: '16px',
    clear: 'both',
    width: '100%',
    '.story-list-inner': {
      // display: 'grid',
      // gridGap: '10px',
      // gridAutoRows: 'auto',
      // gridTemplateColumns: 'repeat(5, 1fr)',
      columnCount: 5,
      columnGap: '10px',
      // display: 'flex',
      // flexWrap: 'wrap',
      maxWidth: '100%',
      width: '100%',
      // padding: '0 16px',
      margin: 'auto',
      // placeContent: 'space-between',
      '.story-list-sub': {
        // width: 'calc(25% - 10.7px)', // (16 + 16) / 3
        width: '100%',
        overflow: 'hidden',
        // paddingTop: '16px',
      },
      '.card-list-sub-box': {
        borderRadius: '6px',
        // border: 'dotted 1px gray',
        padding: '8px',
      },
      [adjustedMediaQueryRange(MediaQueryDirection.Above, maxWidth || '', 32)]: {
        padding: '0',
      },
      [MediaQueryRange.DesktopAbove]: {
        '.story-list-sub:nth-child(3n+1), .story-list-sub:nth-child(3n+2)': {
          marginRight: '16px',
        },
      },
      // [MediaQueryRange.DesktopAbove]: {
      //   '.card-list-sub:nth-child(3n+1) .card-list-sub-box, .card-list-sub:nth-child(3n+2) .card-list-sub-box': {
      //     marginRight: '16px',
      //   },
      // },
      [MediaQueryRange.DesktopBelow]: {
        columnCount: 4,
        // gridTemplateColumns: 'repeat(4, 1fr)',
        '.story-list-sub': {
          // width: 'calc(33.33% - 10.7px)', // (16 + 16) / 3
        },
        '.story-list-sub:nth-child(2n+1)': {
          marginRight: '16px',
        },
      },
      [MediaQueryRange.MobileBelow]: {
        columnCount: 3,
        // gridTemplateColumns: 'repeat(3, 1fr)',
        '.story-list-sub': {
          // width: 'calc(50% - 8px)',
        },
        '.story-list-sub:nth-child(2n+1)': {
          marginRight: '16px',
        },
      },
      [MediaQueryRange.ExtraSmallBelow]: {
        columnCount: 2,
        // gridTemplateColumns: 'repeat(2, 1fr)',
        // padding: '0 16px',
        '.story-list-sub': {
          // width: '100%',
          marginRight: '0!important',
        },
      },
    },
  };
  return (
    <section css={css} className='story-list-box'>
      <div class='story-list-inner'>
        {props.items.map((item) => {
          return (
            <div class='story-list-sub'>
              <StoryCard {...item} management={props.management} />
            </div>
          );
        })}
      </div>
    </section>
  );
};
