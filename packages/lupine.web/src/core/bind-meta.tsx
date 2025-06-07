// import { bindPageResetEvent } from '../core/page-reset-events';

let _pageTitle = { value: '', defaultValue: '' };
export const setPageTitle = (title: string) => {
  _pageTitle.value = title;
};

export const getPageTitle = () => {
  return _pageTitle.value || _pageTitle.defaultValue;
};

export const setDefaultPageTitle = (title: string) => {
  _pageTitle.defaultValue = title;
};

let _description = { value: '', defaultValue: '' };
export const setMetaDescription = (description: string) => {
  _description.value = description;
};

export const getMetaDescription = () => {
  return _description.value || _description.defaultValue;
};

export const setDefaultMetaDescription = (description: string) => {
  _description.defaultValue = description;
};

let _metaData: { [key: string]: string } = {};
export const addMetaDataTags = (key: string, value: string) => {
  if (typeof value === 'undefined') {
    delete _metaData[key];
  } else {
    _metaData[key] = value;
  }
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
