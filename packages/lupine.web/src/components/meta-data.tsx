// import { bindPageResetEvent } from '../core/page-reset-events';
import { addMetaDataTags } from '../core/bind-meta';
type NameMeta = { name: string; content: string };
type PropertyMeta = { property: string; content: string };
type HttpEquivMeta = { httpEquiv: string; content: string };
type AllMeta = NameMeta | PropertyMeta | HttpEquivMeta;

function isNameMeta(data: any): data is NameMeta {
  return !!(data.name && data.content);
}
function isPropertyMeta(data: any): data is PropertyMeta {
  return !!(data.property && data.content);
}
function isHttpEquivMeta(data: any): data is HttpEquivMeta {
  return !!(data.httpEquiv && data.content);
}

// should use description tag instead of meta tag ( <meta name="description" content="..."> )
export const MetaData = (data: AllMeta) => {
  if (isNameMeta(data)) {
    addMetaDataTags(`name:${data.name}`, `<meta name="${data.name}" content="${data.content}">`);
  } else if (isPropertyMeta(data)) {
    addMetaDataTags(`property:${data.property}`, `<meta property="${data.property}" content="${data.content}">`);
  } else if (isHttpEquivMeta(data)) {
    addMetaDataTags(`http-equiv:${data.httpEquiv}`, `<meta http-equiv="${data.httpEquiv}" content="${data.content}">`);
  } else if ((data as any).key && (data as any).string) {
    addMetaDataTags(`${(data as any).key}`, `${(data as any).string}`);
  } else {
    console.warn('Unknown meta data:', data);
  }
  return <></>;
};

// bindPageResetEvent(() => {
//   _metaData = {};
// });
