const path = require('path');
const fs = require('fs/promises');
const webEnv = require('../src/common-js/web-env.js');
const fileUtils = require('./file-utils.js');

const fileSizeAndTime = async (filename) => {
  try {
    var stats = await fs.stat(filename);
    return { size: stats.size, mtime: stats.mtime };
  } catch (e) {
    return false;
  }
};
const fileUpdateTime = async (filename, time) => {
  fs.utimes(filename, time, time);
};

const readWebConfig = async (outdirData) => {
  let tempPath = path.join(outdirData, 'config.json');
  if (!(await fileUtils.pathExists(tempPath))) {
    tempPath = path.join(outdirData, 'resources', 'config_default.json');
  }

  // file should exist
  const data = await fs.readFile(tempPath, 'utf-8');
  const json = JSON.parse(data || {});
  return webEnv.getWebConfig(json);
};

const metaTextStart = '<!--META-ENV-START-->';
const metaTextEnd = '<!--META-ENV-END-->';
exports.cpIndexHtml = async (htmlFile, outputFile, appName, isMobile, defaultThemeName, outdirData) => {
  const f1 = await fileSizeAndTime(htmlFile);
  const f2 = await fileSizeAndTime(outputFile);

  // once isMobile is changed, then index.html file needs to be rebuilt
  // if isMobile=true, then the last number is 1, or if isMobile=false, the last is 2
  const chgTime = Math.trunc(f1.mtime.getTime() / 10) * 10 + (isMobile ? 1 : 2);

  // when it's isMobile, need to update env and configs
  if (!f2 || f2.mtime.getTime() !== chgTime || isMobile) {
    const inHtml = await fs.readFile(htmlFile, 'utf-8');
    let outStr = inHtml.replace(/{hash}/gi, new Date().getTime().toString(36));
    if (isMobile) {
      // const outStr = inHtml.replace(/{hash}/gi, new Date().getTime().toString(36)).replace('\<\!--META-ENV--\>', JSON.stringify(envWeb));
      // env is replaced here for the mobile app. And the env is replaced again for the web app at each startup

      const metaIndexStart = inHtml.indexOf(metaTextStart);
      const metaIndexEnd = inHtml.indexOf(metaTextEnd);

      const webConfig = await readWebConfig(outdirData);
      const webEnvData = webEnv.getWebEnv(appName);

      outStr =
        outStr.substring(0, metaIndexStart).replace('<!--META-THEME-->', defaultThemeName) +
        '<script id="web-env" type="application/json">' +
        JSON.stringify(webEnvData) +
        '</script>\r\n' +
        '<script id="web-setting" type="application/json">' +
        JSON.stringify(webConfig) +
        '</script>' +
        outStr.substring(metaIndexEnd + metaTextEnd.length);
      // outStr = webEnv.replaceWebEnv(inHtml, appName, true);
    }
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, outStr);
    await fileUpdateTime(outputFile, new Date(chgTime));
  }
};
