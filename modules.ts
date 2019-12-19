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


    protected log(message: string = "", type: "info" | "warn" | "error" | "debug" = "info")
    {
        console.log(`${type == "info" ? "✅" : type == "warn" ? "🔥" : type == "debug" ? "🚧" : "🚨🚨🚨"}  [${this.ModuleName.split('.')[ 1 ]}] ${message}`);
    }

    public PreInitiation(): Promise<void>
    {
        return new Promise((done) => done());
    };

    public Initiation(): Promise<void>
    {
        return new Promise((done) => done());
    };

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

    public StartModule()
    {
        this.log('Module Loaded... (Remove This)', "debug");
    }
}