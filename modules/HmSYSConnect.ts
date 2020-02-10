import WebSocket from 'ws';

import { NCSModule } from '../modules';
import { NCSModuleType } from '../types';

export class HmSYSConnect extends NCSModule
{
    ModuleName = 'lucsoft.HmSYSConnect';
    ModuleType = NCSModuleType.OfflineModule;
    RequiesReboot = false;
    private ws?: WebSocket;
    StartModule(): Promise<void>
    {
        return new Promise((done) =>
        {
            this.ws = new WebSocket(`wss://eu01.hmsys.de`)
            this.ws?.on('message', (data: WebSocket.Data) =>
            {
                try
                {
                    const response = JSON.parse(data.toString());
                    if (response.login == "require authentication")
                        this.ws?.send(JSON.stringify({
                            "action": "login",
                            "type": "house",
                            id: this.config.auth.id,
                            token: this.config.auth.token
                        }));
                    else
                        this.sendListener("socketstream", response);
                } catch (e)
                {
                    const error = e as SyntaxError;
                    this.log(error.stack, 'error')
                }

            });
            done();
        });
    }

    UpdateIfAvailable(): Promise<boolean>
    {
        return new Promise((done) =>
        {
            done(false);
        })
    }

}