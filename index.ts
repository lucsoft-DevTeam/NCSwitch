import { fileSystem } from './modules/fileSystem';

const moduleList = [
    new fileSystem()
];

const log = (message: string, moduleName: string = "NCSwitch System", type: "info" | "warn" | "error" = "info") =>
{
    console.log(`${type == "info" ? "✅" : type == "warn" ? "🔥" : "🚨🚨🚨"}  [${moduleName}] ${message}`);
}

log('Checking for Updates...');
moduleList.forEach(x => x.UpdateIfAvailable());
log('PreInitiation...');
moduleList.forEach(x => x.PreInitiation());
log('PreInitiation...');
moduleList.forEach(x => x.Initiation());
log('PreInitiation...');
moduleList.forEach(x => x.Loaded());
log('System Loaded');
