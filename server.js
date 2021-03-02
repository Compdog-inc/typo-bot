const Discord = require('discord.js');
const Path = require("path");

const client = new Discord.Client();

const logchId = "806181322451845130";
var logch = null;

var helpResponses = ["Сам знаешь что я делаю!", "Принеси еду, покажу.", "Отстань", "Дай поспать", "Я в туалете, подожди!", "Да достали вы все!\nВот что я делаю:\n1. Тупо Ничего", "Ладно, вот настоящие команды:\n1. /help\n2. /hom [?int]\n3. /carp\n4. /status [?online|idle|invisible|dnd]\n5. /activity [?ACTIVITY-TYPE] [?ACTIVITY-NAME]\n6. /src\n7. /sing [?start|stop]"];
var pingResponses = ["Меня звали?", "Что", "Чего вам надо?", "Я тут!", "Надоел! Дай поесть!", "Замолчи", "...", ":|", "Да...", "Я не хочу идти!", "Error (404): Brain not Found", "Я тебе зачем", "Дай потупить", "Ты тупой?"];

var helpResponsesUsed = [];
var pingResponsesUsed = [];

var connectedVoice = null;

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getPingResponse() {
    if (pingResponsesUsed.length >= pingResponses.length)
        pingResponsesUsed = [];
    var r = randInt(0, pingResponses.length);
    if (pingResponsesUsed.includes(r))
        return getPingResponse();
    pingResponsesUsed.push(r);
    return pingResponses[r];
}

function getHelpResponse() {
    if (helpResponsesUsed.length >= helpResponses.length)
        helpResponsesUsed = [];
    var r = randInt(0, helpResponses.length);
    if (helpResponsesUsed.includes(r))
        return getHelpResponse();
    helpResponsesUsed.push(r);
    return helpResponses[r];
}

function getDefaultEmbed() {
    return new Discord.MessageEmbed()
        .setAuthor("Тупо бот", "https://cdn.discordapp.com/avatars/803658685767352340/064b6a1431fd480f74ea581916c8eb35.png")
        .setTimestamp();
}

function ErrorHandler() {
    this.handleError = function(error) {
        try {
            console.log(error.stack);
            if (logch != null) {
                logch.send(getDefaultEmbed().setColor("#ff0000").setThumbnail("https://cdn0.iconfinder.com/data/icons/shift-free/32/Error-512.png").setTitle("Error: " + error.message).setDescription(error.stack));
            }
        } catch (e) {}
    }
    this.handleRejection = function(reason, p) {
        try {
            console.log(reason.stack);
            if (logch != null) {
                logch.send(getDefaultEmbed().setColor("#ffff00").setThumbnail("https://filebin.net/2j472446yg6fyyja/imageedit_2_2012033721__3___1_.png?t=xghxmjiu").setTitle("Rejection: " + reason.message).setDescription(reason.stack));
            }
        } catch (e) {}
    }
}

const errorHandler = new ErrorHandler();

process.on('uncaughtException', function(error) {
    errorHandler.handleError(error);
});

process.on('unhandledRejection', function(reason, p) {
    errorHandler.handleRejection(reason, p);
});

function smartSplit(string, separator, combiner) {
    var args = string.split(separator);
    var fargs = [];
    var inArg = false;
    var startArgIndex = 0;
    for (var i = 0; i < args.length; i++) {
        if (args[i].startsWith(combiner)) {
            if (i < args.length)
                fargs.push(args[i].substr(combiner.length) + separator);
            else
                fargs.push(args[i].substr(combiner.length));
            if (args[i].endsWith(combiner)) {
                if (i < args.length)
                    fargs[i] = fargs[i].substr(0, fargs[i].length - combiner.length - separator.length);
                else
                    fargs[i] = fargs[i].substr(0, fargs[i].length - combiner.length);
            } else {
                startArgIndex = i;
                inArg = true;
            }
        } else if (args[i].endsWith(combiner)) {
            fargs[startArgIndex] += args[i].substr(0, args[i].length - combiner.length);
            inArg = false;
        } else if (inArg) {
            if (i < args.length)
                fargs[startArgIndex] += args[i] + separator;
            else
                fargs[startArgIndex] += args[i];
        } else {
            fargs.push(args[i]);
        }
    }
    return fargs;
}

function playSong(connection) {
    var dispatcher = connection.play(Path.join(__dirname__, './audio/song.mp3'));
    //dispatcher.on('finish', playSong(connection));
}

