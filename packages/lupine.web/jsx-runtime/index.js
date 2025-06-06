/**
 * JSX.Element factory used by Typescript's JSX transform
 * @param type
 * @param props
 */
function jsx(type, props) {
  return { type, props };
}

function Fragment(props) {
  return { type: 'Fragment', props };
}

export { jsx as jsx, jsx as jsxs, jsx as jsxDEV, Fragment };
