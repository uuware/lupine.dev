import { baseThemes, ThemesProps } from 'lupine.components';

const themesBase = {
  // '--input-padding': '1.07rem .6rem',
  '--page-title-font-size': '2rem',
  '--font-family-base':
    'PingFang SC,system-ui,-apple-system,BlinkMacSystemFont,Helvetica Neue,Hiragino Sans GB,Microsoft YaHei UI,Microsoft YaHei,Arial,sans-serif',
};
export const themes: ThemesProps = {
  light: {
    ...baseThemes.light,
    ...themesBase,
  },
  dark: {
    ...baseThemes.dark,
    ...themesBase,
  },
  lightGreen: baseThemes.light,
};
