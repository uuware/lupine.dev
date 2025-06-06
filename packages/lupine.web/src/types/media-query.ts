// export enum MediaQuery {
//   ExtraSmall = "@media only screen and (max-width: 480px)",
//   Mobile = "@media only screen and (min-width: 481px) and (max-width: 767px)",
//   Tablet = "@media only screen and (min-width: 768px) and (max-width: 991px)",
//   Desktop = "@media only screen and (min-width: 992px) and (max-width: 1399px)",
//   ExtraLarge = "@media only screen and (min-width: 1400px)",
// }

/*
--> Bootstrap – 576px, 768px, 992px, 1200px, 1400px
Tailwind - 640px, 768px, 1024px, 1280px, 1536px
Foundation: <640px, ≥640px, ≥1200px
Bulma: <769px, ≥769px, ≥1024px, ≥1216px, and ≥1408px
Semantic UI: <768px, ≥768px, ≥992px, ≥1400px, ≥1920px
Primer: <544px, ≥544px, ≥768px, ≥1012px, ≥1280px
UIKit: <479px, ≥480px, ≥768px, ≥960px, ≥1200px
*/

export class MediaQueryMaxWidth {
  private static _ExtraSmall = '480px';
  private static _Mobile = '767px'; // Grid: col-1, 12
  private static _Tablet = '991px'; // Grid: col-1-md, 12-md
  private static _Desktop = '1399px'; // Grid: col-1-lg, 12-lg
  public static get ExtraSmallMax() {
    return MediaQueryMaxWidth._ExtraSmall;
  }
  public static get MobileMax() {
    return MediaQueryMaxWidth._Mobile;
  }
  public static get TabletMax() {
    return MediaQueryMaxWidth._Tablet;
  }
  public static get DesktopMax() {
    return MediaQueryMaxWidth._Desktop;
  }

  public static set ExtraSmallMax(value: string) {
    MediaQueryMaxWidth._ExtraSmall = value;
  }
  public static set MobileMax(value: string) {
    MediaQueryMaxWidth._Mobile = value;
  }
  public static set TabletMax(value: string) {
    MediaQueryMaxWidth._Tablet = value;
  }
  public static set DesktopMax(value: string) {
    MediaQueryMaxWidth._Desktop = value;
  }
}
export class MediaQueryRange {
  public static get ExtraSmallBelow() {
    return `@media only screen and (max-width: ${MediaQueryMaxWidth.ExtraSmallMax})`;
  }
  public static get ExtraSmallAbove() {
    return `@media only screen and (min-width: ${MediaQueryMaxWidth.ExtraSmallMax})`;
  }
  public static get MobileBelow() {
    return `@media only screen and (max-width: ${MediaQueryMaxWidth.MobileMax})`;
  }
  public static get MobileAbove() {
    return `@media only screen and (min-width: ${MediaQueryMaxWidth.MobileMax})`;
  }
  public static get TabletBelow() {
    return `@media only screen and (max-width: ${MediaQueryMaxWidth.TabletMax})`;
  }
  public static get TabletAbove() {
    return `@media only screen and (min-width: ${MediaQueryMaxWidth.TabletMax})`;
  }
  public static get DesktopBelow() {
    return `@media only screen and (max-width: ${MediaQueryMaxWidth.DesktopMax})`;
  }
  public static get DesktopAbove() {
    return `@media only screen and (min-width: ${MediaQueryMaxWidth.DesktopMax})`;
  }
}

export enum MediaQueryDirection {
  Below,
  Above,
}
export function adjustedMediaQueryRange(
  direction: MediaQueryDirection,
  mediaQueryWidth: string,
  adjustWidth: number
): string {
  const adjustedWidth = Number.parseInt(mediaQueryWidth) + adjustWidth;
  if (direction === MediaQueryDirection.Below) {
    return `@media only screen and (max-width: ${adjustedWidth}px)`;
  } else {
    // if (direction === MediaQueryRangeDirection.Above) {
    return `@media only screen and (min-width: ${adjustedWidth}px)`;
  }
}
