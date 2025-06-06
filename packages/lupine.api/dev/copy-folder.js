const fs = require('fs/promises');
const path = require('path');
const esbuild = require('esbuild');

exports.copyFolder = async (copyCache, src, dest, isDev) => {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    (await fs.readdir(src)).forEach(async (childItemName) => {
      await exports.copyFolder(copyCache, path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (stat.isFile()) {
    const statDest = copyCache.get(src);
    if (!statDest || stat.size !== statDest.size || stat.mtime.getTime() !== statDest.mtime.getTime()) {
      try {
        if (isDev && src.endsWith('.css')) {
          const css = await fs.readFile(src, 'utf-8');
          const newCss = (await esbuild.transform(css, { loader: 'css', minify: true })).code;
          await fs.writeFile(dest, newCss, 'utf-8');
        } else {
          await fs.copyFile(src, dest);
        }
        copyCache.set(src, stat);
        // utimes is not accurate
        // await fs.utimes(dest, stat.atime, stat.mtime);
        console.log(`copy from [${src}] to  [${dest}]`);
      } catch (err) {
        console.log(`error when copy from ${src} to ${dest}`, err);
      }
    }
  }
};
