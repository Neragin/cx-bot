import {Command} from "discord-akairo";
import {Message, MessageEmbed} from "discord.js";

export default class EvalCommand extends Command {
    public constructor() {
        super("eval", {
            ownerOnly: true,
            category: "Owner",
            aliases: ["eval", "ev"],
            args: [{
                id: "javascript",
                type: "string",
                match: "rest",
            }]
        });
    }

    public async exec(message: Message, {javascript}: {javascript: string}): Promise<Message> {
        let start = process.hrtime();
        let result: any = null;
        if(javascript.startsWith('```') && javascript.endsWith('```')) {
            javascript = javascript.replace(/(^.*?\s)|(\n.*$)/g, '');
        }
        try {
            result = eval(javascript);
        }
        catch (e) {
            return message.util.send(`Error while evaluating ${e}`)
        }
        let endtime = process.hrtime(start);
        let embed = new MessageEmbed();
        embed.setDescription(`Evaluated Output: ${result}`);
        embed.setFooter(`time taken: ${endtime}`)
        return message.util.send(embed);

    }
}