/// <reference types="./global" />

import { JSXInternal } from './jsx';
export * from './jsx';
export * from './core';
export * from './lib';
export * from './components';
export * from './types';
export * from './assets/themes';

declare global {
  namespace JSX {
    interface IntrinsicElements extends JSXInternal.IntrinsicElements {}
  }
}
