import { darkThemes } from './dark-themes';
import { lightThemes } from './light-themes';

export const baseThemes: { [key: string]: { [key: string]: string } } = {
  light: lightThemes,
  dark: darkThemes,
  lightGreen: {
    ...lightThemes,
    '--background-primary': '#d8ffe3', //	Primary background
    '--color-primary': '#303030', //	Primary text color
    backgroundPrimary: '', //	Primary background
    backgroundOnPrimary: '', //	Background for surfaces on top of primary background
    backgroundSecondary: '#f5f5f7', //	Secondary background
    backgroundOnSecondary: '#e5e5e7', //	Background for surfaces on top of secondary background
  },
};
