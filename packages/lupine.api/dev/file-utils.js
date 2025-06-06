const fs = require('fs/promises');

exports.readJson = async (filename) => {
  return JSON.parse((await fs.readFile(filename)).toString());
};

exports.pathExists = async (path) => {
  return await fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};
