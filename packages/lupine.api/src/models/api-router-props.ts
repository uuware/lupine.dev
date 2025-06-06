import { ServerResponse } from 'http';
import { ServerRequest } from './locals-props';

export type ApiRouterCallback = (req: ServerRequest, res: ServerResponse, rootUrl?: string) => Promise<boolean>;

export enum ApiRouterMethod {
  ALL = 'ALL',
  GET = 'GET',
  POST = 'POST',
}
export type ApiRouterData = {
  path: string;
  handler: (ApiRouterCallback | IApiRouter)[];
  method: ApiRouterMethod;
  parameterVariables: string[];
  parameterLength: number;
};

export interface IApiRouter {
  get(path: string, ...handler: (ApiRouterCallback | IApiRouter)[]): void;
  post(path: string, ...handler: (ApiRouterCallback | IApiRouter)[]): void;
  use(path: string, ...handler: (ApiRouterCallback | IApiRouter)[]): void;
  setFilter(filter: ApiRouterCallback): void;
  findRoute(url: string, req: ServerRequest, res: ServerResponse, handleNotFound: boolean): Promise<boolean>;
  handleRequest(url: string, req: ServerRequest, res: ServerResponse): Promise<boolean>;
}
