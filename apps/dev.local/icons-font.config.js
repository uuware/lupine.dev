/*
Define icons for generating fonts

Suggestions:
1, use WOFF2 for major browsers except IE;
Or: 2, use WOFF for major browsers and IE 9~, Edge 12~
  All 1, 2 need this code in HTML: `<i class="ifc-icon icon_name"></i>`
*/

var path = require('path');
var cssTemplate = `
/*font-face*/
.ifc-box {
  display: inline-flex;
  position: relative;
  border-radius: 3px;
  text-align: center;
  vertical-align: middle;
  border: solid 1px #00f;
  width: 40px;
  height: 40px;
  font-size: 20px;
  color: blue;
  margin: 5px;
}

.ifc-icon {
  font-size: inherit;
  display: inline-block;
  font-family: '#font-family#';
  font-style: normal;
  font-weight: 400;
  font-variant: normal;
  text-transform: none;
  text-rendering: auto;
  line-height: 1em;
  vertical-align: middle;
  text-align: center;
  text-decoration: inherit;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  margin: auto;
}

/* Animation for spinners */
.ifc-spin {
  animation: ifc-spin-f 2s infinite linear;
  display: inline-block;
}
/* @keyframes for IE10~ and major browsers */
@keyframes ifc-spin-f {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
}

/*icons-css*/
`;

var htmlTemplate = `
<!DOCTYPE html><html><head>
	<title>icons-font-customization sample</title>
	<link rel="stylesheet" type="text/css" href="style.css">
</head><body><div class="sample">
#icons-html#</div></body></html>
`;

module.exports = {
  fontName: 'i-font',
  outputPath: path.join(__dirname, 'web/assets/icons-font/'),
  outputName: 'i-font', // automatically add font extension to it
  startChar: 10000, // unicode start number
  svgicons2svgfont: {
    fontHeight: 1024,
  },
  icons: [
    // copy svg from icons-font-customization locally or remotely
    {
      path: 'material-design/svg/theme-light-dark.svg',
      name: 'ma-theme-light-dark',
    },
    { path: 'font-awesome/brands/apple.svg', name: 'fa-apple' },
    { path: 'font-awesome/brands/android.svg', name: 'fa-android' },
    { path: 'carbon-icons/svg/app-services.svg', name: 'cb-app-services' },
    { path: 'unicons/line/16-plus.svg', name: 'un-16-plus' },
    { path: 'ant-design-icons/outlined/drag.svg', name: 'at-drag' },
    // or add local svg files
    // { path: '../src/asset/icons/pin.svg', name: 'my-pin', iconsRoot: __dirname },
  ],
  fontType: {
    woff2: true,
    woff: false,
    ttf: false,
    eot: false,
    svg: false,
  },
  cssTemplate: cssTemplate,
  htmlTemplate: htmlTemplate,
};

// Or pass parameters
var parameters = { '--config': path.join(__dirname, 'icons-font.config.js') };
var cmd = require('icons-font-command');
cmd.IconsFontLite.generateFont(parameters);
