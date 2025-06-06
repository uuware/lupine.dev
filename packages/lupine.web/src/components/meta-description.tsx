// import { bindPageResetEvent } from '../core/page-reset-events';

let _description = { value: '', defaultValue: '' };
export const MetaDescription = ({ children }: { children: string }) => {
  _description.value = children;
  return <></>;
};

export const getMetaDescription = () => {
  return _description.value || _description.defaultValue;
};

export const setDefaultMetaDescription = (children: string) => {
  _description.defaultValue = children;
};

// bindPageResetEvent(() => {
//   _description.value = '';
// });
