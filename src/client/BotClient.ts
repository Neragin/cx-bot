import {AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler} from "discord-akairo";
import {join} from "path";
import {owners, prefix} from "../config";

declare module "discord-akairo" {

    interface AkairoClient {
        commandHandler: CommandHandler;
        listenerHandler: ListenerHandler;
    }
}

interface BotOptions {
    token: string;
    owners: string;
}

export default class BotClient extends AkairoClient {
    public config: BotOptions;
    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, "..", "listeners")
    })
    public commandHandler: CommandHandler = new CommandHandler(this, {
        directory: join(__dirname, "..", "commands"),
        prefix: prefix,
        allowMention: true,
        handleEdits: true,
        commandUtil: true,
        commandUtilLifetime: 3e5,
        defaultCooldown: 0,
        argumentDefaults: {
            prompt: {
                modifyStart: (_, str): string => `${str}\n\nType \`cancel\` to cancel the command`,
                modifyRetry: (_, str): string => `${str}\n\nType \`cancel\` to cancel the command`,
                timeout: "You took too long, and the command has been cancelled",
                ended: "You exceeded the maximum amount of tries, so the command has been cancelled",
                cancel: "This command has been cancelled",
                retries: 3,
                time: 1e4,
            },
            otherwise: "",
        },
        ignorePermissions: owners,
    });
    public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
        directory: join(__dirname, "..", "inhibitors")
    })

    public constructor(config: BotOptions) {
        super({
            ownerID: config.owners,
        });

        this.config = config;
    }

    public async start(): Promise<string> {
        await this._init();
        return this.login(this.config.token);
    }

    private async _init(): Promise<void> {
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler,
            process,
        });

        this.commandHandler.loadAll();
        this.listenerHandler.loadAll();
        this.inhibitorHandler.loadAll();
    }
}