export const Footer = (props?: any) => {
  const css: any = {
    display: 'flex',
    padding: '0 32px 16px',
    '.footer-cp': {
      padding: '1px 15px',
      margin: 'auto',
    },
  };
  return (
    <div css={css} class={['footer-box', props.className].join(' ')}>
      <div class='footer-cp'>{props.title}</div>
    </div>
  );
};
