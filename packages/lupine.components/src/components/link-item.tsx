export type LinkItemProps = {
  className?: string;
  text: string;
  url: string;
  alt?: string;
};
export const LinkItem = (props: LinkItemProps) => {
  return (
    <a class={['link-item', props.className].join(' ')} href={props.url} alt={props.alt || props.text}>
      {props.text}
    </a>
  );
};
