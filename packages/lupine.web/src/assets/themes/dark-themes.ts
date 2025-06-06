import { sharedThemes } from './shared-themes';

export const darkThemes: { [key: string]: string } = {
  ...sharedThemes,
  '--theme-name': 'dark',

  '--scrollbar-bg': '#1c1c1c',
  '--scrollbar-thumb-bg': '#373636',
  '--scrollbar-active-thumb-bg': '#5b5b5b',

  '--primary-color': '#aeaeae',
  '--primary-color-disabled': '#7d7d7d',
  '--primary-bg-color': '#000000',
  '--primary-border-color': '#aeaeae',
  '--primary-border': '1px solid var(--primary-border-color)',
  // '--secondary-color': '#b3b3b3',
  // '--secondary-bg-color': '#151515',
  // '--secondary-border': '1px solid #303030',
  '--primary-opacity': '0.5', // used for dark theme
  '--primary-disabled-opacity': '0.7', // used for dark theme
  '--primary-accent-color': '#0c3c63', // used for radio and checkbox's background color

  // including menus, tabs
  '--activatable-color-normal': 'var(--primary-color)',
  '--activatable-bg-color-normal': 'var(--primary-bg-color)',
  '--activatable-color-hover': '#e2e2e2',
  '--activatable-bg-color-hover': '#6d6d6d',
  '--activatable-color-selected': '#c2c2c2',
  '--activatable-bg-color-selected': '#5d5d5d',
  // '--menu-color-hover': '#303030',
  // '--menu-color': 'var(--primary-color)',  //'#2a2a2a',
  // '--menu-bg-color': 'var(--primary-bg-color)',  //'#2a2a2a',
  // '--menu-bg-color-hover': '#a0a0a0',
  '--menu-font-size': '1rem',
  '--menubar-color': '#eeeeee',
  '--menubar-bg-color': '#000000',
  '--menubar-sub-bg-color': '#f9f9f9',
  '--sidebar-color': 'var(--primary-color)',
  '--sidebar-bg-color': '#000000',
  // '--sidebar-sub-color': 'var(--sidebar-color)',
  // '--sidebar-sub-bg-color': '#000000',
  '--sidebar-border': '1px solid #303030',
  // '--sidebar-hover-color': 'var(--sidebar-color)',
  // '--sidebar-hover-bg-color': '#000000',

  '--row-1-bg-color': '#212121',
  '--row-2-bg-color': '#303030',
  '--row-hover-bg-color': '#383838',

  '--success-color': '#04AA6D',
  '--info-color': '#2196F3',
  '--warning-color': '#ff9800',
  '--error-color': '#f44336',
  '--success-bg-color': '#10553b',
  '--info-bg-color': '#1a588a',
  '--warning-bg-color': '#a36305',
  '--error-bg-color': '#882c25',
  '--notice-color-with-bg': '#ececec',

  '--cover-mask-bg-color': '#878a9460',
  '--cover-bg-color': '#202020',
  '--cover-box-shadow': '1px 1px 4px #c6c6c6',

  '--input-color': '#bdbdbd',
  '--input-bg-color': '#000000',
  '--input-box-shadow': '0px 0px 0px #000000, 1px 1px 0px 0px #50505045',
  '--input-border-focus': '1px solid #0074d9',

  '--button-color': '#bdbdbd',
  '--button-bg': '-webkit-linear-gradient(top, #282828 0%, #212223 74%, #1a1a1a 100%)', // darker
  '--button-bg-hover': '-webkit-linear-gradient(top, #282828 0%, #313233 74%, #252525 100%)', // darker
  // '--button-bg': '-webkit-linear-gradient(top, #414141 0%, #373e48 74%, #434242 100%)',
  '--button-border': '1px solid #373e48',
  '--button-box-shadow': 'unset',

  '--header-color': '#000080',
  '--header-bg-color': '#000000',

  // '--background-primary': '#353536', //	Primary background
  // '--color-primary': '#e0e0e0', //	Primary text color
  // backgroundPrimary: '', //	Primary background
  // backgroundOnPrimary: '', //	Background for surfaces on top of primary background
  // backgroundSecondary: '#f5f5f6', //	Secondary background
  // backgroundOnSecondary: '#e5e5e6', //	Background for surfaces on top of secondary background
};
