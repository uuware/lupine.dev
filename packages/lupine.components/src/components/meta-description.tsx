// import { bindPageResetEvent } from '../core/page-reset-events';

import { addMetaDataTags } from "lupine.web";

export const MetaDescription = ({ children }: { children: string }) => {
  addMetaDataTags('name:description', `<meta name="description" content="${children}">`);
  return <></>;
};

// bindPageResetEvent(() => {
//   _description.value = '';
// });
