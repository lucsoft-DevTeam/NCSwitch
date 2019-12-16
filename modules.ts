import EventEmitter from 'events';
class NCSEmittier extends EventEmitter { }

const NCSEmit = new NCSEmittier();

export enum NCSModuleType
{
    OfflineModule,
    UserModule,
    OnlineModule
}

export abstract class NCSModule
{
    /**
     * shoude be named like creator.modulename
     */
    abstract readonly ModuleName: string;

    abstract readonly ModuleType: NCSModuleType;

    abstract readonly RequiesReboot: boolean;


    protected log(message: string, type: "info" | "warn" | "error" = "info")
    {
        console.log(`${type == "info" ? "✅" : type == "warn" ? "🔥" : "🚨🚨🚨"}  [${this.ModuleName}] ${message}`);
    }

    protected abstract PreInitiation(): void;

    protected abstract Initiation(): void;

    protected abstract UpdateIfAvailable(): Promise<boolean>;

    /**
     * Communicate with other Modules
     * @param type The Suffix of youre module name
     */
    protected createListener(type: string = "default", action: Function)
    {
        NCSEmit.on(`${this.ModuleName}.${type}`, () => action());
    }

    protected SendListener(listener: string, args: string | object | boolean)
    {
        NCSEmit.emit(listener, args);
    }

    public Loaded()
    {
        this.log('Module Loaded...');
    }
}