import * as webEnv from '../../common-js/web-env.js';

export const loadEnv = async (envFile: string, overrideEnv: boolean = false) => {
  return webEnv.loadEnv(envFile, overrideEnv);
};

export const getWebEnv = (appName: string): { [k: string]: string } => {
  return webEnv.getWebEnv(appName) as { [k: string]: string };
};

// // Replace <!--META-ENV-START-->...<!--META-ENV-END--> for mobile app and replace it again for web app
// export const replaceWebEnv = (html: string, appName: string, addMetaTag: boolean) => {
//   return webEnv.replaceWebEnv(html, appName, addMetaTag);
// }
