
import { SystemControl } from './modules/SystemControl';

const moduleList = [
    new SystemControl()
];

const log = (message: string, moduleName: string = "NCSwitch System", type: "info" | "warn" | "error" = "info") =>
{
    console.log(`${type == "info" ? "✅" : type == "warn" ? "🔥" : "🚨🚨🚨"}  [${moduleName}] ${message}`);
}
(() =>
{
    console.clear();
    log('Checking for Updates...');
    moduleList.forEach(async x => await x.UpdateIfAvailable());

    log('PreInitiation...');
    moduleList.forEach(async x => await x.PreInitiation());

    log('Initiation...');
    moduleList.forEach(async x => await x.Initiation());

    log('Loading Modules...');
    moduleList.forEach(async x => await x.StartModule());

    log('System Loaded');
})();
