import { initializePage, NotificationMessage, NotificationColor, RefProps, CssProps } from 'lupine.web';
import { StoryCardShortProps } from './story-props';

export const StoryCard = (props: StoryCardShortProps) => {
  const css: CssProps = {
    clear: 'both',
    margin: 'auto',
    height: 'auto',
    lineHeight: '1.6',
    paddingBottom: '16px',
    maxWidth: '100%',
    width: '100%',
    position: 'relative',
    '.story-card-title-link': {
      fontSize: '120%',
      color: 'black',
      fontWeight: 'bold',
    },
    '.story-card-row .tag': {
      color: '#999',
      verticalAlign: 'bottom',
    },
    '.story-card-row .label.name': {
      maxWidth: '110px',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      verticalAlign: 'bottom',
    },
    '.story-card-img': {
      float: 'left',
      width: '100%',
    },
    '.story-card-buttons': {
      position: 'absolute',
      top: '-2px',
      right: '0',
      justifyContent: 'flex-end',
    },
    '.story-card-link': {
      textDecoration: 'none',
      color: 'var(--primary-color)',
    },
    '.story-card-title .title': {
      wordBreak: 'break-all',
      fontWeight: 500,
      fontSize: '15px',
      lineHeight: '140%',
    },
    '.story-card-info .author': {
      wordBreak: 'break-all',
      fontSize: '12px',
    },
  };

  const onEdit = () => {
    initializePage(`/admin/music-edit/${props.id}`);
  };
  const onDelete = async () => {
    if (confirm('Are you sure you want to delete this record and related files?')) {
      ref.current?.parentElement.remove();
      NotificationMessage.sendMessage('Delete successfully', NotificationColor.Success);
    }
  };
  const ref: RefProps = {};
  return (
    <section ref={ref} css={css} class='story-card-box'>
      {props.management && (
        <div class='story-card-buttons pr-s'>
          <button class='button-base button-ss' onClick={onEdit}>
            Edit
          </button>
          <button class='button-base button-ss' onClick={onDelete}>
            Delete
          </button>
        </div>
      )}
      <a class='story-card-link' href={`/user/play/${props.id}`}>
        <div class='story-card-img-box'>
          <img class='story-card-img' src={props.cover_file} />
          <div class='story-card-img-tips'>
            <span class='view_count'>{props.view_count}</span>
            <span class='collect_count'>{props.collect_count}</span>
          </div>
        </div>
        <div class='story-card-row story-card-title'>
          <span class='title'>{props.title}</span>
        </div>
      </a>
      <div class='story-card-row story-card-info'>
        <span class='author'>{props.author}</span>
      </div>
    </section>
  );
};
