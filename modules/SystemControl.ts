import { NCSModule, NCSModuleType } from '../modules';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

export class SystemControl extends NCSModule
{
    ModuleName = "lucsoft.SystemControl";
    ModuleType = NCSModuleType.OfflineModule;
    RequiesReboot = false;
    // private lastDevicelist: any[] = [];
    private udev?: ChildProcessWithoutNullStreams;
    StartModule(): Promise<void>
    {
        return new Promise((done) =>
        {
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
        // if (argsObject.devtype != "disk")

        if (device.subsystem == "leds" || device.subsystem == "scsi")
            return;

        if (device.action == undefined && device.eventtype == "udev" && device.idvendor)
        {
            // if (device.idmodel == undefined)

            this.log(`${device.idvendorfromdatabase} was ${device.driver ? 'added' : 'removed'} its a ${device.devtype} on ${device.devname}`, "warn");

            // console.log(device);
        } else if (device.idmodel != undefined)
        {
            var added = true;
            if (device.devtype == "partition")
                added = false;

            if (device.devtype == "disk")
                added = false;

            if (device.devtype == "usb_device" && device.driver != undefined)
            {
                // console.log(device);
                added = false;

            }

            this.log(`${device.idfslabel || device.idvendorfromdatabase} was ${device.action || (added ? "add" : "remove")} its a ${device.devtype} on ${device.devname} (${device.subsystem})`)
            console.log(device.devtype);
            if (device.action == undefined && device.devtype == undefined)
                console.log(device);

        }
        // console.log(argsObject);
    }

    // private updateService(complete?: () => void)
    // {
    //     exec('cat /sys/kernel/debug/usb/devices', (err, output) =>
    //     {
    //         var format = output.split('\n\n')
    //             .map(block =>
    //                 block.split('\n')
    //                     .map(item =>
    //                         item.split(' ')));

    //         const devicelist = format.map((device, index) =>
    //         {
    //             const serviceData = device.filter((datablock) => datablock[ 0 ] == "S:").map(x => x.filter(y => y != "" && y != "S:").join(' ').split('='));
    //             const tableData = device.filter((datablock) => datablock[ 0 ] == "T:").map(x => x.filter(y => y != "" && y != "T:"));
    //             return {
    //                 raw: device,
    //                 bus: tableData[ 0 ].find(x => x.startsWith('Bus'))?.split('=')[ 1 ],
    //                 lev: tableData[ 0 ].find(x => x.startsWith('Lev'))?.split('=')[ 1 ],
    //                 serviceData: serviceData,
    //                 manufacturer: serviceData.find(x => x[ 0 ] == "Manufacturer")?.[ 1 ],
    //                 product: serviceData.find(x => x[ 0 ] == "Product")?.[ 1 ],
    //                 serialNumber: serviceData.find(x => x[ 0 ] == "SerialNumber")?.[ 1 ],
    //                 type: device.filter((datablock) => datablock[ 0 ] == "I:*")?.find(data => data.find(item => item.startsWith('Driver')))?.find(x => x.startsWith('Driver'))?.split('=')[ 1 ]
    //             };
    //         })
    //         if (devicelist.length != this.lastDevicelist.length)
    //         {
    //             var deviceAdded = devicelist.filter(item1 =>
    //                 !this.lastDevicelist.some(item2 => (
    //                     item2.serialNumber === item1.serialNumber
    //                     && item2.product === item1.product
    //                     && item2.manufacturer === item1.manufacturer
    //                     && item2.lev == item1.lev
    //                     && item2.bus == item1.bus
    //                 )))

    //             var deviceRemoved = this.lastDevicelist.filter(item1 =>
    //                 !devicelist.some(item2 => (
    //                     item2.serialNumber === item1.serialNumber
    //                     && item2.product === item1.product
    //                     && item2.manufacturer === item1.manufacturer
    //                     && item2.lev == item1.lev
    //                     && item2.bus == item1.bus
    //                 )))


    //             if (deviceAdded.length >= 1)
    //             {
    //                 deviceAdded.forEach((device) =>
    //                 {
    //                     if (device.type == "hub")
    //                         return;
    //                     console.log(device.raw.join('\n'));
    //                     this.log(`${device.type == "usb-storage" ? `${device.product} ${device.manufacturer} got added as USB Device to the System` : `A ${device.serviceData} device got added`}`, "debug")
    //                     this.SendListener(`${this.ModuleName}.preUSBDeviceConnected`, {
    //                         type: device.type,
    //                         info: {
    //                             product: device.product,
    //                             manufacturer: device.manufacturer,
    //                         },
    //                         remove: () => this.removeUSB(device.bus, device.lev)
    //                     });

    //                 })
    //             } else if (deviceRemoved.length >= 1)
    //             {
    //                 deviceRemoved.forEach((device) =>
    //                 {
    //                     this.log(`${device.type == "usb-storage" ? `${device.product} ${device.manufacturer} got removed from the System` : `A ${device} device got removed`}`, "debug");

    //                     this.SendListener(`${this.ModuleName}.preUSBDeviceDisconnected`, {
    //                         type: device.type,
    //                         info: {
    //                             product: device.product,
    //                             manufacturer: device.manufacturer,
    //                             serviceData: device.serviceData
    //                         },
    //                         remove: () => this.removeUSB(device.bus, device.lev)
    //                     });
    //                 })

    //             } else
    //             {
    //                 this.log(`A Device got Updated`);
    //             }
    //         }
    //         this.lastDevicelist = devicelist;
    //         complete?.();
    //     });

    // }

    // private removeUSB(bus?: string, lev?: string)
    // {
    //     if (bus != undefined && lev != undefined)
    //         exec(`echo 1 > /sys/bus/usb/devices/${Number(bus)}-${Number(lev)}/remove`, console.log);
    // }

    UpdateIfAvailable(): Promise<boolean>
    {
        return new Promise((done) =>
        {
            done(false);
        })
    }


}