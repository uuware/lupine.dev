/// <reference types="node" />

// // declare module "*.svg";
// declare module "*.svg" {
//   /**
//    * Use `any` to avoid conflicts with
//    * `@svgr/webpack` plugin or
//    * `babel-plugin-inline-react-svg` plugin.
//    */
//   const content: any;
//   export default content;
// }
declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
