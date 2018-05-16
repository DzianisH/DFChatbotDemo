'use strict';

const apiAi = require("apiai");
const botClient = apiAi("f56eb6f2557540158b57f6d08cf37e41");
const intentHandlers = {};
require('./dictionary')(intentHandlers);

const middleware = (req, res, next) => {
    const question = req.body.question;
    if (!question) {
        next(new Error("Field `question` is required"));
    } else {
        let sessionId = req.session.id;
        if(!sessionId){
            console.warn("Session ID is undefined!");
            sessionId = Math.random().toString(16);
        }
        try {
            sendRequest(question, sessionId, res, next);
        } catch (e) {
            console.error(e);
            next(new Error("Unexpected error occurred"));
        }
    }
};

function sendRequest(text, sessionId, res, next) {
    const botRq = botClient.textRequest(text, {sessionId: sessionId});
    botRq.on('response', botRs => {
        console.log("Bot request: `" + text + "`, session: `" + sessionId + "`, response: " + JSON.stringify(botRs));

        handleBotResponse(botRs, handlerRs => res.send({answer: handlerRs}));
    });
    botRq.on('error', botErr => {
        console.error(botErr);
        next(new Error("Error calling bot backend"))
    });
    botRq.end();
}

function handleBotResponse(botRs, callback){
    const handler = intentHandlers[botRs.result.metadata.intentName] || defaultHandler;
    handler(botRs, callback)
}

function defaultHandler(botRs, callback){
    callback(botRs.result.fulfillment.speech);
}


module.exports = (app) => {
    app.post('/bot', middleware);
};