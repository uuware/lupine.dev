import { RenderPageFunctionsType } from '../api';
import { AppLoaderProps } from './app-loader-props';

export type InitStartProps = {
  bindIp: string;
  httpPort: number;
  httpsPort: number;
  sslKeyPath: string;
  sslCrtPath: string;
};

export type AppStartProps = {
  debug: boolean;
  apiConfig: AppLoaderProps;
  serverConfig: InitStartProps;
  renderPageFunctions: RenderPageFunctionsType;
};
