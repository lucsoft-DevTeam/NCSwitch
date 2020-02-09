import { EventEmitter } from 'events';

import { moduleList } from './modulelist';
import { BootUpTracker } from './modules/BootUpTracker';

const bootUp = new BootUpTracker();
class NCSEmittier extends EventEmitter { }

export var NCSEmit = new NCSEmittier();

const log = (message: string, moduleName: string = 'NCSwitch System', type: 'info' | 'warn' | 'error' = 'info') =>
{
    console.log(`${type == 'info' ? '✅' : type == 'warn' ? '🔥' : '🚨🚨🚨'}  [${moduleName}] ${message}`);
}
(() =>
{

    /**
     * Startup process wil be changes
     */

    console.clear();
    log('Checking for Updates...');
    moduleList.forEach(async x => await x.UpdateIfAvailable());

    log('PreInitiation...');
    moduleList.forEach(async x => await x.PreInitiation());

    log('Initiation...');
    moduleList.forEach(async x => await x.Initiation());

    log('Loading Modules...');
    moduleList.forEach(async x => await x.StartModule());

    log(`System Loaded (took ${bootUp.bootUpFinished()}ms)`);
})();
