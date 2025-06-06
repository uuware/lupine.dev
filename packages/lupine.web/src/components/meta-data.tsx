// import { bindPageResetEvent } from '../core/page-reset-events';
import { getMetaDescription } from './meta-description';

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

let _metaData: { [key: string]: string } = {};
// Shouldn't include <meta name="description" content="...">
export const MetaData = (data: AllMeta) => {
  if (isNameMeta(data)) {
    _metaData[`name:${data.name}`] = `<meta name="${data.name}" content="${data.content}">`;
  } else if (isPropertyMeta(data)) {
    _metaData[`property:${data.property}`] = `<meta property="${data.property}" content="${data.content}">`;
  } else if (isHttpEquivMeta(data)) {
    _metaData[`http-equiv:${data.httpEquiv}`] = `<meta http-equiv="${data.httpEquiv}" content="${data.content}">`;
  } else if ((data as any).key && (data as any).string) {
    _metaData[`${(data as any).key}`] = `${(data as any).string}`;
  } else {
    console.warn('Unknown meta data:', data);
  }
  return <></>;
};

export const getMetaDataTags = () => {
  return Object.values(getMetaDataObject()).join('\n');
};

export const getMetaDataObject = () => {
  const metaDescription = getMetaDescription();
  return metaDescription
    ? Object.assign(
        {
          'name:description': `<meta name="description" content="${metaDescription}">`,
        },
        _metaData
      )
    : _metaData;
};

// bindPageResetEvent(() => {
//   _metaData = {};
// });
