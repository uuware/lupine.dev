// import { bindPageResetEvent } from '../core/page-reset-events';

let _title = { value: '', defaultValue: '' };
export const MetaTitle = ({ children }: { children: string }) => {
  _title.value = children;
  return <></>;
};

export const getMetaTitle = () => {
  return _title.value || _title.defaultValue;
};

export const setDefaultMetaTitle = (children: string) => {
  _title.defaultValue = children;
};

// bindPageResetEvent(() => {
//   _title.value = '';
// });
