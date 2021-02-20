const Discord = require('discord.js');

const client = new Discord.Client();

const logchId = "806181322451845130";
var logch = null;

var helpResponses = ["Сам знаешь что я делаю!", "Принеси еду, покажу.", "Отстань", "Дай поспать", "Я в туалете, подожди!", "Да достали вы все!\nВот что я делаю:\n1. Тупо Ничего", "Ладно, вот настояшии команды:\n1. ~help\n2. ~hom [?int]\n3. ~carp"];

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

client.on('message', function(message) {
    if (message.author.bot)
        return;

    if (message.content.startsWith("~")) {
        var args = message.content.split(' ');
        args[0] = args[0].substr(1);
        switch (args[0].toLowerCase()) {
            case "help":
                message.channel.send(helpResponses[randInt(0, helpResponses.length - 1)]);
                break;
            case "hom":
                var txt = "";
                if (args.length > 1) {
                    if (args[1].toLowerCase() == "infinity" || args[1].toLowerCase() == "∞") {
                        txt += "Hom! ∞"
                    } else {
                        for (var i = 0; i < parseInt(args[1]); i++) {
                            txt += "Hom! ";
                        }
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
        }
    }
});

client.on('ready', function() {
    logch = client.channels.resolve(logchId);
    console.log("Ready");
});

client.login(process.env.TOKEN);