import { ApiModule } from 'lupine.api';
import { RootApi } from './service/root-api';

export const apiModule = new ApiModule(new RootApi());
