// This file is defined as CommonJS module, because it's used in dev as well
const fs = require('fs/promises');
const path = require('path');

exports.readFile = async (filePath) => {
  try {
    const text = await fs.readFile(filePath, 'utf-8');
    return text;
  } catch {
    return undefined;
  }
};

exports.parseEnv = async (envFile) => {
  let obj = {};
  const text = await exports.readFile(envFile);
  if (!text) {
    return obj;
  }

  let lines = text.replace(/\r\n?/gm, '\n').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].split(/=(.*)/s);
    const key = line[0].trim();

    if (key && !key.startsWith('#')) {
      if (key.endsWith('+')) {
        // if the line is like [key+=...] then it will be added to the same key
        obj[key.substring(0, key.length - 1)] += line[1] || '';
      } else if (key.endsWith('*')) {
        // if the line is like [key*=LINE_MARKER] then it's a multiline string, ending with "LINE_MARKER"
        const LINE_MARKER = line[1].trim();
        line[1] = '';
        for (i++; i < lines.length; i++) {
          if (lines[i].trim() === LINE_MARKER) {
            break;
          }
          line[1] += lines[i] + '\n';
        }
        obj[key.substring(0, key.length - 1)] = line[1];
      } else {
        obj[key] = line[1] || ''; // .replace(/\\n/g, '\n').replace(/\\r/g, '\r')
      }
    } else if (key.startsWith('#!import ')) {
      // use "#!import file_name" to import another env file
      const file = key.substring(9).trim();
      const newObj = await exports.parseEnv(path.join(path.dirname(envFile), file));
      obj = Object.assign(obj, newObj);
    }
  }

  return obj;
};

exports.copyToProcessEnv = (envObject, overrideEnv) => {
  for (const key of Object.keys(envObject)) {
    if (overrideEnv || typeof process.env[key] === 'undefined') {
      process.env[key] = envObject[key];
    }
  }
};

exports.loadEnv = async (envFile, overrideEnv = false) => {
  console.log(`Load env from: ${envFile}`);
  const envObject = await exports.parseEnv(envFile);
  exports.copyToProcessEnv(envObject, overrideEnv);
};

exports.getWebEnv = (appName) => {
  const envWeb = {};
  for (const envName in process.env) {
    if (envName.startsWith(`WEB.`)) {
      envWeb[envName.substring(4)] = process.env[envName];
    } else if (envName.startsWith(`${appName}.WEB.`)) {
      envWeb[envName.substring(appName.length + 5)] = process.env[envName];
    }
  }
  return envWeb;
};

// defined app-shared-storage-props.ts
const AppSharedStorageWebPrefix = 'WEB.';
exports.getWebConfig = (allConfig) => {
  const result = {};
  for (let key in allConfig) {
    if (key.startsWith(AppSharedStorageWebPrefix)) {
      result[key.substring(AppSharedStorageWebPrefix.length)] = allConfig[key];
    }
  }
  return result;
};

// // Replace <!--META-ENV-START-->...<!--META-ENV-END--> for mobile app and replace it again for web app
// exports.replaceWebEnv = (html, appName, addMetaTag) => {
//   const envWeb = exports.getWebEnv(appName);
//   return html.replace(
//     /\<\!--META-ENV-START--\>(.*?)\<\!--META-ENV-END--\>/gm,
//     addMetaTag
//       ? '<!--META-ENV-START--><script id="web-env" type="application/json">' +
//           JSON.stringify(envWeb) +
//           '</script><!--META-ENV-END-->'
//       : '<script id="web-env" type="application/json">' + JSON.stringify(envWeb) + '</script>'
//   );
// };
