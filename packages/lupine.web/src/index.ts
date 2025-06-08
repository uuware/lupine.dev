/// <reference types="./global" />

import { JSXInternal } from './jsx';
export * from './jsx';
export * from './core';
export * from './lib';
export * from './models';
export * from './styles';

declare global {
  namespace JSX {
    interface IntrinsicElements extends JSXInternal.IntrinsicElements {}
  }
}
