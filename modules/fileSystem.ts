import { NCSModule, NCSModuleType } from '../modules';
import { exec } from 'child_process';

export class fileSystem extends NCSModule
{
    ModuleName = "lucsoft.fileSystem";
    ModuleType = NCSModuleType.OfflineModule;
    RequiesReboot = false;

    PreInitiation(): void
    {
        exec('usb-devices', console.log);
    }

    Initiation()
    {

    }

    UpdateIfAvailable(): Promise<boolean>
    {
        return new Promise((done) =>
        {
            done(false);
        })
    }


}