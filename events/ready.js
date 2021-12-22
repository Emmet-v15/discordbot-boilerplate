const logger = require("../modules/Logger.js");
const { getSetting } = require("../modules/functions.js");
module.exports = async client => {
  logger.log(`${client.user.tag}, ready to serve ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} users in ${client.guilds.cache.size} servers.`, "ready");
  
  client.user.setActivity(`${getSetting("prefix")}help`, { type: "ONLINE" });
};
