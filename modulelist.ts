
import { SystemControl } from './modules/SystemControl';
import { HmSYSConnect } from './modules/HmSYSConnect';
import { DataManager } from './modules/DataManager';

export const moduleList = [
    new SystemControl(),
    new HmSYSConnect(),
    new DataManager()
];
