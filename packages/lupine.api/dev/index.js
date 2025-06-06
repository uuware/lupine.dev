const { copyFolder } = require('./copy-folder.js');
const { cpIndexHtml } = require('./cp-index-html.js');
const fileUtils = require('./file-utils.js');
const webEnv = require('../src/common-js/web-env.js');
const { runCmd } = require('./run-cmd.js');
const { sendRequest } = require('./send-request.js');
module.exports = {
  copyFolder,
  cpIndexHtml,
  runCmd,
  sendRequest,
  readJson: fileUtils.readJson,
  pathExists: fileUtils.pathExists,
  parseEnv: webEnv.parseEnv,
  loadEnv: webEnv.loadEnv,
  getWebConfig: webEnv.getWebConfig,
  pluginIfelse: require('./plugin-ifelse.js'),
};
