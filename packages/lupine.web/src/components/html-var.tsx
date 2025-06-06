import { mountComponents } from '../core/mount-components';
import { RefProps, VNode } from '../jsx';

export const HtmlVar = (initial?: string | VNode<any>) => {
  let _value: string | VNode<any> = initial || '';
  let _dirty = false;
  const waitUpdate = async (value: string | VNode<any>) => {
    if (!ref.current) return;
    if (typeof value === 'object' && value.type && value.props) {
      await mountComponents(ref.current, value);
    } else {
      ref.current.innerHTML = value;
    }
    _dirty = false;
  }
  const ref: RefProps = { onLoad: async (el: Element) => {
    _dirty && waitUpdate(_value);
  } };
  const FragmentRef = (props: any) => {
    return <>{props.children}</>;
  };

  return {
    set value(value: string | VNode<any>) {
      _value = value;
      _dirty = true;
      waitUpdate(value);
    },
    get value() {
      return ref.current ? ref.current.innerHTML : _value;
    },
    get ref() {
      return ref;
    },
    // _fragment_ref is a special id to add ref to a fragment and it is processed in mount-components
    get node() {
      _dirty = false;
      return <FragmentRef _fragment_ref={ref}>{_value}</FragmentRef>;
    },
  };
};
