import { LocalsProps } from './locals-props';
import { HostToPathProps } from './host-to-path-props';

// language code: https://www.andiamo.co.uk/resources/iso-language-codes/
// English: en, Chinese (PRC): zh-cn, Chinese (Hong Kong): zh-hk, Chinese (Taiwan): zh-tw, Japanese: ja, Korean: ko
export type AsyncStorageProps = {
  uuid: string;
  appName: string;
  hostPath: HostToPathProps;
  locals: LocalsProps;
  lang: string;
  [key: string]: any;
};
