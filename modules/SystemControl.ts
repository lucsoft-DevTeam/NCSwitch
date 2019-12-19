import { NCSModule, NCSModuleType } from '../modules';
import { spawn, exec, ChildProcessWithoutNullStreams } from 'child_process';

export interface SystemDevicesPartions
{
    label: string,
    devname?: string,
    mountedFolder?: string
}

export interface SystemDevicesUSB
{
    deviceID: string,
    deviceName?: string,
    deviceFallbackName: string,
    deviceModel?: string,
    devicePartions?: SystemDevicesPartions[]
}

export class SystemControl extends NCSModule
{
    ModuleName = "lucsoft.SystemControl";
    ModuleType = NCSModuleType.OfflineModule;
    RequiesReboot = false;
    private udev?: ChildProcessWithoutNullStreams;
    private devices: SystemDevicesUSB[] = [];
    StartModule(): Promise<void>
    {
        return new Promise((done) =>
        {
            setInterval(() =>
            {
                if (this.devices.length >= 1)
                {
                    this.log(JSON.stringify(this.devices));
                }

            }, 1000);
            this.udev = spawn('udevadm', [ 'monitor', '-p' ])
            var buffer = "";
            this.udev.stdout.on('data', (data: Buffer) =>
            {
                var stringData = data.toString();
                stringData.split('\n').forEach((e) =>
                {
                    if (e.startsWith('UDEV') || e.startsWith('KERNEL'))
                    {
                        this.parseUdev(buffer);
                        buffer = e;
                    } else
                    {
                        buffer += e + "\n";
                    }
                })
            })
            done();
            // this.updateService(() => done());
            // setInterval(() => this.updateService(), 2000);
        })
    }

    private addDevice(device: any)
    {
        if (this.devices.find((deviceQuery) => deviceQuery.deviceID == `${device.idvendor}#${device.idvendorid}`) === undefined)
        {
            this.devices.push({
                deviceID: `${device.idvendor}#${device.idvendorid}`,
                deviceFallbackName: device.idvendorfromdatabase || device.idvendor,
                deviceModel: device.idmodel,
                devicePartions: []
            })
        }
    }

    private removeDevice(device: any)
    {
        this.devices = this.devices.filter(x => x.deviceID != `${device.idvendor}#${device.idvendorid}`);
    }

    private parseUdev(data: string, showKernel = false): void
    {
        const columns = data.split('\n');
        const cleanedUp = columns.filter(rows => rows != '');
        const header = cleanedUp[ 0 ];
        const args = cleanedUp.filter((_, index) => index != 0);

        const isKernel = header.startsWith('KERNEL');
        if (isKernel && !showKernel)
            return;
        if (args.length == 0)
            return;
        if (args[ 0 ].includes(' - '))
            return;
        let device: any = {};
        device[ 'eventtype' ] = isKernel ? 'kernel' : 'udev';
        args.forEach((attribut) => device[ attribut.split('=')[ 0 ].toLowerCase().split('_').join('') ] = attribut.split('=')[ 1 ]);

        if (device.subsystem == "leds" || device.subsystem == "scsi")
            return;

        if (device.action == undefined && device.eventtype == "udev" && device.idvendor)
        {
            this.log(`${device.idvendorfromdatabase} was ${device.driver ? 'added' : 'removed'} its a ${device.devtype} on ${device.devname} ${device.idvendor}#${device.idvendorid}`, "warn");
            if (device.driver)
                this.addDevice(device);
            else
                this.removeDevice(device);

        } else if (device.idmodel != undefined)
        {
            var id = `${device.idvendor}#${device.idvendorid}`;
            var added = true;
            if (device.devtype == "partition")
                added = false;

            if (device.devtype == "disk")
                added = false;

            if (device.devtype == "usb_device" && device.driver != undefined)
                added = false;


            if ((device.action || (added ? "add" : "remove")) == "add")
            {
                if (device.devtype == "usb_device")
                {
                    this.addDevice(device);

                } else if (device.devtype == "partition")
                {
                    if (device.idfstype == "exfat" && device.action == "add")
                    {
                        this.mountFileSystem(id, device.devname);
                        let cachedDevice = this.devices.find(x => x.deviceID == id);
                        if (cachedDevice && cachedDevice.deviceName == undefined)
                            cachedDevice.deviceName = device.idfslabel || device.idvendorfromdatabase;

                        this.devices.find(x => x.deviceID == id)?.devicePartions?.push({
                            label: device.idfslabel || device.idvendorfromdatabase,
                            devname: device.devname,
                            mountedFolder: `/mnt/${id}-${device.devname.split('/')[ 2 ]}`
                        })
                        this.log(`New Storage: ${device.idfslabel || device.idvendorfromdatabase} mounted on /mnt/${id}-${device.devname.split('/')[ 2 ]}`);
                    } else
                    {
                        this.log(`${device.idfstype} is unsupported`);
                    }
                }
            } else if ((device.action || (added ? "add" : "remove")) == "remove")
            {
                this.removeDevice(device);
            }
        }
    }

    private mountFileSystem(id: string, devname: string)
    {
        exec(`mkdir /mnt/${id}-${devname.split('/')[ 2 ]}`);
        exec(`mount ${devname} /mnt/${id}-${devname.split('/')[ 2 ]}`, (err) =>
        {
            if (err != null)
            {
                this.log(err.message);
                this.log(err.stack);
            }
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