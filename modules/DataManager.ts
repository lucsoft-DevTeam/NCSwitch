import { NCSModule } from '../modules';
import { NCSModuleType } from '../types';

export class DataManager extends NCSModule
{
    ModuleName = 'lucsoft.DataManager';
    ModuleType = NCSModuleType.OfflineModule;
    RequiesReboot = false;

    StartModule(): Promise<void>
    {
        return new Promise((done) =>
        {
            this.createListenerWide("socketstream", (response: object) =>
            {
                this.log(JSON.stringify(response), "debug");
            })
            done();
        })
    }

    UpdateIfAvailable(): Promise<boolean>
    {
        return new Promise((done) =>
        {
            done(false);
        });
    }

}