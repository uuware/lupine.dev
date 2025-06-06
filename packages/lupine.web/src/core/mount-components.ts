import { bindAttributes } from './bind-attributes';
import { bindLinks } from './bind-links';
import { VNode } from '../jsx';
import { Logger } from '../lib/logger';
import { uniqueIdGenerator } from '../lib/unique-id';
import { processStyle } from './bind-styles';
// import { bindPageResetEvent } from './page-reset-events';
import { replaceInnerhtml } from './replace-innerhtml';
import { camelToHyphens } from './camel-to-hyphens';

const logger = new Logger('mount-components');
export const domUniqueId = uniqueIdGenerator('l'); // l means label
// bindPageResetEvent(() => {
//   // reset unique id
//   domUniqueId(true);
// });

function renderChildren(html: string[], children: any) {
  if (typeof children === 'string') {
    html.push(children);
  } else if (children === false || children === null || typeof children === 'undefined') {
    // add nothing
  } else if (typeof children === 'number' || typeof children === 'boolean') {
    // true will be added
    html.push(children.toString());
  } else if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const item = children[i];
      renderChildren(html, item);
    }
  } else if (children.type && children.props) {
    renderComponent(children.type, children.props);
    html.push(...children.props._html);
    children.props._html.length = 0;
  } else {
    logger.warn('Unexpected', children);
  }
}

const selfClosingTags = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

const genUniqueId = (props: any) => {
  if (!props._id) {
    props._id = domUniqueId();
  }
  return props._id;
};
// data-refid will be assigned with a ref.id
function renderAttribute(type: any, props: any, jsxNodes: any) {
  const html = [];
  // data-refid is used for nested components like this:
  //    <div class='class-name' ref={ref} ...>...
  //      <div data-refid={ref}>
  // then data-refid can be located:
  //   ref.$(`.class-name[data-refid=${ref.id}]`)
  if (props['data-refid'] && props['data-refid'].id) {
    props['data-refid'] = props['data-refid'].id;
  }
  for (let i in props) {
    if (i === 'ref') {
      if (props[i]) {
        props[i].id = genUniqueId(props);
        html.push('data-ref');
      }
    } else if (!['children', 'key', '_result', '_html', '_id'].includes(i)) {
      //, "_lb"
      // , "value", "checked"
      // style is a  string, in-line style
      if (i === 'style') {
        if (typeof props[i] === 'object') {
          let attrs = `${i}="`;
          for (let j in props[i]) {
            attrs += `${camelToHyphens(j)}:${props[i][j]};`;
          }
          attrs += `"`;
          html.push(attrs);
        } else {
          html.push(`${i}="${props[i]}"`);
        }
      } else if (i === 'css') {
        // css is a <style> tag, and is the first element in html
        genUniqueId(props);
        // props._lb = props._id;
      } else if (i[0] === 'o' && i[1] === 'n') {
        genUniqueId(props);
      } else if (i === 'defaultChecked') {
        if (props[i] === true || props[i] === 'checked') {
          html.push(`checked="true"`);
        }
      } else if (i === 'readonly' || i === 'disabled' || i === 'selected' || i === 'checked') {
        if (props[i] !== undefined && props[i] !== false && props[i] !== 'false') {
          html.push(`${i}="${props[i]}"`);
        }
      } else if (i === 'class' || i === 'className') {
        const className = props[i]
          .split(' ')
          .filter((item: string) => item && item !== '')
          .join(' ');
        html.push(`class="${className}"`);
      } else if (i !== 'dangerouslySetInnerHTML') {
        html.push(`${i}="${props[i]}"`);
      }
    }
  }
  if (props._id) {
    // tag id will be after all attributes
    html.push(props._id);
  }
  return html.join(' ');
}

// assign the same label to all children
// function assignLabels(label: string, children: any) {
//     if (Array.isArray(children)) {
//         for (let i = 0; i < children.length; i++) {
//             const item = children[i];
//             if (Array.isArray(item) || (item && item.type && item.props)) {
//                 assignLabels(label, item);
//             }
//         }
//     } else if (children.type && children.props) {
//         if (typeof children.type === 'string') {
//             children.props._lb = label;
//         }
//     }
// }

