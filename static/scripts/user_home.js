/**
 * On click send.
 */
document.getElementById("button_send_message").addEventListener("click", function (elem, event) {
    const destname = document.getElementById("input_destname").value
    const messageText = document.getElementById("input_message_text").value
    document.getElementById("input_destname").value = ""
    document.getElementById("input_message_text").value = ""

    // if sending msg to smn other than self, display own msg.
    if (destname != getCookie("username")) {
        messages.push({ sendername: "myself", message_text: messageText, date: new Date().toString().split("GMT")[0], signature: "" })
    }

    uploadMessage(destname, messageText)
})


/**
 * Display messages.
 */
function displayMessages() {
    const div_inbox = document.getElementById("div_inbox")
    div_inbox.innerHTML = ""
    for (let message of messages) {
        div_inbox.innerHTML += `<p>${message.date}\n\n${message.signature}\n${message.sendername}: ${message.message_text}</p>`
    }
}


/**
 * Download incoming messages.
 */
function checkForMessages() {
    const millisecs = 2000
    setTimeout(checkForMessages, millisecs);

    downloadMessages()

        .then((res) => { return res.json(); })

        .then((data) => {
            for (let message of data) {

                let decryptionRes = cryptico.decrypt(message["message_text"], myKeyPair);
                let messageText = decryptionRes.plaintext;
                let signature = decryptionRes.signature;
                let date = new Date(message["timestamp"] * 1000).toLocaleDateString("en-US", options);

                messages.push({ sendername: message.sendername, date: date, signature: signature, message_text: messageText })
            }
        }).then(function () {
            displayMessages()

        })

    displayMessages()
}


/**
 * Onload init.
 */
window.addEventListener("load", function () {
    window.messages = []
    window.myKeyPair = cryptico.generateRSAKey(getCookie("password"), 1024);
    window.options = { year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric" };
    checkForMessages()
})




// storage = (function () {
//     let messages = [];
//     return function () {
//     }
// })();