client.on('message', function(message) {
    if (message.author == client.user)
        return;

    if (message.mentions.has(client.user)) {
        message.reply(getPingResponse().replace("%USER%", message.author.toString()));
        return;
    }

    if (message.author.bot)
        return;

    /*  if (message.content.startsWith("~")) {
          var args = smartSplit(message.content.substr(1), ' ', '"');
          switch (args[0].toLowerCase()) {
              case "help":
                  message.channel.send(getHelpResponse());
                  break;
              case "hom":
                  var txt = "";
                  if (args.length > 1) {
                      if (args[1].toLowerCase() == "infinity" || args[1].toLowerCase() == "∞")
                          txt += "Hom! ∞"
                      if (args[1].toLowerCase() == "-infinity" || args[1].toLowerCase() == "-∞")
                          txt += "Hom! -∞"
                      else {
                          var n = parseInt(args[1]);
                          if (n == 0)
                              txt += "~~???~~";
                          else if (n < 0 && n >= -396) {
                              txt += "~~";
                              for (var i = 0; i < Math.abs(n); i++) {
                                  txt += "Hom! ";
                              }
                              txt += "~~";
                          } else if (n < -396)
                              txt += "Hom! -∞"
                          else if (n <= 400) {
                              for (var i = 0; i < n; i++) {
                                  txt += "Hom! ";
                              }
                          } else if (n > 400)
                              txt += "Hom! ∞"
                          else
                              txt += "???";
                      }
                  } else
                      txt = "Hom!";
                  message.channel.send(txt);
                  break;
              case "carp":
                  message.channel.send("Вот", {
                      files: [
                          "./images/carp.gif"
                      ]
                  });
                  break;
              case "status":
                  if (args.length > 1) {
                      client.user.setStatus(args[1].toLowerCase());
                  } else {
                      client.user.setStatus('online');
                  }
                  break;
              case "activity":
                  if (args.length > 2) {
                      client.user.setActivity(args[2], { type: args[1].toUpperCase() });
                  } else if (args.length > 1) {
                      client.user.setActivity(args[1], { type: 'PLAYING' });
                  } else {
                      client.user.setActivity();
                  }
                  break;
              case "src":
                  message.reply("https://github.com/Compdog-inc/typo-bot");
                  break;
              case "sing":
                  if (args.length > 1) {
                      if (args[1].toLowerCase() == "stop") {
                          if (connectedVoice) {
                              connectedVoice.disconnect();
                              message.channel.send("Disconnected");
                          } else
                              message.channel.send("Not connected to voice channel.");
                          connectedVoice = null;
                          break;
                      }
                  }
                  if (connectedVoice == null) {
                      if (message.member.voice && message.member.voice.channel) {
                          message.member.voice.channel.join().then(connection => {
                              connectedVoice = connection;
                              message.channel.send("Connected");
                              playSong(connection);
                          }).catch(e => {
                              message.channel.send("Error");
                              console.error(e);
                          });
                      } else {
                          message.channel.send("Join a voice channel first.");
                          break;
                      }
                  } else if (message.member.voice && message.member.voice.channel != connectedVoice) {
                      if (message.member.voice && message.member.voice.channel) {
                          message.member.voice.channel.join().then(connection => {
                              connectedVoice = connection;
                              message.channel.send("Connected");
                              playSong(connection);
                          }).catch(e => {
                              message.channel.send("Error");
                              console.error(e);
                          });
                      } else {
                          message.channel.send("Join a voice channel first.");
                          break;
                      }
                  }
                  break;
          }
      }*/
});

