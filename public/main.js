$(function () {
    const historyElm = $("#message-history");
    const newMsgElm = $("#message-new");
    const sendBtn = $("#button-send");

    sendBtn.click(function () {
        sendMessage();
    });

    newMsgElm.keydown(function (e) {
        if (e.ctrlKey && e.keyCode === 13) { // Ctrl-Enter pressed
            sendMessage()
        }
    });


    function sendMessage() {
        const message = newMsgElm.val().trim();
        if (message.length === 0) return;

        console.log(message);
        addMessage("You: " + message);
        newMsgElm.val("");

        postJSON("/bot", {
            question: message
        }, function (data, status) {
            console.log("Received status: " + status);
            addMessage("Bot: " + data.answer)
        })
    }

    function postJSON(url, data, onSuccess, onFail) {
        return jQuery.ajax({
            'type': 'POST',
            'url': url,
            'contentType': 'application/json',
            'data': JSON.stringify(data),
            'dataType': 'json',
            'success': onSuccess,
            'fail': onFail
        });
    }

    function addMessage(msg) {
        historyElm.append("<div>" + msg + "</div>")
    }

});