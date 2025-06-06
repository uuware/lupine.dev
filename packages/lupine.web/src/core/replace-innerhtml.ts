export const replaceInnerhtml = async (el: Element, newHtml: string) => {
  const promises: Promise<void>[] = [];
  el.querySelectorAll('[data-ref]').forEach((child: any) => {
    if (child._lj && child._lj.onUnload) {
      promises.push(child._lj.onUnload());
    }
  });
  await Promise.all(promises);
  el.innerHTML = newHtml;
};
