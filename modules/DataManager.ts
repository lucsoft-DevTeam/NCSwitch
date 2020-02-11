import { NCSModule } from '../modules';
import { houseData, NCSModuleType } from '../types';

class ResponsePosiabilty
{
    login?: boolean;
    type?: "house";
    house?: houseData
}

export class DataManager extends NCSModule
{
    ModuleName = 'lucsoft.DataManager';
    ModuleType = NCSModuleType.OfflineModule;
    RequiesReboot = false;
    HouseData?: houseData = undefined;
    StartModule(): Promise<void>
    {
        return new Promise((done) =>
        {
            this.createListenerWide("socketstream",
                (response: ResponsePosiabilty) => this.handleResponseDate(response))
            done();
        })
    }

    private handleResponseDate(rsp: ResponsePosiabilty)
    {
        if (rsp.login == true)
            if (rsp.type == "house")
                this.handleLogin(rsp)
            else
                // Unhandleable Data after Login Request Recvied
                this.sendError("UDALRR")
        else
            // Unknown data Recived
            this.sendError("UDR")
    }

    private handleLogin(rsp: ResponsePosiabilty)
    {
        this.log(`Hi there, I'm the "${rsp.house?.houseName}" and get controlled by ${rsp.house?.ownerID}`);
        this.HouseData = rsp.house;
    }

    private sendError = (errorcode: string) => this.log(`ERR#DM_${errorcode}`, "error")
    UpdateIfAvailable(): Promise<boolean>
    {
        return new Promise((done) =>
        {
            done(false);
        });
    }

}