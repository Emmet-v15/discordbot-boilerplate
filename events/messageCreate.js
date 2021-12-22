const logger = require("../modules/Logger.js");
const { getSetting, permlevel } = require("../modules/functions.js");
const config = require("../config.js");


module.exports = async (client, message) => {
  const { container } = client;
  if (message.author.bot) return;

  const prefixMention = new RegExp(`^<@!?${client.user.id}> ?$`);
  if (message.content.match(prefixMention)) {
    return message.reply(`My prefix on this guild is \`${getSetting("prefix")}\``);
  }

  const prefix = new RegExp(`^<@!?${client.user.id}> |^\\${getSetting("prefix")}`).exec(message.content);

  if (!prefix) return;

  const args = message.content.slice(prefix[0].length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();


  if (message.guild && !message.member) await message.guild.members.fetch(message.author);
  const level = permlevel(message);

  const cmd = container.commands.get(command) || container.commands.get(container.aliases.get(command));
  if (!cmd) return;

  if (cmd && !message.guild && cmd.conf.guildOnly)
    return message.channel.send("This command is unavailable via private message. Please run this command at EvoV3.");

  if (!cmd.conf.enabled) return;

  if (level < container.levelCache[cmd.conf.permLevel]) {
    if (getSetting("systemNotice") === "true") {
      return message.channel.send(`You do not have permission to use this command.
Your permission level is ${level} (${config.permLevels.find(l => l.level === level).name})
This command requires level ${container.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
    } else {
      return;
    }
  }
  
  message.flags = [];
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1));
  }

  try {
    await cmd.run(client, message, args, level);
    logger.log(`${config.permLevels.find(l => l.level === level).name} ${message.author.id} ran command ${cmd.help.name}`, "cmd");
  } catch (e) {
    console.error(e);
    message.channel.send({ content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\`` })
      .catch(e => console.error("An error occurred replying on an error (the fuck happened?)", e));
  }
};
