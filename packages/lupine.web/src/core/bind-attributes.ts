import { bindRef } from './bind-ref';

export const bindAttributesChildren = (topEl: Element, children: any) => {
  for (let i = 0; i < children.length; i++) {
    const item = children[i];
    if (item && item.type && item.props) {
      bindAttributes(topEl, item.type, item.props);
    } else if (item && Array.isArray(item)) {
      bindAttributesChildren(topEl, item);
    } else if (
      typeof item !== 'undefined' &&
      item !== null &&
      typeof item !== 'string' &&
      typeof item !== 'number' &&
      typeof item !== 'boolean'
    ) {
      console.warn(`Unexpected children:`, item);
    }
  }
};

export const bindAttributes = (topEl: Element, type: any, props: any) => {
  const newProps = (props._result && props._result.props) || props;
  if (newProps._id) {
    const el = topEl.querySelector(`[${newProps._id}]`);
    if (el) {
      for (let i in newProps) {
        if (i === 'ref') {
          bindRef(type, newProps, el);
          // } else if (i === "css") {
          //     mountStyles(`[${newProps._id}]`, `[${newProps._id}]`, newProps[i]);
        } else if (i[0] === 'o' && i[1] === 'n') {
          let name = i;
          if (name.toLowerCase() in el) name = name.toLowerCase().slice(2);
          else name = name.slice(2);
          // console.log('===bind event', name, el);
          el.addEventListener(name, newProps[i]);
        }
      }
    }
  }

  if (newProps.children && Array.isArray(newProps.children)) {
    bindAttributesChildren(topEl, newProps.children);
  } else if (newProps._result && newProps._result.type !== 'Fragment' && newProps._result.props) {
    bindAttributes(topEl, newProps._result.type, newProps._result.props);
  } else if (newProps.children && newProps.children.type && newProps.children.props) {
    bindAttributes(topEl, newProps.children.type, newProps.children.props);
  } else if (
    !newProps.children ||
    typeof newProps.children === 'string' ||
    typeof newProps.children === 'number' ||
    typeof newProps.children === 'boolean'
  ) {
  } else {
    console.warn(`Unexpected children:`, newProps.children, type, props);
  }
};
