import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from "discord-akairo";
import {Snowflake} from "discord.js"
import {join} from "path";
import {owners, prefix} from "@config/config";

declare module "discord-akairo" {

  interface AkairoClient {
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
  }
}

interface BotOptions {
  token: string;
  owners: Snowflake;
}

export default class CxClient extends AkairoClient {
  public config: BotOptions;
  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, "..", "listeners"),
  })
  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(__dirname, "..", "commands"),
    prefix: prefix,
    allowMention: true,
    handleEdits: true,
    commandUtil: true,
    commandUtilLifetime: 3e5,
    defaultCooldown: 3e5,
    ignorePermissions: owners,
    ignoreCooldown: owners,
  });
  public inhibitorHandler = new InhibitorHandler(this, {
    directory: join(__dirname, "..", "inhibitors"),
  })

  public constructor(config: BotOptions) {
    super({
      ownerID: config.owners,
      intents: ["DIRECT_MESSAGES", "GUILDS", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_INVITES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"],
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
