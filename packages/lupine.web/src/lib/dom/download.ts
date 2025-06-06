export const download = (link: string, filename?: string) => {
  const dom = document.createElement('a');
  dom.setAttribute('href', link);
  dom.setAttribute('download', filename || 'true');
  dom.style.display = 'none';
  document.body.appendChild(dom);
  dom.click();
  setTimeout(() => {
    document.body.removeChild(dom);
  }, 3000);
  return dom;
};
