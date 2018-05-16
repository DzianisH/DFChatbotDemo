'use strict';

const apiAi = require("apiai");
const TelegramBot = require('node-telegram-bot-api');
const botClient = apiAi("f56eb6f2557540158b57f6d08cf37e41");
const tBot = new TelegramBot("560719868:AAGppSPEY2WsdbX8WZRZt-MDPZwaOAU7LJs", {polling: true});
const intentHandlers = {};
require('./dictionary')(intentHandlers);
const isRqToBotRgxp = /(@tetete111Bot)|(bot)/;
const removeBotRgxp = /[\\s,!]*(@tetete111Bot)|(bot)[\\s,!]*/;
const listenerRgxp = /.+/;

const middleware = (req, res, next) => {
    const question = req.body.question;
    if (!question) {
        next(new Error("Field `question` is required"));
    } else {
        let sessionId = req.session.id;
        if (!sessionId) {
            console.warn("Session ID is undefined!");
            sessionId = Math.random().toString(16);
        }
        try {
            sendRequest(question, sessionId, handlerRs => res.send({answer: handlerRs}), next);
        } catch (e) {
            console.error(e);
            next(new Error("Unexpected error occurred"));
        }
    }
};

const telegramHook = (msg, matches) => {
    const chatId = msg.chat.id;

    let text = msg.text;
    let shouldAnsw = msg.chat.type === "private";
    if (isRqToBotRgxp.test(text)) {
        text = text.replace(removeBotRgxp, ' ').trim();
        shouldAnsw = true;
    }
    if (shouldAnsw) {
        console.log(text);
        if (text === "stop") {
            tBot.removeAllListeners();
            tBot.removeTextListener(listenerRgxp);
        } else {
            sendRequest(text, chatId,
                rs => tBot.sendMessage(chatId, rs),
                () => tBot.sendMessage(chatId, 'Some unexpected error appeared')
            );
        }
    }
};

function sendRequest(text, sessionId, accept, reject) {
    const botRq = botClient.textRequest(text, {sessionId: sessionId});
    botRq.on('response', botRs => {
        console.log("Bot request: `" + text + "`, session: `" + sessionId + "`, response: " + JSON.stringify(botRs));

        handleBotResponse(botRs, accept);
    });
    botRq.on('error', botErr => {
        console.error(botErr);
        reject(new Error("Error calling bot backend"))
    });
    botRq.end();
}

function handleBotResponse(botRs, callback) {
    const handler = intentHandlers[botRs.result.metadata.intentName] || defaultHandler;
    handler(botRs, callback)
}

function defaultHandler(botRs, callback) {
    callback(botRs.result.fulfillment.speech);
}


module.exports = (app) => {
    app.post('/bot', middleware);
};


tBot.onText(listenerRgxp, telegramHook);


//heroku maintenance:on
//heroku maintenance:off