const apiAi = require("apiai");

const botClient = apiAi("f56eb6f2557540158b57f6d08cf37e41");

module.exports =  (req, res, next) => {
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
        res.send({answer: botRs.result.fulfillment.speech});
    });
    botRq.on('error', botErr => {
        console.error(botErr);
        next(new Error("Error calling bot backend"))
    });
    botRq.end();
}
