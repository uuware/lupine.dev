import { LinkItem } from './link-item';
import { NestMenuItemProps } from './menu-item-props';

export type LinkListProps = {
  title: string;
  items: NestMenuItemProps[];
  className?: string;
  textColor?: string;
  backgroundColor?: string;
  titleBackgroundColor?: string;
};
export const LinkList = ({
  title,
  items,
  className,
  textColor = 'black',
  backgroundColor = '#d3d3d3',
  titleBackgroundColor = '#b6b6b6',
}: LinkListProps) => {
  const css: any = {
    width: '100%',
    margin: 'auto',
    height: 'auto',
    backgroundColor,
    '.link-list-title, .link-list-top': {
      display: 'flex',
      width: '100%',
      flexWrap: 'wrap',
      padding: '0 16px',
    },
    '.link-list-title': {
      backgroundColor: titleBackgroundColor,
    },
    '.link-list-item': {
      display: 'inline-block',
      color: textColor,
      padding: '8px 16px 8px 0',
      textDecoration: 'none',
    },
    '.link-list-item:last-child': {
      paddingRight: 'unset',
    },
    '.link-list-title .link-list-item': {
      fontSize: '18px',
    },
  };

  return (
    <div css={css} class={['link-list-box', className].join(' ')}>
      {title && (
        <div class='link-list-title'>
          <div class='link-list-item'>{title}</div>
        </div>
      )}
      <div class='link-list-top'>
        {items.map((item) => {
          return <LinkItem className='link-list-item' url={item.url} alt={item.alt} text={item.text} />;
        })}
      </div>
    </div>
  );
};
