// const request = require('request');
import { Logger } from '../lib';
import { HostToPathProps } from '../models';

const logger = new Logger('HostToPath');
export class HostToPath {
  static props: HostToPathProps[] = [];

  // this should be initialized before any request
  static setHostToPathList(props: HostToPathProps[]) {
    this.props = props;
  }

  static findHostPath(host: string): HostToPathProps | undefined {
    for (let key in this.props) {
      if (this.props[key].realPath && this.props[key].hosts.includes(host)) {
        logger.debug(`Found ${host} in `, this.props[key].hosts);
        return this.props[key];
      }
    }
    for (let key in this.props) {
      for (let domain in this.props[key].hosts) {
        // if host is 'sub3.sub2.sub1.domain', it matches 'sub2.domain'
        if (this.props[key].realPath && host.endsWith(this.props[key].hosts[domain])) {
          logger.debug(`Found ${host} in `, this.props[key].hosts);
          return this.props[key];
        }
      }
    }
    for (let key in this.props) {
      if (this.props[key].realPath && this.props[key].hosts.length === 0) {
        logger.debug(`Not found ${host} from any domains and use default app: ${this.props[key].appName}`);
        return this.props[key];
      }
    }
    return;
  }
}
