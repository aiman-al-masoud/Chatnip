/**
 * On click send.
 */
document.getElementById("button_send_message").addEventListener("click", function (elem, event) {
    const destname = document.getElementById("input_destname").value
    const messageText = document.getElementById("input_message_text").value
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

    const currentChat = document.getElementById("input_destname").value;
    const div_inbox = document.getElementById("div_inbox")
    
    document.getElementById("title_one").innerHTML = currentChat //set title to name of chat

    if(div_inbox.childElementCount==  messages.length){ //instead of messages.length, lenght of messages in CURRENT CHAT
        return;
    }

    div_inbox.innerHTML = ""
    for (let message of messages) {
        if(message.sendername==currentChat ||  message.sendername=="myself"){
            div_inbox.appendChild(ChatMsg(message))
        }
    }
}


/**
 * Download incoming messages.
 * Recursive function that calls itself every n milliseconds.
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
    window.myKeyPair = cryptico.generateRSAKey(localStorage.getItem("password"), parseInt(localStorage.getItem("bits")));
    window.options = { year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric" };
    checkForMessages()
})


/**
 * The name says it all.
 * @param {string} htmlString 
 * @returns 
 */
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div
}

/**
 * Creates an element to display the name of a chat.
 * @param {string} name 
 * @returns 
 */
function ChatName(name) {
    let html = `
    <div class="chat_name">
    <a onclick="displayChatByName('${name}')"  href="">${name}</a>
    </div>
    `
    return createElementFromHTML(html)
}


/**
 * Create an element to display a message from a chat.
 * @param {object} message 
 * @returns 
 */
function ChatMsg(message) {

    let signature = message.signature

    //useful constants 
    const v = "verified"; const f = "forged"; const u = "unsigned";
    const v_img = document.getElementById("verified").src; const f_img = document.getElementById("forged").src; const u_img = document.getElementById("unsigned").src;
    const v_txt = "This message was duly verified"; const f_txt = "Caution! This message is forged!"; const u_txt = "This message wasn't signed. Could be forged.";

    let html = `
    <div class="chat_msg">
    
    <h2>${message.message_text}</h2>

    <p>${message.date}</p>
    
    <p> from: ${message.sendername}</p>
    <img  src="${signature == v ? v_img : (signature == f ? f_img : u_img)}"
          title= "${signature == v ? v_txt : (signature == f ? f_txt : u_txt)}"
          width="50"
    ></img>

    </div>
    `
    return createElementFromHTML(html)
}

function displayChatByName(name){
    alert(name)//TOREMOVE OFC
    //  TODO
}