// The result has only one element
const renderComponent = (type: any, props: any) => {
  //   logger.log("==================renderComponent", type);
  if (Array.isArray(props)) {
    const jsxNodes = { type: 'Fragment', props: { children: props } } as any;
    return renderComponent(jsxNodes.type, jsxNodes.props);
  }

  props._html = [];
  if (typeof type === 'function') {
    props._result = type.call(null, props);
    if (props._result === null || props._result === undefined || props._result === false) {
      // placeholder for sub components
      props._result = { type: 'Fragment', props };
    }
    if (props._fragment_ref && props._result && props._result.props) {
      // pass the ref to the sub Fragment tag
      props._result.props.ref = props._fragment_ref;
      props._result.props._id = genUniqueId(props._result.props);
    }
    // logger.log('==========props._result', props._result);
    if (typeof props._result.type === 'function') {
      renderComponent(props._result.type, props._result.props);
      if (props._result.props._html) {
        props._html.push(...props._result.props._html);
        props._result.props._html.length = 0;
      }
      // function component doesn't have any attributes
      return;
    }
  }
  const newType = (props._result && props._result.type) || type;
  const newProps = (props._result && props._result.props) || props;
  if (newType === 'div' && newProps.class === 'answer-box') {
    console.log('renderComponent', newType, newProps);
  }
  if (typeof newType === 'string') {
    const attrs = renderAttribute(newType, newProps, { type, props });
    if (selfClosingTags.includes(newType.toLowerCase())) {
      props._html.push(`<${newType}${attrs ? ' ' : ''}${attrs} />`);
      if (newProps['css']) {
        console.warn(`ClosingTag [${newType}] doesn't support 'css', please use 'style' instead.`);
      }
    } else {
      props._html.push(`<${newType}${attrs ? ' ' : ''}${attrs}>`);

      if (newProps['css']) {
        const cssText = processStyle(`[${newProps._id}]`, newProps['css']).join('');
        props._html.push(`<style id="sty-${newProps._id}">${cssText}</style>`); // sty means style, and updateStyles has the same name
      }

      if (newProps.children) {
        // if (newProps._lb) {
        //     assignLabels(newProps._lb, newProps.children);
        // }

        renderChildren(props._html, newProps.children);
      } else if (newProps['dangerouslySetInnerHTML']) {
        props._html.push(newProps['dangerouslySetInnerHTML']);
      } else {
        // single element
      }

      props._html.push(`</${newType}>`);
    }
  } else if (newType.name === 'Fragment') {
    renderChildren(props._html, newProps.children);
  } else {
    logger.warn('Unknown type: ', type, props, newType, newProps);
  }
};

export const mountComponents = async (selector: string | null | Element, jsxNodes: VNode<any>) => {
  renderComponent(jsxNodes.type, jsxNodes.props);
  const el = selector && (typeof selector === 'string' ? document.querySelector(selector) : selector);
  if (el) {
    // the parent node shouldn't have any styles
    // el.replaceChildren(...);
    // // keep <style id="sty-${newProps._id}">...</style>
    // const firstDom = el.firstChild as Element;
    // if (firstDom && firstDom.tagName === 'STYLE') {
    //   firstDom.parentNode?.removeChild(firstDom);
    // }

    // call unload before releace innerHTML
    // el.innerHTML = jsxNodes.props._html.join('');
    await replaceInnerhtml(el, jsxNodes.props._html.join(''));

    // if (firstDom && firstDom.tagName === 'STYLE') {
    //   el.insertBefore(firstDom, el.firstChild);
    // }
    bindAttributes(el, jsxNodes.type, jsxNodes.props);
    bindLinks(el);
  }
};

// suggest to use HtmlVar.
export const mountSelfComponents = async (selector: string | null | Element, jsxNodes: VNode<any>) => {
  renderComponent(jsxNodes.type, jsxNodes.props);
  let el = selector && (typeof selector === 'string' ? document.querySelector(selector) : selector);
  if (el) {
    const parentNode = el.parentElement;
    // Can't do outerHTML directly because it will lose attributes
    const template = document.createElement('template');
    // template.innerHTML = jsxNodes.props._html.join("");
    // call unload before releace innerHTML
    await replaceInnerhtml(template, jsxNodes.props._html.join(''));

    // renderComponent should only have one element
    template.content.children.length > 1 &&
      console.error('renderComponent should only have one element: ', template.content.children.length);
    el.replaceWith(template.content.firstChild as Element);
    el = parentNode as Element;
    bindAttributes(el, jsxNodes.type, jsxNodes.props);
    bindLinks(el);
  }
};