client.ws.on('INTERACTION_CREATE', async interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    switch (command) {
        case "help":
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 3,
                    data: {
                        flags: 64,
                        content: helpResponses[helpResponses.length - 1]
                    }
                }
            });
            break;
        case "hom":
            var txt = "";
            if (args && args.length > 0 && args[0].name === "количество" && args[0].value) {
                var n = parseInt(args[0].value);
                if (n == 0)
                    txt += "~~???~~";
                else if (n < 0 && n >= -396) {
                    txt += "~~";
                    for (var i = 0; i < Math.abs(n); i++) {
                        txt += "Hom! ";
                    }
                    txt += "~~";
                } else if (n < -396)
                    txt += "Hom! -∞"
                else if (n <= 400) {
                    for (var i = 0; i < n; i++) {
                        txt += "Hom! ";
                    }
                } else if (n > 400)
                    txt += "Hom! ∞"
                else
                    txt += "???";
            } else
                txt = "Hom!";
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: txt
                    }
                }
            });
            break;
        case "carp":
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: "Вот:",
                        embeds: [
                            new Discord.MessageEmbed().setImage("http://compdog.tk/public-files/images/carp.gif.fl")
                        ]
                    }
                }
            });
            break;
        case "status":
            if (args && args.length > 0 && args[0].name === "статус" && args[0].value)
                client.user.setStatus(args[0].value.toString().toLowerCase());
            else
                client.user.setStatus('online');

            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 5
                }
            });
            break;
        case "activity":
            if (args && args.length > 0 && args[0].name === "тип" && args[0].value) {
                if (args.length > 1 && args[1].name === "занятие" && args[1].value)
                    client.user.setActivity(args[1].value.toString(), { type: args[0].value.toString().toUpperCase() });
                else
                    client.user.setActivity(args[0].value.toString(), { type: 'PLAYING' });
            } else
                client.user.setActivity();

            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 5
                }
            });
            break;
        case "src":
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 3,
                    data: {
                        flags: 64,
                        content: "https://github.com/Compdog-inc/typo-bot"
                    }
                }
            });
            break;
        case "sing":
            // if (args.length > 1) {
            //     if (args[1].toLowerCase() == "stop") {
            //         if (connectedVoice) {
            //             connectedVoice.disconnect();
            //             message.channel.send("Disconnected");
            //         } else
            //             message.channel.send("Not connected to voice channel.");
            //         connectedVoice = null;
            //         break;
            //     }
            // }
            // if (connectedVoice == null) {
            //     if (message.member.voice && message.member.voice.channel) {
            //         message.member.voice.channel.join().then(connection => {
            //             connectedVoice = connection;
            //             message.channel.send("Connected");
            //             playSong(connection);
            //         }).catch(e => {
            //             message.channel.send("Error");
            //             console.error(e);
            //         });
            //     } else {
            //         message.channel.send("Join a voice channel first.");
            //         break;
            //     }
            // } else if (message.member.voice && message.member.voice.channel != connectedVoice) {
            //     if (message.member.voice && message.member.voice.channel) {
            //         message.member.voice.channel.join().then(connection => {
            //             connectedVoice = connection;
            //             message.channel.send("Connected");
            //             playSong(connection);
            //         }).catch(e => {
            //             message.channel.send("Error");
            //             console.error(e);
            //         });
            //     } else {
            //         message.channel.send("Join a voice channel first.");
            //         break;
            //     }
            // }
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 5
                }
            });
            break;
    }
})

client.on('ready', function() {
    logch = client.channels.resolve(logchId);

    //help command
    client.api.applications(client.user.id).guilds('711937929085452338').commands.post({
        data: {
            name: 'help',
            description: 'Даёт все команды'
        }
    });

    //hom command
    client.api.applications(client.user.id).guilds('711937929085452338').commands.post({
        data: {
            name: 'hom',
            description: 'Пишет Hom!',
            options: [{
                "name": "количество",
                "description": "Сколько 'Hom!' писать, если ничего будет 1",
                "type": 4,
                "required": false
            }]
        }
    });

    //carp command
    client.api.applications(client.user.id).guilds('711937929085452338').commands.post({
        data: {
            name: 'carp',
            description: 'Посылает карася'
        }
    });

    //status command
    client.api.applications(client.user.id).guilds('711937929085452338').commands.post({
        data: {
            name: 'status',
            description: 'Меняет статус бота',
            options: [{
                "name": "статус",
                "description": "Новый статус бота, если ничего, то online",
                "type": 3,
                "required": false,
                choices: [{
                        name: "online",
                        value: "online"
                    },
                    {
                        name: "idle",
                        value: "idle"
                    },
                    {
                        name: "invisible",
                        value: "invisible"
                    },
                    {
                        name: "dnd",
                        value: "dnd"
                    }
                ]
            }]
        }
    });

    //activity command
    client.api.applications(client.user.id).guilds('711937929085452338').commands.post({
        data: {
            name: 'activity',
            description: 'Меняет занятие бота',
            options: [{
                "name": "тип",
                "description": "Тип занятие",
                "type": 3,
                "required": true,
                choices: [{
                        name: "playing",
                        value: "playing"
                    },
                    {
                        name: "watching",
                        value: "watching"
                    },
                    {
                        name: "listening",
                        value: "listening"
                    }
                ]
            }, {
                "name": "занятие",
                "description": "Само занятие",
                "type": 3,
                "required": true
            }]
        }
    });

    //src command
    client.api.applications(client.user.id).guilds('711937929085452338').commands.post({
        data: {
            name: 'src',
            description: 'Даёт ссылку на код бота'
        }
    });

    //sing command
    client.api.applications(client.user.id).guilds('711937929085452338').commands.post({
        data: {
            name: 'sing',
            description: 'Заставляет бота петь',
            options: [{
                    "name": "start",
                    "description": "Начать петь",
                    "type": 1
                },
                {
                    "name": "stop",
                    "description": "Прекратить петь",
                    "type": 1
                }
            ]
        }
    });

    console.log("Ready");
});

client.login(process.env.TOKEN);