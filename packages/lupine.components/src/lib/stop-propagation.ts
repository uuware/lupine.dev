export const stopPropagation = (event: any) => {
  if (!event) return;
  if (event.stopPropagation) event.stopPropagation();
  if (event.preventDefault) event.preventDefault();
  event.cancelBubble = true;
  event.returnValue = false;
};
