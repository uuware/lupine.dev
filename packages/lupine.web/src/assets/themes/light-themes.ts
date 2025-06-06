import { sharedThemes } from './shared-themes';

export const lightThemes: { [key: string]: string } = {
  ...sharedThemes,
  '--theme-name': 'light',

  // scroll bar
  '--scrollbar-bg': '#d5d5d5',
  '--scrollbar-thumb-bg': '#979797',
  '--scrollbar-active-thumb-bg': '#737373',

  '--primary-color': '#303030',
  '--primary-color-disabled': '#a0a0a0',
  '--primary-bg-color': '#ffffff',
  '--primary-border-color': '#858585',
  '--primary-border': '1px solid var(--primary-border-color)',
  // '--secondary-color': '#505050',
  // '--secondary-bg-color': '#ffffff',
  // '--secondary-border': '1px solid #858585',
  '--primary-opacity': 'unset', // used for dark theme
  '--primary-disabled-opacity': '0.5', // used for dark theme
  '--primary-accent-color': '#0a74c9', // used for radio and checkbox's background color

  // including menus, tabs, sidebars
  '--activatable-color-normal': 'var(--primary-color)',
  '--activatable-bg-color-normal': 'var(--primary-bg-color)',
  '--activatable-color-hover': '#1d1d1d',
  '--activatable-bg-color-hover': '#bcbcbc',
  '--activatable-color-selected': '#2d2d2d',
  '--activatable-bg-color-selected': '#dcdcdc',
  // '--menu-color-hover': '#303030',
  // '--menu-bg-color': '#ffffff',
  // '--menu-bg-color-hover': '#a0a0a0',
  '--menu-font-size': '1rem',
  '--menubar-color': '#eeeeee',
  '--menubar-bg-color': '#000000',
  '--menubar-sub-bg-color': '#f9f9f9',
  '--sidebar-color': 'var(--primary-color)',
  '--sidebar-bg-color': '#f4f3f4',
  // '--sidebar-sub-color': 'var(--sidebar-color)',
  // '--sidebar-sub-bg-color': '#eaeaea',
  '--sidebar-border': '1px solid #858585',
  // '--sidebar-hover-color': 'var(--sidebar-color)',
  // '--sidebar-hover-bg-color': '#e0e0e0',

  '--row-bg-color1': '#ffffff',
  '--row-bg-color2': '#ffffff',

  '--success-color': '#04AA6D',
  '--info-color': '#2196F3',
  '--warning-color': '#ff9800',
  '--error-color': '#f44336',
  '--success-bg-color': '#04AA6D',
  '--info-bg-color': '#2196F3',
  '--warning-bg-color': '#ff9800',
  '--error-bg-color': '#f44336',
  '--notice-color-with-bg': '#ffffff',

  '--cover-mask-bg-color': '#00000060',
  '--cover-bg-color': '#f5f5f5',
  '--cover-box-shadow': '3px 3px 8px #767676',

  // for input, checkbox, radio box, select
  '--input-color': '#4e4e4e',
  '--input-bg-color': '#ffffff',
  '--input-box-shadow': '0px 0px 0px #000000, 1px 1px 0px 0px #50505045',
  '--input-border-focus': '1px solid #0074d9',

  // for button, div
  '--button-color': '#4e4e4e',
  '--button-bg': '-webkit-linear-gradient(top, #ffffff 0%, #f6f6f6 74%, #ededed 100%)',
  '--button-bg-hover': '-webkit-linear-gradient(top, #ffffff 0%, #e6e6e6 74%, #dddddd 100%)',
  '--button-border': '1px solid #f6f6f6',
  '--button-box-shadow': '1px 1px 1px #00000085, 0px 1px 0px 2px #0705053b',

  '--header-color': '#000080',
  '--header-bg-color': '#ffffff',

  // '--po-background': '#e5e5e5', //	Background for surfaces on top of primary background
  // // backgroundSecondary: '#f5f5f5', //	Secondary background
  // // backgroundOnSecondary: '#e5e5e5', //	Background for surfaces on top of secondary background
  // '--background-modifier-hover': '', //	Hovered elements
  // '--background-modifier-active-hover': '', //	Active hovered elements
  // '--background-modifier-border': '', //	Border color
  // '--background-modifier-border-hover': '', //	Border color (hover)
  // '--background-modifier-border-focus': '', //	Border color (focus)
  // '--background-modifier-error': '', //	Error background
  // '--background-modifier-error-hover': '', //	Error background (hover)
  // '--background-modifier-success': '', //	Success background
  // '--background-modifier-message': '', //	Messages background
  // '--background-modifier-form-field': '', //	Form field background
};
