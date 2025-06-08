/**
 * @param text
 * @param font, sample: italic/normal 19pt Times New Roman
 * @returns width
 */
const calculateTextWidthSaved: { canvas: any } = { canvas: null };
export function calculateTextWidth(text: string, font: string) {
  let canvas = calculateTextWidthSaved.canvas || (calculateTextWidthSaved.canvas = document.createElement('canvas'));
  let context = canvas.getContext('2d');
  context.font = font;
  let metrics = context.measureText(text);
  return metrics.width;
}
