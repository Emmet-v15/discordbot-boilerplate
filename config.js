const config = {
  permLevels: [
    { level: 0,
      name: "Member", 
      check: () => true
    },

    { level: 2,
      name: "Donator",
      check: (message) => {
        try {
          const modRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === message.settings.modRole.toLowerCase());
          if (modRole && message.member.roles.cache.has(modRole.id)) return true;
        } catch (e) {
          return false;
        }
      }
    },

    { level: 3,
      name: "Administrator", 
      check: (message) => {
        try {
          const adminRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === message.settings.adminRole.toLowerCase());
          return (adminRole && message.member.roles.cache.has(adminRole.id));
        } catch (e) {
          return false;
        }
      }
    },
    
    { level: 4,
      name: "Owner", 
      check: (message) => {
        const serverOwner = message.author ?? message.user;
        return message.guild?.ownerId === serverOwner.id;
      }
    },
  ]
};

module.exports = config;
