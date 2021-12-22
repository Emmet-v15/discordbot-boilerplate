const { codeBlock } = require("@discordjs/builders");
const { getSetting, toProperCase } = require("../modules/functions.js");

exports.run = (client, message, args, level) => {
  const { container } = client;
  if (!args[0]) {
      
    const myCommands = message.guild ? container.commands.filter(cmd => container.levelCache[cmd.conf.permLevel] <= level) :
      container.commands.filter(cmd => container.levelCache[cmd.conf.permLevel] <= level && cmd.conf.guildOnly !== true);

    const enabledCommands = myCommands.filter(cmd => cmd.conf.enabled);

    const commandNames = [...enabledCommands.keys()];

    const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

    let currentCategory = "";
    let output = `= Command List =\n[Use ${getSetting("prefix")}help <commandname> for details]\n`;
    const sorted = enabledCommands.sort((p, c) => p.help.category > c.help.category ? 1 : 
      p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1 );

    sorted.forEach( c => {
      const cat = toProperCase(c.help.category);
      if (currentCategory !== cat) {
        output += `\u200b\n== ${cat} ==\n`;
        currentCategory = cat;
      }
      output += `${getSetting("prefix")}${c.help.name}${" ".repeat(longest - c.help.name.length)} :: ${c.help.description}\n`;
    });
    message.channel.send(codeBlock("asciidoc", output));

  } else {
    let command = args[0];
    if (container.commands.has(command) || container.commands.has(container.aliases.get(command))) {
      command = container.commands.get(command) ?? container.commands.get(container.aliases.get(command));
      if (level < container.levelCache[command.conf.permLevel]) return;
      message.channel.send(codeBlock("asciidoc", `= ${command.help.name} = \n${command.help.description}\nusage:: ${command.help.usage}\naliases:: ${command.conf.aliases.join(", ")}`));
    } else return message.channel.send("No command with that name, or alias exists.");
  }};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["h", "halp"],
  permLevel: "Member"
};

exports.help = {
  name: "help",
  category: "System",
  description: "Displays all the available commands for your permission level.",
  usage: "help [command]"
};