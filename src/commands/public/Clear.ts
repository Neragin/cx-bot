import {Command} from "discord-akairo";
import {DMChannel, Message, MessageEmbed, TextChannel} from "discord.js";

export default class Clear extends Command{
    public constructor() {
        super("clear", {
            aliases: ["clear"],
            category: "Public Commands",
            description: {
                content: "Clears the amount of messages specified",
                usage: "clear [amount]",
                examples: [
                    "clear",
                    "clear [amount]",
                ]
            },
            args: [{
                    id: "amount",
                    type: "integer",
                    default: 0,
                },
            ]
        });
    }

    public async exec(message: Message, {amount}: {amount: number}): Promise<void | Message>  {
        if (message.channel instanceof TextChannel) {
            await message.channel.bulkDelete(amount);
            return ;
        }
        else {
            return message.util.send("You can't clear messages not in a TextChannel");
        }

    }
}