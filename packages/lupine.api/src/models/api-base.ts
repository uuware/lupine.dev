import { IApiRouter } from './api-router-props';

export interface IApiBase {
  getRouter(): IApiRouter;
}
