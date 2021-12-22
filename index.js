if (Number(process.version.slice(1).split(".")[0]) < 16)
    throw new Error(
        "Node 16.x or higher is required. Update Node on your system."
    );
require("dotenv").config();

const { Intents, Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const logger = require("./modules/Logger.js");
const { permLevels } = require("./config.js");
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
    ],
    partials: ["CHANNEL"],
});

logger.log("Starting...", "log");

const commands = new Collection();
const aliases = new Collection();
const slashcmds = new Collection();
const levelCache = {};
permLevels.map((perm) => { levelCache[perm.name] = perm.level })

client.container = {
    commands,
    aliases,
    slashcmds,
    levelCache
};


(async () => {
    const commands = readdirSync("./commands/").filter((file) =>
        file.endsWith(".js")
    );
    for (const file of commands) {
        const props = require(`./commands/${file}`);
        logger.log(`Loading Command: ${props.help.name}. 👌`, "log");
        client.container.commands.set(props.help.name, props);
        props.conf.aliases.forEach((alias) => {
            client.container.aliases.set(alias, props.help.name);
        });
    }

    const slashFiles = readdirSync("./slash").filter((file) =>
        file.endsWith(".js")
    );
    for (const file of slashFiles) {
        const command = require(`./slash/${file}`);
        const commandName = file.split(".")[0];
        logger.log(`Loading Slash command: ${commandName}. 👌`, "log");
        client.container.slashcmds.set(command.commandData.name, command);
    }

    const eventFiles = readdirSync("./events/").filter((file) =>
        file.endsWith(".js")
    );
    for (const file of eventFiles) {
        const eventName = file.split(".")[0];
        logger.log(`Loading Event: ${eventName}. 👌`, "log");
        const event = require(`./events/${file}`);
        client.on(eventName, event.bind(null, client));
    }

    client.on("threadCreate", (thread) => thread.join());
    client.login();
})();